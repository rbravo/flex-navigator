const { Menu, app } = require('electron');
const { executeOnActiveWebview, executeZoomCommand } = require('../utils/webviewUtils');

/**
 * Cria o menu da aplicação
 */
function createMenu(mainWindow) {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
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
            executeOnActiveWebview(mainWindow, 'undo()');
          }
        },
        {
          label: 'Refazer',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => {
            executeOnActiveWebview(mainWindow, 'redo()');
          }
        },
        { type: 'separator' },
        {
          label: 'Recortar',
          accelerator: 'CmdOrCtrl+X',
          click: () => {
            executeOnActiveWebview(mainWindow, 'cut()');
          }
        },
        {
          label: 'Copiar',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            executeOnActiveWebview(mainWindow, 'copy()');
          }
        },
        {
          label: 'Colar',
          accelerator: 'CmdOrCtrl+V',
          click: () => {
            executeOnActiveWebview(mainWindow, 'paste()');
          }
        },
        {
          label: 'Selecionar Tudo',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            executeOnActiveWebview(mainWindow, 'selectAll()');
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
            executeOnActiveWebview(mainWindow, 'reload()');
          }
        },
        {
          label: 'Forçar Recarregar',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            executeOnActiveWebview(mainWindow, 'reloadIgnoringCache()');
          }
        },
        {
          label: 'Ferramentas de Desenvolvedor',
          accelerator: 'F12',
          click: () => {
            executeOnActiveWebview(mainWindow, 'openDevTools()');
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom Real',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            executeZoomCommand(mainWindow, 'reset');
          }
        },
        {
          label: 'Aumentar Zoom',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            executeZoomCommand(mainWindow, 'increase');
          }
        },
        {
          label: 'Diminuir Zoom',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            executeZoomCommand(mainWindow, 'decrease');
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

module.exports = {
  createMenu
};
