const { app, ipcMain, session } = require('electron');
const { isDev } = require('./config');
const { attachShortcutInterception } = require('./navigationShortcuts');
const PermissionManager = require('./PermissionManager');
const { getHistoryManager } = require('./HistoryManager');

// Permissões que fazem sentido perguntar ao usuário para um navegador de
// propósito geral. Qualquer outra (hid, usb, serial, window-management...)
// é negada por padrão - são hardware/APIs raras e de risco maior, sem UI
// dedicada pra explicar o pedido, então o mais seguro é recusar.
const PROMPTABLE_PERMISSIONS = new Set([
  'media',
  'geolocation',
  'notifications',
  'midiSysex',
  'clipboard-read'
]);

// Permissões editáveis na tela de permissões do site (SiteInfoPopover /
// PermissionsSettingsTab): as nativas do Chromium acima, mais o bloqueio de
// pop-ups. "popups" nunca passa por setPermissionRequestHandler (não é uma
// permissão real do Electron/Chromium) - mora aqui só porque reaproveita o
// mesmo armazenamento (origem, nome) -> decisão do PermissionManager.
const SITE_PERMISSION_TYPES = new Set([...PROMPTABLE_PERMISSIONS, 'popups']);

// Lembra a decisão do usuário por (origem, permissão), persistido em disco
// (ver PermissionManager) - sobrevive a reiniciar o app. Instanciado só na
// primeira vez que é preciso (o construtor chama app.getPath, que precisa do
// app já inicializado) e compartilhado entre setupPermissionHandler e
// setupSiteInfoHandlers.
let permissionManagerInstance = null;
const getPermissionManager = () => {
  if (!permissionManagerInstance) {
    permissionManagerInstance = new PermissionManager();
  }
  return permissionManagerInstance;
};

let permissionRequestCounter = 0;

const safeOrigin = (url) => {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
};

// Esquemas permitidos para navegação dentro de uma webview, durante toda a
// sessão (não só no `src` inicial). `about:` cobre o `about:blank` interno
// usado pelo próprio Electron/Chromium em estados transitórios - nunca é
// usado pra conteúdo real.
const ALLOWED_WEBVIEW_NAVIGATION_PROTOCOLS = new Set(['http:', 'https:', 'about:']);

const isWebviewNavigationAllowed = (url) => {
  try {
    return ALLOWED_WEBVIEW_NAVIGATION_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
};

/**
 * Encontra o data-tab-id da <webview> cujo conteúdo corresponde à URL dada,
 * procurando no DOM do renderer - usado tanto pelo "abrir link em nova aba"
 * do menu de contexto quanto pelo bloqueio de pop-ups (quando o usuário
 * permite pop-ups pra um site, o pop-up abre como uma nova aba no mesmo
 * tabset da aba que o originou, em vez de uma janela nativa de verdade).
 */
function findSourceTabId(mainWindow, contentsUrl) {
  if (!mainWindow || !mainWindow.webContents) return Promise.resolve(null);

  const currentUrlJson = JSON.stringify(contentsUrl);
  return mainWindow.webContents.executeJavaScript(`
    (function() {
      const webviews = document.querySelectorAll('webview');
      const currentUrl = ${currentUrlJson};
      for (let i = 0; i < webviews.length; i++) {
        const webview = webviews[i];
        const tabId = webview.getAttribute('data-tab-id');
        if (webview.src === currentUrl || (webview.getURL && webview.getURL() === currentUrl)) {
          return tabId;
        }
      }
      return null;
    })();
  `).catch((error) => {
    console.error('Erro ao localizar aba de origem:', error);
    return null;
  });
}

/**
 * Abre um pop-up permitido pelo usuário como uma nova aba do próprio Flex
 * Navigator, em vez de uma janela nativa do SO (consistente com o resto do
 * app, que não usa BrowserWindow para abas).
 */
async function openPopupAsNewTab(mainWindow, contents, url) {
  if (!mainWindow || !mainWindow.webContents) return;
  const sourceTabId = await findSourceTabId(mainWindow, contents.getURL());
  mainWindow.webContents.send('add-new-tab', sourceTabId ? { url, sourceTabId } : { url });
}

/**
 * Intercepta pedidos de permissão (câmera/mic, geolocalização, notificações
 * etc.) feitos por sites carregados nas webviews e repassa para o renderer
 * decidir via um modal (ver PermissionRequestManager), em vez de aceitar o
 * comportamento padrão do Electron.
 */
function setupPermissionHandler(mainWindow) {
  const webviewSession = session.fromPartition('persist:webview');
  const permissionManager = getPermissionManager();

  webviewSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    if (!PROMPTABLE_PERMISSIONS.has(permission)) {
      callback(false);
      return;
    }

    const origin = safeOrigin(details.requestingUrl);
    const existingDecision = permissionManager.getDecision(origin, permission);

    if (existingDecision !== null) {
      callback(existingDecision);
      return;
    }

    if (!mainWindow || mainWindow.isDestroyed()) {
      callback(false);
      return;
    }

    const requestId = `perm-${++permissionRequestCounter}`;

    const handleResponse = (event, response) => {
      if (!response || response.requestId !== requestId) return;
      ipcMain.removeListener('permission-response', handleResponse);
      permissionManager.setDecision(origin, permission, response.granted);
      callback(response.granted);
    };

    ipcMain.on('permission-response', handleResponse);

    mainWindow.webContents.send('permission-request', {
      requestId,
      permission,
      origin,
      mediaTypes: details.mediaTypes || null
    });
  });

  // Usado pelo Chromium para checagens síncronas de estado (ex.: código da
  // página perguntando "já tenho essa permissão?" fora do fluxo de request).
  // Reflete só o que já foi decidido acima - nunca abre um modal aqui.
  webviewSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (!PROMPTABLE_PERMISSIONS.has(permission)) return false;
    return permissionManager.getDecision(requestingOrigin, permission) || false;
  });

  // Handlers pra tela de gerenciamento de permissões nas Configurações
  ipcMain.handle('list-site-permissions', () => permissionManager.listSites());

  ipcMain.on('remove-site-permissions', (event, origin) => {
    permissionManager.removeSite(origin);
  });
}

