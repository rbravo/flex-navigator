const { app, BrowserWindow } = require('electron');
const { printDebugInfo } = require('./src/electron/utils/config');
const { createWindow, getMainWindow } = require('./src/electron/window/mainWindow');
const { createMenu } = require('./src/electron/menu/applicationMenu');
const { setupIpcHandlers } = require('./src/electron/ipc/ipcHandlers');
const { setupWebContentsHandlers } = require('./src/electron/utils/webContentsSetup');

// Imprimir informações de debug
printDebugInfo();

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('🎯 Electron está pronto, criando janela...');
  
  // Criar janela principal
  const mainWindow = createWindow();
  
  // Criar menu da aplicação
  createMenu(mainWindow);
  
  // Configurar manipuladores IPC
  setupIpcHandlers(mainWindow);
  
  // Configurar manipuladores de web contents
  setupWebContentsHandlers(mainWindow);
  
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
