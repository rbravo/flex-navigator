const { contextBridge, ipcRenderer } = require('electron');

/**
 * Assina um evento vindo do processo principal e retorna uma função de
 * cleanup (unsubscribe), já descartando o `event` do IPC - o renderer nunca
 * precisa dele, só do payload.
 */
const subscribe = (channel, callback) => {
  const listener = (event, ...args) => callback(...args);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
};

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // Ações sobre webviews (tabs)
  refreshWebview: (tabId) => ipcRenderer.send('refresh-webview', { tabId }),
  toggleWebviewMute: (tabId, muted) => ipcRenderer.send('toggle-webview-mute', { tabId, muted }),
  checkWebviewAudioState: (tabId) => ipcRenderer.send('check-webview-audio-state', { tabId }),
  openInNewTab: (url) => ipcRenderer.send('open-in-new-tab', url),

  // Sessões
  loadSessions: () => ipcRenderer.invoke('load-sessions'),
  saveSession: (sessionName, layoutConfig) => ipcRenderer.invoke('save-session', { sessionName, layoutConfig }),
  loadSession: (sessionId) => ipcRenderer.invoke('load-session', sessionId),
  deleteSession: (sessionId) => ipcRenderer.invoke('delete-session', sessionId),
  updateSessionsMenu: () => ipcRenderer.send('update-sessions-menu'),

  // Barra de título customizada
  popupAppMenu: (label, x, y) => ipcRenderer.send('popup-app-menu', { label, x, y }),

  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),

  // Eventos empurrados pelo processo principal (cada um retorna uma função
  // de unsubscribe, para uso direto em cleanups de useEffect)
  onAddNewTab: (callback) => subscribe('add-new-tab', callback),
  onOpenInNewTab: (callback) => subscribe('open-in-new-tab', callback),
  onAudioStateUpdate: (callback) => subscribe('audio-state-update', callback),
  onShowClearSessionDialog: (callback) => subscribe('show-clear-session-dialog', callback),
  onShowSettingsDialog: (callback) => subscribe('show-settings-dialog', callback),
  onOpenUrl: (callback) => subscribe('open-url', callback),
  onTestNotifications: (callback) => subscribe('test-notifications', callback),
  onNavigationWebviewKeyEvent: (callback) => subscribe('navigation-webview-key-event', callback),
  onMenuNewTab: (callback) => subscribe('menu-new-tab', callback),
  onMenuSplitHorizontal: (callback) => subscribe('menu-split-horizontal', callback),
  onMenuSplitVertical: (callback) => subscribe('menu-split-vertical', callback),
  onMenuCloseTab: (callback) => subscribe('menu-close-tab', callback),
  onMenuFocusUrlBar: (callback) => subscribe('menu-focus-url-bar', callback),
  onCycleTab: (callback) => subscribe('cycle-tab', callback),
  onLoadSessionInCurrentWindow: (callback) => subscribe('load-session-in-current-window', callback),
  onShowSaveSessionDialog: (callback) => subscribe('show-save-session-dialog', callback),
  onConfirmDeleteSession: (callback) => subscribe('confirm-delete-session', callback),
  onLoadSessionConfig: (callback) => subscribe('load-session-config', callback),
  onUpdateChecking: (callback) => subscribe('update-checking', callback),
  onUpdateAvailable: (callback) => subscribe('update-available', callback),
  onUpdateNotAvailable: (callback) => subscribe('update-not-available', callback),
  onUpdateError: (callback) => subscribe('update-error', callback),
  onUpdateDownloadProgress: (callback) => subscribe('update-download-progress', callback),
  onUpdateDownloaded: (callback) => subscribe('update-downloaded', callback)
});
