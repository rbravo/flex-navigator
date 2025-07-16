const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false, // Permite carregar qualquer URL
      webviewTag: true // Habilita a tag webview
    },
    titleBarStyle: 'default',
    show: false,
    title: 'Flex Navigator'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

// Function to execute commands on the active webview
function executeOnActiveWebview(command) {
  if (!mainWindow || !mainWindow.webContents) {
    console.log('Janela principal não disponível');
    return;
  }

  // Execute script to find active webview and run command
  mainWindow.webContents.executeJavaScript(`
    (function() {
      // Find all webviews
      const webviews = document.querySelectorAll('webview');
      let activeWebview = null;

      // Strategy 1: Find webview in active/focused tab
      const activeTab = document.querySelector('.flexlayout__tab_button--selected');
      if (activeTab) {
        const tabContent = activeTab.closest('.flexlayout__tabset').querySelector('.flexlayout__tab');
        if (tabContent) {
          activeWebview = tabContent.querySelector('webview');
        }
      }

      // Strategy 2: Find focused webview
      if (!activeWebview) {
        for (let webview of webviews) {
          if (document.activeElement === webview || webview.contains(document.activeElement)) {
            activeWebview = webview;
            break;
          }
        }
      }

      // Strategy 3: Find visible webview with largest area
      if (!activeWebview) {
        let largestArea = 0;
        for (let webview of webviews) {
          const rect = webview.getBoundingClientRect();
          const area = rect.width * rect.height;
          if (area > largestArea && rect.width > 0 && rect.height > 0) {
            largestArea = area;
            activeWebview = webview;
          }
        }
      }

      if (activeWebview) {
        console.log('Executando comando na webview ativa:', '${command}');
        console.log('URL da webview:', activeWebview.src);
        
        try {
          // Simple eval for webview commands
          const result = eval('activeWebview.' + '${command}');
          console.log('Comando executado com sucesso');
          return { success: true, url: activeWebview.src, command: '${command}' };
        } catch (error) {
          console.error('Erro ao executar comando na webview:', error);
          return { success: false, error: error.message };
        }
      } else {
        console.log('Nenhuma webview ativa encontrada para executar: ${command}');
        return { success: false, error: 'Nenhuma webview ativa encontrada' };
      }
    })();
  `).then(result => {
    if (result && result.success) {
      console.log('✅ Comando executado na webview:', result.command);
    } else {
      console.log('❌ Falha ao executar comando:', result ? result.error : 'Resultado indefinido');
    }
  }).catch(error => {
    console.error('Erro ao executar script na webview ativa:', error);
  });
}

// Function to handle zoom commands on active webview
function executeZoomCommand(action) {
  if (!mainWindow || !mainWindow.webContents) {
    console.log('Janela principal não disponível');
    return;
  }

  // Execute script to find active webview and handle zoom
  mainWindow.webContents.executeJavaScript(`
    (function() {
      // Find all webviews
      const webviews = document.querySelectorAll('webview');
      let activeWebview = null;

      // Strategy 1: Find webview in active/focused tab
      const activeTab = document.querySelector('.flexlayout__tab_button--selected');
      if (activeTab) {
        const tabContent = activeTab.closest('.flexlayout__tabset').querySelector('.flexlayout__tab');
        if (tabContent) {
          activeWebview = tabContent.querySelector('webview');
        }
      }

      // Strategy 2: Find focused webview
      if (!activeWebview) {
        for (let webview of webviews) {
          if (document.activeElement === webview || webview.contains(document.activeElement)) {
            activeWebview = webview;
            break;
          }
        }
      }

      // Strategy 3: Find visible webview with largest area
      if (!activeWebview) {
        let largestArea = 0;
        for (let webview of webviews) {
          const rect = webview.getBoundingClientRect();
          const area = rect.width * rect.height;
          if (area > largestArea && rect.width > 0 && rect.height > 0) {
            largestArea = area;
            activeWebview = webview;
          }
        }
      }

      if (activeWebview) {
        console.log('Aplicando zoom na webview ativa:', activeWebview.src);
        
        try {
          // Use a simple zoom approach with stored zoom levels
          if (!activeWebview._currentZoom) {
            activeWebview._currentZoom = 1.0; // Default zoom
          }

          // Handle different zoom actions
          if ('${action}' === 'increase') {
            activeWebview._currentZoom = Math.min(5.0, activeWebview._currentZoom * 1.2); // Max 500%
            activeWebview.setZoomFactor(activeWebview._currentZoom);
            console.log('Zoom aumentado para:', (activeWebview._currentZoom * 100).toFixed(0) + '%');
          } else if ('${action}' === 'decrease') {
            activeWebview._currentZoom = Math.max(0.25, activeWebview._currentZoom / 1.2); // Min 25%
            activeWebview.setZoomFactor(activeWebview._currentZoom);
            console.log('Zoom diminuído para:', (activeWebview._currentZoom * 100).toFixed(0) + '%');
          } else if ('${action}' === 'reset') {
            activeWebview._currentZoom = 1.0;
            activeWebview.setZoomFactor(1.0);
            console.log('Zoom resetado para: 100%');
          }
          
          return { 
            success: true, 
            url: activeWebview.src, 
            action: '${action}',
            zoom: (activeWebview._currentZoom * 100).toFixed(0) + '%'
          };
        } catch (error) {
          console.error('Erro ao executar zoom na webview:', error);
          return { success: false, error: error.message };
        }
      } else {
        console.log('Nenhuma webview ativa encontrada para zoom');
        return { success: false, error: 'Nenhuma webview ativa encontrada' };
      }
    })();
  `).then(result => {
    if (result && result.success) {
      console.log('✅ Zoom executado na webview:', result.action, 'Novo zoom:', result.zoom);
    } else {
      console.log('❌ Falha ao executar zoom:', result ? result.error : 'Resultado indefinido');
    }
  }).catch(error => {
    console.error('Erro ao executar script de zoom na webview ativa:', error);
  });
}

