const { app, BrowserWindow } = require('electron');
const { printDebugInfo } = require('./src/electron/utils/config');
const { createWindow, getMainWindow } = require('./src/electron/window/mainWindow');
const { createMenu, setAutoUpdaterManager } = require('./src/electron/menu/applicationMenu');
const { setupIpcHandlers } = require('./src/electron/ipc/ipcHandlers');
const { setupWebContentsHandlers, setupPermissionHandler, setupSiteInfoHandlers } = require('./src/electron/utils/webContentsSetup');
const { AutoUpdaterManager } = require('./src/electron/utils/autoUpdater');

// Imprimir informações de debug
printDebugInfo();

// Inicializar auto-updater
const autoUpdaterManager = new AutoUpdaterManager();

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('🎯 Electron está pronto, criando janela...');
  
  // Criar janela principal
  const mainWindow = createWindow();
  
  // Criar menu da aplicação
  createMenu(mainWindow);
  
  // Passar referência do auto-updater para o menu
  setAutoUpdaterManager(autoUpdaterManager);
  
  // Configurar manipuladores IPC
  setupIpcHandlers(mainWindow);
  
  // Configurar manipuladores de web contents
  setupWebContentsHandlers(mainWindow);

  // Configurar prompt de permissões (câmera/mic, localização, notificações...)
  setupPermissionHandler(mainWindow);

  // Configurar captura de certificado TLS + consulta/edição de permissões
  // por site (popover de informações do site na barra de URL)
  setupSiteInfoHandlers();

  // Verificar por atualizações após 3 segundos (se habilitado)
  setTimeout(async () => {
    // Verificar se o auto-update está habilitado nas configurações
    try {
      const fs = require('fs');
      const path = require('path');
      const { app } = require('electron');
      
      // Tentar ler as configurações do localStorage (em ambiente de produção)
      // Para desenvolvimento, vamos sempre verificar
      const { default: isDev } = await import('electron-is-dev');
      
      if (isDev) {
        console.log('🔄 Modo desenvolvimento - pulando verificação de auto-update');
        return;
      }
      
      autoUpdaterManager.checkForUpdatesAndNotify();
    } catch (error) {
      console.error('Erro ao verificar configurações de auto-update:', error);
      // Em caso de erro, fazer a verificação mesmo assim
      autoUpdaterManager.checkForUpdatesAndNotify();
    }
  }, 3000);
  
  app.on('activate', () => {
    console.log('🔄 App ativado...');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(error => {
  console.error('❌ Erro ao inicializar Electron:', error);
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
