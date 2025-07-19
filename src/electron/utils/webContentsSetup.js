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
