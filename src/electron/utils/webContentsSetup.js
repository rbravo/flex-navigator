const { app } = require('electron');
const { isDev } = require('./config');

/**
 * Configura comportamentos para webviews e context menus
 */
function setupWebContentsHandlers(mainWindow) {
  // Allow loading any external URLs and enable webviews
  app.on('web-contents-created', async (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
      event.preventDefault();
      contents.loadURL(navigationUrl);
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
                // Executar script no main window para encontrar a tab source
                if (mainWindow && mainWindow.webContents) {
                  mainWindow.webContents.executeJavaScript(`
                    (function() {
                      // Procurar pela webview que corresponde a este contents
                      const webviews = document.querySelectorAll('webview');
                      console.log('Procurando webview source, total webviews:', webviews.length);
                      console.log('URL do contents que acionou context menu:', '${contents.getURL()}');
                      
                      for (let i = 0; i < webviews.length; i++) {
                        const webview = webviews[i];
                        const webviewUrl = webview.src;
                        const tabId = webview.getAttribute('data-tab-id');
                        
                        console.log('Webview', i, '- URL:', webviewUrl, '- TabId:', tabId);
                        
                        // Comparar a URL da webview com a URL atual do contents
                        // Usar também getURL() se disponível na webview
                        if (webviewUrl === '${contents.getURL()}' || 
                            (webview.getURL && webview.getURL() === '${contents.getURL()}')) {
                          console.log('✅ Encontrada webview correspondente! TabId:', tabId);
                          return tabId;
                        }
                      }
                      
                      console.log('❌ Nenhuma webview correspondente encontrada');
                      return null;
                    })();
                  `).then(tabId => {
                    console.log('Resultado da busca por tab source:', tabId);
                    
                    // Enviar evento para o processo principal para criar nova aba no tabset correto
                    if (tabId) {
                      console.log('Enviando add-new-tab com sourceTabId:', tabId);
                      mainWindow.webContents.send('add-new-tab', { 
                        url: parameters.linkURL,
                        sourceTabId: tabId
                      });
                    } else {
                      // Fallback para o método antigo se não conseguir encontrar a tab
                      console.log('Usando fallback - enviando add-new-tab sem sourceTabId');
                      mainWindow.webContents.send('add-new-tab', { url: parameters.linkURL });
                    }
                  }).catch(error => {
                    console.error('Erro ao executar script para encontrar tab source:', error);
                    // Fallback para o método antigo
                    mainWindow.webContents.send('add-new-tab', { url: parameters.linkURL });
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
  setupWebContentsHandlers
};
