const { Menu, app } = require('electron');
const { executeOnActiveWebview, executeZoomCommand } = require('../utils/webviewUtils');
const { isDev } = require('../utils/config');

let autoUpdaterManager = null;


let currentMenu = null;

/**
 * Cria o template base do menu
 */
function createMenuTemplate(mainWindow) {
  return [
    {
      label: 'Arquivo',
      submenu: [
        {
          // Sem "accelerator": Ctrl+T é tratado inteiramente pelo listener de
          // teclado do renderer + repasse via webview (ver
          // useElectronIPC.js / navigationShortcuts.js) - o accelerator
          // nativo do Menu do Electron para de disparar de forma confiável
          // assim que qualquer <webview> já ganhou foco de teclado.
          label: 'Nova Aba',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-new-tab');
            }
          }
        },
        {
          // Mesmo motivo do item acima: sem "accelerator", Ctrl+W é tratado
          // pelo renderer/webview.
          label: 'Fechar Aba',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-close-tab');
            }
          }
        },
        {
          label: 'Dividir Painel Horizontalmente',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-split-horizontal');
            }
          }
        },
        {
          label: 'Dividir Painel Verticalmente',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-split-vertical');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        },
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
        { type: 'separator' },
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
      label: 'Navegar',
      submenu: [
        {
          label: 'Voltar',
          accelerator: 'Alt+Left',
          click: () => {
            executeOnActiveWebview(mainWindow, 'goBack()');
          }
        },
        {
          label: 'Avançar',
          accelerator: 'Alt+Right',
          click: () => {
            executeOnActiveWebview(mainWindow, 'goForward()');
          }
        },
        {
          label: 'Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            executeOnActiveWebview(mainWindow, 'reload()');
          }
        },
        {
          label: 'Parar',
          accelerator: 'Escape',
          click: () => {
            executeOnActiveWebview(mainWindow, 'stop()');
          }
        }
      ]
    },
    {
      label: 'Dev',
      submenu: [
        { role: 'reload', label: 'Recarregar App' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'DevTools da Aplicação' },
        // { type: 'separator' },
        // {
        //   label: 'Testar Notificações',
        //   click: () => {
        //     if (mainWindow && mainWindow.webContents) {
        //       mainWindow.webContents.send('test-notifications');
        //     }
        //   }
        // }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Configurações...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('show-settings-dialog');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Como Contribuir',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('open-url', 'https://github.com/rbravo/flex-navigator');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Verificar Atualizações',
          click: () => {
            if (autoUpdaterManager) {
              autoUpdaterManager.checkForUpdates();
            }
          }
        },
        { type: 'separator' },
        {
          label: `Versão ${app.getVersion()}`,
          enabled: false
        },
      ]
    }
  ];
}

/**
 * Cria o menu da aplicação
 */
function createMenu(mainWindow) {
  const template = createMenuTemplate(mainWindow);

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
  currentMenu = menu;

  // A barra de menu nativa fica oculta: o menu é exibido pela barra de
  // título customizada em React, via popupMenuItem()
  mainWindow.setMenuBarVisibility(false);
}

/**
 * Exibe o submenu de um item de topo (ex.: "Arquivo") na posição informada.
 * Usado pela barra de título customizada, já que a barra de menu nativa
 * fica oculta.
 */
function popupMenuItem(mainWindow, label, x, y) {
  if (!currentMenu) return;

  const item = currentMenu.items.find((menuItem) => menuItem.label === label);
  if (item && item.submenu) {
    item.submenu.popup({
      window: mainWindow,
      x: Math.round(x),
      y: Math.round(y)
    });
  }
}

/**
 * Define a instância do AutoUpdaterManager
 */
function setAutoUpdaterManager(updaterManager) {
  autoUpdaterManager = updaterManager;
}

module.exports = {
  createMenu,
  setAutoUpdaterManager,
  popupMenuItem
};