// Certificado TLS visto por último em cada hostname, pra alimentar o popover
// de informações do site. Só em memória, igual às decisões de permissão.
const certificatesByHost = new Map();

/**
 * Captura o certificado TLS de cada navegação https na webview (sem alterar
 * a decisão de confiança - `callback(-3)` sempre usa o resultado padrão do
 * Chromium) e expõe pro renderer via IPC os dados do certificado + o estado
 * atual das permissões do site, pro popover de informações do site
 * (ícone do globo na barra de URL).
 */
function setupSiteInfoHandlers() {
  const webviewSession = session.fromPartition('persist:webview');

  webviewSession.setCertificateVerifyProc((request, callback) => {
    const { hostname, certificate, verificationResult, isIssuedByKnownRoot } = request;
    certificatesByHost.set(hostname, {
      subject: certificate.subject,
      issuer: certificate.issuer,
      validStart: certificate.validStart,
      validExpiry: certificate.validExpiry,
      fingerprint: certificate.fingerprint,
      isIssuedByKnownRoot,
      verificationResult
    });
    // -3 = usar o resultado de verificação padrão do Chromium. Só estamos
    // observando o certificado pra exibir informação, nunca decidindo se ele
    // é confiável ou não.
    callback(-3);
  });

  const permissionManager = getPermissionManager();

  ipcMain.handle('get-site-info', (event, urlString) => {
    let parsed;
    try {
      parsed = new URL(urlString);
    } catch {
      return { url: urlString, origin: null, hostname: null, protocol: null, certificate: null, permissions: [] };
    }

    const permissions = Array.from(SITE_PERMISSION_TYPES).map((permission) => ({
      permission,
      granted: permissionManager.getDecision(parsed.origin, permission)
    }));

    return {
      url: urlString,
      origin: parsed.origin,
      hostname: parsed.hostname,
      protocol: parsed.protocol,
      certificate: certificatesByHost.get(parsed.hostname) || null,
      permissions
    };
  });

  ipcMain.on('set-site-permission', (event, { origin, permission, granted }) => {
    if (!origin || !SITE_PERMISSION_TYPES.has(permission)) return;
    if (granted === null) {
      // "Esquecer" a decisão - o site volta a poder perguntar normalmente.
      permissionManager.resetDecision(origin, permission);
    } else {
      permissionManager.setDecision(origin, permission, granted);
    }
  });
}

/**
 * Configura comportamentos para webviews e context menus
 */
