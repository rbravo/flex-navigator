const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
  console.log('Criando janela básica...');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadFile('package.json'); // Load any local file
  console.log('Janela criada e arquivo carregado');
}

app.whenReady().then(() => {
  console.log('App ready');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('Fechando app');
  app.quit();
});

console.log('Script iniciado');
