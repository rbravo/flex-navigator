const { BrowserWindow } = require('electron');
const path = require('path');
const { isDev } = require('../utils/config');

let mainWindow = null;

/**
 * Cria a janela principal da aplicação
 */
function createWindow() {
  console.log('🚀 Criando janela do Electron...');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../../../public/favicon.ico'),
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
    : `file://${path.join(__dirname, '../../../build/index.html')}`;
  
  console.log('📂 Carregando URL:', startUrl);
  console.log('📍 Diretório atual:', __dirname);
  console.log('📍 Caminho do build:', path.join(__dirname, '../../../build/index.html'));
  
  mainWindow.loadURL(startUrl).then(() => {
    console.log('✅ URL carregada com sucesso');
  }).catch(error => {
    console.error('❌ Erro ao carregar URL:', error);
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('🎉 Janela pronta para mostrar');
    mainWindow.show();
    
    // Open DevTools only in development
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Add error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Falha ao carregar página:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('crashed', (event) => {
    console.error('❌ Renderer process crashed');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Retorna a instância da janela principal
 */
function getMainWindow() {
  return mainWindow;
}

/**
 * Fecha a janela principal
 */
function closeMainWindow() {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }
}

module.exports = {
  createWindow,
  getMainWindow,
  closeMainWindow
};
