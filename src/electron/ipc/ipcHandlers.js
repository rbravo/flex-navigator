const { ipcMain } = require('electron');
const SessionManager = require('../utils/SessionManager');
const { popupMenuItem } = require('../menu/applicationMenu');

/**
 * Configura todos os manipuladores de eventos IPC
 */
function setupIpcHandlers(mainWindow) {
  const sessionManager = new SessionManager();
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

  // Handle audio state monitoring - polling method as fallback
  ipcMain.on('check-webview-audio-state', (event, data) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          const webviewForTab = document.querySelector('webview[data-tab-id="${data.tabId}"]');
          
          if (webviewForTab) {
            try {
              // Método 1: Tentar isCurrentlyAudible (mais confiável)
              if (typeof webviewForTab.isCurrentlyAudible === 'function') {
                const isAudible = webviewForTab.isCurrentlyAudible();
                //console.log('Tab ${data.tabId}: isCurrentlyAudible =', isAudible);
                return { tabId: '${data.tabId}', isAudible: isAudible, method: 'isCurrentlyAudible' };
              }
              
              // Método 2: Verificar propriedades de áudio (fallback)
              if (webviewForTab.audioMuted !== undefined) {
                // Se não conseguir detectar se está tocando, assumir que não
                return { tabId: '${data.tabId}', isAudible: false, method: 'audioMuted-fallback' };
              }
              
              console.log('Tab ${data.tabId}: Nenhum método de detecção de áudio disponível');
              return { tabId: '${data.tabId}', isAudible: false, method: 'none' };
              
            } catch (error) {
              console.error('Erro ao verificar áudio para tab ${data.tabId}:', error);
              return { tabId: '${data.tabId}', isAudible: false, method: 'error', error: error.message };
            }
          } else {
            console.log('Webview não encontrada para tab ${data.tabId}');
            return { tabId: '${data.tabId}', isAudible: false, method: 'not-found' };
          }
        })();
      `).then(result => {
        if (result && result.tabId) {
          // Enviar resultado de volta para o renderer
          mainWindow.webContents.send('audio-state-update', result);
        }
      }).catch(error => {
        console.error('Erro ao verificar estado de áudio:', error);
        // Enviar resultado de erro
        mainWindow.webContents.send('audio-state-update', { 
          tabId: data.tabId, 
          isAudible: false, 
          method: 'script-error',
          error: error.message 
        });
      });
    }
  });

  // Handlers para gerenciamento de sessões
  
  // Carregar todas as sessões
  ipcMain.handle('load-sessions', () => {
    try {
      const sessions = sessionManager.loadSessions();
      console.log('Sessões carregadas:', sessions.length);
      return { success: true, sessions };
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      return { success: false, error: error.message };
    }
  });

  // Salvar sessão atual
  ipcMain.handle('save-session', (event, { sessionName, layoutConfig }) => {
    console.log('Salvando sessão:', sessionName);
    return sessionManager.saveSession(sessionName, layoutConfig);
  });

  // Carregar sessão específica
  ipcMain.handle('load-session', (event, sessionId) => {
    console.log('Carregando sessão:', sessionId);
    const session = sessionManager.getSession(sessionId);
    if (session) {
      return { success: true, session };
    } else {
      return { success: false, error: 'Sessão não encontrada' };
    }
  });

  // Deletar sessão
  ipcMain.handle('delete-session', (event, sessionId) => {
    console.log('Deletando sessão:', sessionId);
    return sessionManager.deleteSession(sessionId);
  });

  // Handler para criar nova janela com sessão específica
  ipcMain.on('open-session-new-window', (event, sessionId) => {
    console.log('Abrindo sessão em nova janela:', sessionId);
    
    const session = sessionManager.getSession(sessionId);
    if (session) {
      // Importar createWindow para criar nova janela
      const { createWindow } = require('../window/mainWindow');
      const newWindow = createWindow();
      
      // Aguardar que a nova janela seja completamente carregada
      newWindow.webContents.once('did-finish-load', () => {
        // Aguardar um pouco mais para garantir que o React foi inicializado
        setTimeout(() => {
          console.log('Enviando configuração de sessão para nova janela...');
          newWindow.webContents.send('load-session-config', session.config);
        }, 1000);
      });
    }
  });

  // Handler para atualizar menu de sessões
  ipcMain.on('update-sessions-menu', () => {
    console.log('🔄 Recebido evento para atualizar menu de sessões...');
    const { updateSessionsMenu } = require('../menu/applicationMenu');
    updateSessionsMenu(mainWindow);
  });

  // Novos handlers para os modais
  ipcMain.on('show-clear-session-dialog', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('show-clear-session-dialog');
    }
  });

  ipcMain.on('show-settings-dialog', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('show-settings-dialog');
    }
  });

  ipcMain.on('open-url', (event, url) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('open-url', url);
    }
  });

  // Auto-update handlers
  ipcMain.handle('check-for-updates', async () => {
    try {
      console.log('📞 IPC: Solicitação de verificação de updates recebida');
      const { AutoUpdaterManager } = require('../utils/autoUpdater');
      const autoUpdaterManager = new AutoUpdaterManager();
      const result = await autoUpdaterManager.checkForUpdates();
      console.log('📞 IPC: Verificação concluída:', result);
      return { success: true, result };
    } catch (error) {
      console.error('📞 IPC: Erro na verificação:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.stack
      };
    }
  });

  ipcMain.handle('get-app-version', () => {
    const { app } = require('electron');
    return app.getVersion();
  });

  ipcMain.on('download-update', () => {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.downloadUpdate();
  });

  ipcMain.on('install-update', () => {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.quitAndInstall();
  });

  // Handler para teste de notificações
  ipcMain.on('test-notifications', () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('test-notifications');
    }
  });

  // Abre o submenu nativo correspondente a um item da barra de título customizada
  ipcMain.on('popup-app-menu', (event, { label, x, y }) => {
    popupMenuItem(mainWindow, label, x, y);
  });
}

module.exports = {
  setupIpcHandlers
};
