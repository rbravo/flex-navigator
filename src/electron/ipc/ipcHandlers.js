const { ipcMain } = require('electron');

/**
 * Configura todos os manipuladores de eventos IPC
 */
function setupIpcHandlers(mainWindow) {
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

  // Handle refresh webview
  ipcMain.on('refresh-webview', (event, data) => {
    console.log('Solicitação para atualizar webview da tab:', data.tabId);
    
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          const webviewForTab = document.querySelector('webview[data-tab-id="${data.tabId}"]');
          
          if (webviewForTab) {
            console.log('Atualizando webview para tab ${data.tabId}:', webviewForTab.src);
            webviewForTab.reload();
          } else {
            console.log('Webview não encontrada para tab ${data.tabId}');
          }
        })();
      `).catch(error => {
        console.error('Erro ao executar script de refresh:', error);
      });
    }
  });

  // Handle toggle webview mute
  ipcMain.on('toggle-webview-mute', (event, data) => {
    console.log('Solicitação para alternar mute da tab:', data.tabId, 'muted:', data.muted);
    
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          const webviewForTab = document.querySelector('webview[data-tab-id="${data.tabId}"]');
          
          if (webviewForTab) {
            console.log('Alterando mute da webview para tab ${data.tabId}:', ${data.muted});
            webviewForTab.setAudioMuted(${data.muted});
          } else {
            console.log('Webview não encontrada para tab ${data.tabId}');
          }
        })();
      `).catch(error => {
        console.error('Erro ao executar script de mute:', error);
      });
    }
  });
}

module.exports = {
  setupIpcHandlers
};
