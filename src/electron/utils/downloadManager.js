const { session, shell, ipcMain, app } = require('electron');
const fs = require('fs');
const path = require('path');

// Downloads da sessão atual do app - só em memória, some ao reiniciar (igual
// ao histórico de sessão de navegação). Guarda o DownloadItem de verdade
// (pra poder pausar/retomar/cancelar por id) junto com os dados já
// serializados que vão pro renderer.
const downloads = new Map();
let downloadCounter = 0;

const buildPayload = (id, item, state) => ({
  id,
  filename: path.basename(item.getSavePath() || item.getFilename()),
  url: item.getURL(),
  savePath: item.getSavePath(),
  totalBytes: item.getTotalBytes(),
  receivedBytes: item.getReceivedBytes(),
  state,
  canResume: item.canResume()
});

/**
 * Evita sobrescrever um arquivo existente com o mesmo nome, no mesmo padrão
 * do Chrome: "arquivo.pdf" -> "arquivo (1).pdf" -> "arquivo (2).pdf" etc.
 */
const getUniqueSavePath = (dir, filename) => {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let candidate = filename;
  let counter = 1;
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${base} (${counter})${ext}`;
    counter += 1;
  }
  return path.join(dir, candidate);
};

/**
 * Gerencia downloads iniciados a partir de sites nas webviews: mostra o
 * diálogo nativo "Salvar como" pra cada download (via
 * `item.setSaveDialogOptions` - o Electro mostra o diálogo sozinho antes de
 * começar a gravar, e cancela o download automaticamente se o usuário
 * fechar o diálogo sem escolher um local), sugerindo a pasta padrão de
 * Downloads com resolução de conflito de nome. Expõe progresso + controles
 * (pausar/retomar/cancelar/abrir) pro renderer via IPC.
 */
function setupDownloadHandler(mainWindow) {
  const webviewSession = session.fromPartition('persist:webview');

  webviewSession.on('will-download', (event, item) => {
    const id = `dl-${++downloadCounter}`;
    const suggestedPath = getUniqueSavePath(app.getPath('downloads'), item.getFilename());
    item.setSaveDialogOptions({ defaultPath: suggestedPath });

    downloads.set(id, { item });

    const send = (channel, state) => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      mainWindow.webContents.send(channel, buildPayload(id, item, state));
    };

    send('download-started', 'progressing');

    item.on('updated', (updateEvent, state) => {
      send('download-updated', state === 'interrupted' ? 'interrupted' : item.isPaused() ? 'paused' : 'progressing');
    });

    item.once('done', (doneEvent, state) => {
      send('download-done', state);
    });
  });

  ipcMain.handle('list-downloads', () =>
    Array.from(downloads.entries()).map(([id, { item }]) => buildPayload(id, item, item.getState()))
  );

  ipcMain.on('pause-download', (event, id) => {
    downloads.get(id)?.item.pause();
  });

  ipcMain.on('resume-download', (event, id) => {
    const entry = downloads.get(id);
    if (entry?.item.canResume()) entry.item.resume();
  });

  ipcMain.on('cancel-download', (event, id) => {
    downloads.get(id)?.item.cancel();
  });

  ipcMain.on('open-download-file', (event, id) => {
    const entry = downloads.get(id);
    if (entry) shell.openPath(entry.item.getSavePath());
  });

  ipcMain.on('show-download-in-folder', (event, id) => {
    const entry = downloads.get(id);
    if (entry) shell.showItemInFolder(entry.item.getSavePath());
  });
}

module.exports = { setupDownloadHandler };
