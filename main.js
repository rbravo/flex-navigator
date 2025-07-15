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

function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Nova Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            // Pode implementar lógica para adicionar nova tab aqui
            mainWindow.webContents.executeJavaScript(`
              console.log('Nova tab solicitada via menu');
            `);
          }
        },
        { type: 'separator' },
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
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectall', label: 'Selecionar Tudo' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Forçar Recarregar' },
        { role: 'toggleDevTools', label: 'Ferramentas de Desenvolvedor' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Real' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela Cheia' }
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
});