function setupWebContentsHandlers(mainWindow) {
  // Allow loading any external URLs and enable webviews
  app.on('web-contents-created', async (event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (contents.getType() === 'webview') {
        // Bloqueio de pop-ups configurável por site (estilo Chrome): por
        // padrão (nenhuma decisão salva) um pop-up é bloqueado
        // silenciosamente. O usuário pode permitir sempre um site
        // específico no popover de informações do site (ícone de globo) ou
        // em Configurações > Permissões - nesse caso o pop-up abre como
        // uma nova aba do próprio Flex Navigator.
        if (!isWebviewNavigationAllowed(url)) {
          console.warn('Pop-up bloqueado (protocolo não permitido):', url);
          return { action: 'deny' };
        }

        const origin = safeOrigin(contents.getURL());
        const popupsAllowed = getPermissionManager().getDecision(origin, 'popups') === true;

        if (popupsAllowed) {
          openPopupAsNewTab(mainWindow, contents, url);
        } else {
          console.warn('Pop-up bloqueado (bloqueio de pop-ups ativo para', origin + '):', url);
        }
        return { action: 'deny' };
      }

      // Contents que não são webview (ex.: a própria janela principal) não
      // deveriam abrir pop-ups de verdade; navega no lugar se o protocolo
      // for seguro, só por segurança (`contents.loadURL` chamado pelo
      // processo principal não passa pelo handler de 'will-navigate'
      // abaixo, que só dispara para navegação iniciada pelo próprio
      // renderer).
      if (isWebviewNavigationAllowed(url)) {
        contents.loadURL(url);
      } else {
        console.warn('Pop-up bloqueado (protocolo não permitido):', url);
      }
      return { action: 'deny' };
    });
    
    // Enable webview
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      delete webPreferences.preload;
      delete webPreferences.preloadURL;

      // Disable Node.js integration
      webPreferences.nodeIntegration = false;
      
      // Verify URL being loaded
      if (!params.src.startsWith('https://') && !params.src.startsWith('http://')) {
        event.preventDefault();
      }
    });

    // Configure context menu for webview contents specifically
    if (contents.getType() === 'webview') {
      // Restringe a navegação da webview a http(s) durante toda a sessão -
      // `will-attach-webview` acima só cobre o `src` inicial; sem isso, um
      // link, redirect ou JS da própria página poderia navegar a webview
      // para `file://`, `chrome://` etc. depois que ela já está aberta.
      contents.on('will-navigate', (event, url) => {
        if (!isWebviewNavigationAllowed(url)) {
          console.warn('Navegação bloqueada (protocolo não permitido):', url);
          event.preventDefault();
        }
      });

      contents.on('will-redirect', (event, url) => {
        if (!isWebviewNavigationAllowed(url)) {
          console.warn('Redirecionamento bloqueado (protocolo não permitido):', url);
          event.preventDefault();
        }
      });

      // Permite que os atalhos de navegação entre painéis funcionem mesmo
      // com o foco dentro da webview
      attachShortcutInterception(contents, mainWindow);

      // Histórico de navegação: grava cada visita no processo principal
      // (não no renderer) porque aqui é o único lugar que enxerga toda
      // webview de qualquer aba/painel, sem depender de cada BrowserPanel
      // reimplementar a mesma lógica. Título e favicon chegam em eventos
      // separados, geralmente alguns instantes depois - guardamos o id da
      // entrada recém-criada pra atualizá-la em vez de duplicar.
      let lastHistoryEntryId = null;
      contents.on('did-navigate', (event, url) => {
        if (!isWebviewNavigationAllowed(url) || url === 'about:blank') {
          lastHistoryEntryId = null;
          return;
        }
        lastHistoryEntryId = getHistoryManager().addEntry({ url, title: url });
      });

      contents.on('page-title-updated', (event, title) => {
        if (lastHistoryEntryId) {
          getHistoryManager().updateEntry(lastHistoryEntryId, { title });
        }
      });

      contents.on('page-favicon-updated', (event, favicons) => {
        if (lastHistoryEntryId && favicons && favicons.length > 0) {
          getHistoryManager().updateEntry(lastHistoryEntryId, { faviconUrl: favicons[0] });
        }
      });

      console.log('Configurando context menu para webview:', contents.getURL());
      
      // Configure context menu for this specific webview
      try {
        const contextMenu = await import('electron-context-menu');
        contextMenu.default({
          window: contents,
          showLookUpSelection: false,
          showSearchWithGoogle: true,
          showCopyImage: true,
          showCopyImageAddress: true,
          showInspectElement: true,
          showServices: false,
          prepend: (defaultActions, parameters, browserWindow) => [
            {
              label: 'Back',
              visible: contents.navigationHistory && contents.navigationHistory.canGoBack(),
              click: () => {
                contents.navigationHistory.goBack();
              }
            },
            {
              label: 'Forward',
              visible: contents.navigationHistory && contents.navigationHistory.canGoForward(),
              click: () => {
                contents.navigationHistory.goForward();
              }
            },
            {
              label: 'Reload',
              click: () => {
                contents.reload();
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Open link in a new tab',
              visible: !!parameters.linkURL,
              click: () => {
                if (mainWindow && mainWindow.webContents) {
                  findSourceTabId(mainWindow, contents.getURL()).then((tabId) => {
                    mainWindow.webContents.send(
                      'add-new-tab',
                      tabId ? { url: parameters.linkURL, sourceTabId: tabId } : { url: parameters.linkURL }
                    );
                  });
                }
              }
            }
          ],
          append: (defaultActions, parameters, browserWindow) => [
            {
              type: 'separator'
            },
            {
              label: 'Open DevTools',
              visible: isDev,
              click: () => {
                contents.openDevTools();
              }
            }
          ]
        });
      } catch (error) {
        console.error('Erro ao configurar context menu para webview:', error);
      }
    }
  });
}

module.exports = {
  setupWebContentsHandlers,
  setupPermissionHandler,
  setupSiteInfoHandlers
};
