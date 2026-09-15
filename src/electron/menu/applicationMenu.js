const { Menu, app } = require('electron');
const { executeOnActiveWebview, executeZoomCommand } = require('../utils/webviewUtils');
const { isDev } = require('../utils/config');
const { t } = require('../i18n');

let autoUpdaterManager = null;


let currentMenu = null;

/**
 * Cria o template base do menu
 */
function createMenuTemplate(mainWindow) {
  return [
    {
      id: 'file',
      label: t('menu.file.title'),
      submenu: [
        {
          // Sem "accelerator": Ctrl+T é tratado inteiramente pelo listener de
          // teclado do renderer + repasse via webview (ver
          // useElectronIPC.js / navigationShortcuts.js) - o accelerator
          // nativo do Menu do Electron para de disparar de forma confiável
          // assim que qualquer <webview> já ganhou foco de teclado.
          label: t('menu.file.newTab'),
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-new-tab');
            }
          }
        },
        {
          // Mesmo motivo do item acima: sem "accelerator", Ctrl+W é tratado
          // pelo renderer/webview.
          label: t('menu.file.closeTab'),
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-close-tab');
            }
          }
        },
        {
          label: t('menu.file.splitHorizontal'),
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-split-horizontal');
            }
          }
        },
        {
          label: t('menu.file.splitVertical'),
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('menu-split-vertical');
            }
          }
        },
        { type: 'separator' },
        {
          label: t('menu.file.quit'),
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        },
      ]
    },
    {
      id: 'edit',
      label: t('menu.edit.title'),
      submenu: [
        {
          label: t('menu.edit.undo'),
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            executeOnActiveWebview(mainWindow, 'undo()');
          }
        },
        {
          label: t('menu.edit.redo'),
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => {
            executeOnActiveWebview(mainWindow, 'redo()');
          }
        },
        { type: 'separator' },
        {
          label: t('menu.edit.cut'),
          accelerator: 'CmdOrCtrl+X',
          click: () => {
            executeOnActiveWebview(mainWindow, 'cut()');
          }
        },
        {
          label: t('menu.edit.copy'),
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            executeOnActiveWebview(mainWindow, 'copy()');
          }
        },
        {
          label: t('menu.edit.paste'),
          accelerator: 'CmdOrCtrl+V',
          click: () => {
            executeOnActiveWebview(mainWindow, 'paste()');
          }
        },
        { type: 'separator' },
        {
          label: t('menu.edit.selectAll'),
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            executeOnActiveWebview(mainWindow, 'selectAll()');
          }
        }
      ]
    },
    {
      id: 'view',
      label: t('menu.view.title'),
      submenu: [
        {
          label: t('menu.view.reload'),
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            executeOnActiveWebview(mainWindow, 'reload()');
          }
        },
        {
          label: t('menu.view.forceReload'),
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            executeOnActiveWebview(mainWindow, 'reloadIgnoringCache()');
          }
        },
        {
          label: t('menu.view.devTools'),
          accelerator: 'F12',
          click: () => {
            executeOnActiveWebview(mainWindow, 'openDevTools()');
          }
        },
        { type: 'separator' },
        {
          label: t('menu.view.zoomReset'),
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            executeZoomCommand(mainWindow, 'reset');
          }
        },
        {
          label: t('menu.view.zoomIn'),
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            executeZoomCommand(mainWindow, 'increase');
          }
        },
        {
          label: t('menu.view.zoomOut'),
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            executeZoomCommand(mainWindow, 'decrease');
          }
        },
        { type: 'separator' },
        {
          label: t('menu.view.fullScreen'),
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    {
      id: 'navigate',
      label: t('menu.navigate.title'),
      submenu: [
        {
          label: t('menu.navigate.back'),
          accelerator: 'Alt+Left',
          click: () => {
            executeOnActiveWebview(mainWindow, 'goBack()');
          }
        },
        {
          label: t('menu.navigate.forward'),
          accelerator: 'Alt+Right',
          click: () => {
            executeOnActiveWebview(mainWindow, 'goForward()');
          }
        },
        {
          label: t('menu.navigate.reload'),
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            executeOnActiveWebview(mainWindow, 'reload()');
          }
        },
        {
          label: t('menu.navigate.stop'),
          accelerator: 'Escape',
          click: () => {
            executeOnActiveWebview(mainWindow, 'stop()');
          }
        }
      ]
    },
    {
      id: 'dev',
      label: t('menu.dev.title'),
      submenu: [
        { role: 'reload', label: t('menu.dev.reloadApp') },
        { role: 'forceReload', label: t('menu.dev.forceReloadApp') },
        { role: 'toggleDevTools', label: t('menu.dev.toggleDevTools') },
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
      id: 'help',
      label: t('menu.help.title'),
      submenu: [
        {
          label: t('menu.help.settings'),
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('show-settings-dialog');
            }
          }
        },
        { type: 'separator' },
        {
          label: t('menu.help.howToContribute'),
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('open-url', 'https://github.com/rbravo/flex-navigator');
            }
          }
        },
        { type: 'separator' },
        {
          label: t('menu.help.checkForUpdates'),
          click: () => {
            if (autoUpdaterManager) {
              autoUpdaterManager.checkForUpdates();
            }
          }
        },
        { type: 'separator' },
        {
          label: t('menu.help.version', { version: app.getVersion() }),
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
      id: 'app',
      label: app.getName(),
      submenu: [
        { role: 'about', label: t('menu.app.about') },
        { type: 'separator' },
        { role: 'services', label: t('menu.app.services'), submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: t('menu.app.hide') },
        { role: 'hideothers', label: t('menu.app.hideOthers') },
        { role: 'unhide', label: t('menu.app.unhide') },
        { type: 'separator' },
        { role: 'quit', label: t('menu.app.quit') }
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
 * Exibe o submenu de um item de topo (ex.: "file") na posição informada.
 * Usado pela barra de título customizada, já que a barra de menu nativa
 * fica oculta. Casa por `id` estável (não pelo `label`, que é traduzido e
 * muda conforme o idioma escolhido pelo usuário).
 */
function popupMenuItem(mainWindow, id, x, y) {
  if (!currentMenu) return;

  const item = currentMenu.items.find((menuItem) => menuItem.id === id);
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