function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        // {
        //   label: 'Nova Tab',
        //   accelerator: 'CmdOrCtrl+T',
        //   click: () => {
        //     // Pode implementar lógica para adicionar nova tab aqui
        //     mainWindow.webContents.executeJavaScript(`
        //       console.log('Nova tab solicitada via menu');
        //     `);
        //   }
        // },
        // { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        {
          label: 'Desfazer',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            executeOnActiveWebview('undo()');
          }
        },
        {
          label: 'Refazer',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => {
            executeOnActiveWebview('redo()');
          }
        },
        { type: 'separator' },
        {
          label: 'Recortar',
          accelerator: 'CmdOrCtrl+X',
          click: () => {
            executeOnActiveWebview('cut()');
          }
        },
        {
          label: 'Copiar',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            executeOnActiveWebview('copy()');
          }
        },
        {
          label: 'Colar',
          accelerator: 'CmdOrCtrl+V',
          click: () => {
            executeOnActiveWebview('paste()');
          }
        },
        {
          label: 'Selecionar Tudo',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            executeOnActiveWebview('selectAll()');
          }
        }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        {
          label: 'Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            executeOnActiveWebview('reload()');
          }
        },
        {
          label: 'Forçar Recarregar',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            executeOnActiveWebview('reloadIgnoringCache()');
          }
        },
        {
          label: 'Ferramentas de Desenvolvedor',
          accelerator: 'F12',
          click: () => {
            executeOnActiveWebview('openDevTools()');
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom Real',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            executeZoomCommand('reset');
          }
        },
        {
          label: 'Aumentar Zoom',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            executeZoomCommand('increase');
          }
        },
        {
          label: 'Diminuir Zoom',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            executeZoomCommand('decrease');
          }
        },
        { type: 'separator' },
        {
          label: 'Tela Cheia',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Fechar' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'Sobre' },
        { type: 'separator' },
        { role: 'services', label: 'Serviços', submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: 'Esconder' },
        { role: 'hideothers', label: 'Esconder Outros' },
        { role: 'unhide', label: 'Mostrar Todos' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Handle IPC events
ipcMain.on('open-webview-devtools', (event, data) => {
  console.log('Abrindo DevTools para webview da tab:', data.tabId);
  
  // Encontrar a webview específica e abrir seus DevTools
  if (mainWindow && mainWindow.webContents) {
    // Executar script no renderer para encontrar e abrir DevTools da webview específica
    mainWindow.webContents.executeJavaScript(`
      (function() {
        // Encontrar a webview específica usando o data-tab-id
        const webviewForTab = document.querySelector('webview[data-tab-id="${data.tabId}"]');
        
        if (webviewForTab) {
          console.log('DevTools: Encontrou webview para tab ${data.tabId}:', webviewForTab.src);
          try {
            // Abrir DevTools da webview específica em modo detached
            webviewForTab.openDevTools();
            console.log('DevTools aberto com sucesso para:', webviewForTab.src);
          } catch (error) {
            console.error('Erro ao abrir DevTools da webview:', error);
          }
        } else {
          console.log('DevTools: Webview não encontrada para tab ${data.tabId}');
          // Fallback: tentar encontrar webview ativa
          const allWebviews = document.querySelectorAll('webview');
          for (let i = 0; i < allWebviews.length; i++) {
            const webviewElement = allWebviews[i];
            const rect = webviewElement.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && webviewElement.src && webviewElement.src !== 'about:blank') {
              console.log('DevTools: Usando webview ativa como fallback:', webviewElement.src);
              try {
                webviewElement.openDevTools();
                break;
              } catch (error) {
                console.error('Erro ao abrir DevTools da webview (fallback):', error);
              }
            }
          }
        }
      })();
    `).catch(error => {
      console.error('Erro ao executar script de DevTools:', error);
    });
  }
});

// Handle open in new tab from context menu
ipcMain.on('open-in-new-tab', (event, url) => {
  console.log('Solicitação para abrir URL em nova aba:', url);
  
  if (mainWindow && mainWindow.webContents) {
    // Enviar para o renderer para adicionar nova aba
    mainWindow.webContents.send('add-new-tab', { url });
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Allow loading any external URLs and enable webviews
app.on('web-contents-created', (event, contents) => {
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
    
    // Import and configure context menu for this specific webview
    import('electron-context-menu').then((contextMenuModule) => {
      const contextMenu = contextMenuModule.default || contextMenuModule;
      
      contextMenu({
        window: contents,
        showLookUpSelection: false,
        showSearchWithGoogle: true,
        showCopyImage: true,
        showCopyImageAddress: true,
        //showSaveImage: true,
        //showSaveImageAs: true,
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
              // Enviar evento para o processo principal para criar nova aba
              if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send('add-new-tab', { url: parameters.linkURL });
              }
            }
          }
        ],
        append: (defaultActions, parameters, browserWindow) => [
          {
            type: 'separator'
          },
          // {
          //   label: 'Inspecionar Elemento',
          //   visible: isDev,
          //   click: () => {
          //     contents.inspectElement(parameters.x, parameters.y);
          //   }
          // },
          {
            label: 'Open DevTools',
            visible: isDev,
            click: () => {
              contents.openDevTools();
            }
          }
        ]
      });
    }).catch(error => {
      console.error('Erro ao configurar context menu para webview:', error);
    });
  }
});
