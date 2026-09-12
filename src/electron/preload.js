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

  // Painéis (salvar/restaurar o layout de abas e painéis abertos)
  loadSessions: () => ipcRenderer.invoke('load-sessions'),
  saveSession: (sessionName, layoutConfig) => ipcRenderer.invoke('save-session', { sessionName, layoutConfig }),
  loadSession: (sessionId) => ipcRenderer.invoke('load-session', sessionId),
  deleteSession: (sessionId) => ipcRenderer.invoke('delete-session', sessionId),
  openSessionInNewWindow: (sessionId) => ipcRenderer.send('open-session-new-window', sessionId),

  // Barra de título customizada
  popupAppMenu: (label, x, y) => ipcRenderer.send('popup-app-menu', { label, x, y }),

  // Permissões pedidas por sites (câmera/mic, localização, notificações...)
  respondToPermissionRequest: (requestId, granted) =>
    ipcRenderer.send('permission-response', { requestId, granted }),

  // Popover de informações do site (certificado + permissões por origem)
  getSiteInfo: (url) => ipcRenderer.invoke('get-site-info', url),
  setSitePermission: (origin, permission, granted) =>
    ipcRenderer.send('set-site-permission', { origin, permission, granted }),

  // Tela de gerenciamento de permissões (Configurações > Permissões)
  listSitePermissions: () => ipcRenderer.invoke('list-site-permissions'),
  removeSitePermissions: (origin) => ipcRenderer.send('remove-site-permissions', origin),

  // Histórico de navegação
  listHistory: (query) => ipcRenderer.invoke('list-history', query),
  removeHistoryEntry: (id) => ipcRenderer.send('remove-history-entry', id),
  clearHistory: () => ipcRenderer.send('clear-history'),

  // Downloads
  listDownloads: () => ipcRenderer.invoke('list-downloads'),
  pauseDownload: (id) => ipcRenderer.send('pause-download', id),
  resumeDownload: (id) => ipcRenderer.send('resume-download', id),
  cancelDownload: (id) => ipcRenderer.send('cancel-download', id),
  openDownloadFile: (id) => ipcRenderer.send('open-download-file', id),
  showDownloadInFolder: (id) => ipcRenderer.send('show-download-in-folder', id),

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
  onShowSettingsDialog: (callback) => subscribe('show-settings-dialog', callback),
  onOpenUrl: (callback) => subscribe('open-url', callback),
  onTestNotifications: (callback) => subscribe('test-notifications', callback),
  onNavigationWebviewKeyEvent: (callback) => subscribe('navigation-webview-key-event', callback),
  onMenuNewTab: (callback) => subscribe('menu-new-tab', callback),
  onMenuSplitHorizontal: (callback) => subscribe('menu-split-horizontal', callback),
  onMenuSplitVertical: (callback) => subscribe('menu-split-vertical', callback),
  onMenuCloseTab: (callback) => subscribe('menu-close-tab', callback),
  onMenuFocusUrlBar: (callback) => subscribe('menu-focus-url-bar', callback),
  onMenuFindInPage: (callback) => subscribe('menu-find-in-page', callback),
  onMenuShowHistory: (callback) => subscribe('menu-show-history', callback),
  onShowHistoryDialog: (callback) => subscribe('show-history-dialog', callback),
  onMenuZoomIn: (callback) => subscribe('menu-zoom-in', callback),
  onMenuZoomOut: (callback) => subscribe('menu-zoom-out', callback),
  onMenuZoomReset: (callback) => subscribe('menu-zoom-reset', callback),
  onCycleTab: (callback) => subscribe('cycle-tab', callback),
  onLoadSessionConfig: (callback) => subscribe('load-session-config', callback),
  onUpdateChecking: (callback) => subscribe('update-checking', callback),
  onUpdateAvailable: (callback) => subscribe('update-available', callback),
  onUpdateNotAvailable: (callback) => subscribe('update-not-available', callback),
  onUpdateError: (callback) => subscribe('update-error', callback),
  onUpdateDownloadProgress: (callback) => subscribe('update-download-progress', callback),
  onUpdateDownloaded: (callback) => subscribe('update-downloaded', callback),
  onPermissionRequest: (callback) => subscribe('permission-request', callback),
  onDownloadStarted: (callback) => subscribe('download-started', callback),
  onDownloadUpdated: (callback) => subscribe('download-updated', callback),
  onDownloadDone: (callback) => subscribe('download-done', callback)
});
