const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  console.log('🚀 Criando janela do Electron...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    },
    show: false,
    title: 'Flex Navigator'
  });

  // Testar com arquivo local primeiro
  const startUrl = `file://${path.join(__dirname, 'build/index.html')}`;
  
  console.log('📂 Carregando URL:', startUrl);
  
  mainWindow.loadURL(startUrl).then(() => {
    console.log('✅ URL carregada com sucesso');
  }).catch(error => {
    console.error('❌ Erro ao carregar URL:', error);
  });

  mainWindow.once('ready-to-show', () => {
    console.log('🎉 Janela pronta para mostrar');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('🎯 Electron está pronto, criando janela...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('🔍 Script iniciado...');
