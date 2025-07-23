const { Menu, app } = require('electron');
const { executeOnActiveWebview, executeZoomCommand } = require('../utils/webviewUtils');
const SessionManager = require('../utils/SessionManager');
const { isDev } = require('../utils/config');


let currentMenu = null;
const sessionManager = new SessionManager();

/**
 * Cria o template base do menu
 */
function createMenuTemplate(mainWindow, sessions) {
  return [
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
    ...(isDev ? [{
      label: 'Desenvolver',
      submenu: [
        { role: 'reload', label: 'Recarregar App' },
        { role: 'forceReload', label: 'Forçar Recarregamento' },
        { role: 'toggleDevTools', label: 'DevTools da Aplicação' },
      ]
    }] : []),
    {
      label: 'Sessão',
      submenu: [
        {
          label: 'Salvar Sessão Atual...',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('show-save-session-dialog');
            }
          }
        },
        {
          label: 'Limpar Sessão Atual...',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('show-clear-session-dialog');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Gerenciar Sessões',
          submenu: buildSessionsSubmenu(sessions, mainWindow)
        }
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
  const sessions = sessionManager.loadSessions();
  const template = createMenuTemplate(mainWindow, sessions);

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
}

/**
 * Atualiza dinamicamente o submenu de sessões
 */
function updateSessionsMenu(mainWindow) {
  if (!currentMenu) {
    console.log('Menu atual não encontrado, criando menu...');
    createMenu(mainWindow);
    return;
  }
  
  console.log('🔄 Atualizando menu de sessões...');
  const sessions = sessionManager.loadSessions();
  console.log('📋 Sessões encontradas para o menu:', sessions.length);
  
  // Usar o template centralizado
  const template = createMenuTemplate(mainWindow, sessions);

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

  // Reconstruir e aplicar o menu completo
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  currentMenu = menu;
  
  console.log('✅ Menu de sessões atualizado com sucesso!');
}

/**
 * Constrói o submenu de sessões
 */
function buildSessionsSubmenu(sessions, mainWindow) {
  if (sessions.length === 0) {
    return [{
      label: 'Nenhuma sessão salva',
      enabled: false
    }];
  }

  return sessions.map(session => ({
    label: session.name,
    submenu: [
      {
        label: 'Abrir nesta janela',
        click: () => {
          if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('load-session-in-current-window', session.id);
          }
        }
      },
      {
        label: 'Abrir em nova janela',
        click: () => {
          if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('open-session-new-window', session.id);
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Apagar sessão',
        click: () => {
          if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('confirm-delete-session', session.id, session.name);
          }
        }
      }
    ]
  }));
}

module.exports = {
  createMenu,
  updateSessionsMenu
};
