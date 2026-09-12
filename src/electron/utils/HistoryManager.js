const { app } = require('electron');
const fs = require('fs');
const path = require('path');

// Limite de entradas guardadas - evita o arquivo crescer sem fim numa sessão
// longa de uso. Mantém as mais recentes.
const MAX_ENTRIES = 5000;

/**
 * Histórico de navegação: persiste em disco (mesmo padrão do SessionManager)
 * as páginas visitadas em qualquer aba, pra alimentar a tela de histórico
 * (busca + limpar).
 */
class HistoryManager {
  constructor() {
    this.historyFile = path.join(app.getPath('userData'), 'history.json');
    this.entries = this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.historyFile)) return [];
      const raw = fs.readFileSync(this.historyFile, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  }

  persist() {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(this.entries, null, 2));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  addEntry({ url, title, faviconUrl }) {
    if (!url || url === 'about:blank') return;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      title: title || url,
      faviconUrl: faviconUrl || null,
      visitedAt: new Date().toISOString()
    };

    this.entries.unshift(entry);
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.length = MAX_ENTRIES;
    }
    this.persist();
    return entry.id;
  }

  // Título e favicon chegam depois da navegação em si (eventos separados do
  // webContents) - atualiza a entrada já criada em vez de duplicá-la.
  updateEntry(id, patch) {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return;
    Object.assign(entry, patch);
    this.persist();
  }

  list(query) {
    const normalized = (query || '').trim().toLowerCase();
    if (!normalized) return this.entries;
    return this.entries.filter(
      (entry) =>
        entry.url.toLowerCase().includes(normalized) ||
        entry.title.toLowerCase().includes(normalized)
    );
  }

  removeEntry(id) {
    this.entries = this.entries.filter((entry) => entry.id !== id);
    this.persist();
  }

  clear() {
    this.entries = [];
    this.persist();
  }
}

// Instância única compartilhada entre o gravador de navegações
// (webContentsSetup.js) e os handlers IPC da tela de histórico
// (ipcHandlers.js) - evita duas cópias divergentes lendo/escrevendo o mesmo
// arquivo em paralelo.
let historyManagerInstance = null;
const getHistoryManager = () => {
  if (!historyManagerInstance) {
    historyManagerInstance = new HistoryManager();
  }
  return historyManagerInstance;
};

module.exports = HistoryManager;
module.exports.getHistoryManager = getHistoryManager;
