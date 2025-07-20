const { app } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Gerenciador de sessões do FlexLayout
 * Responsável por salvar e carregar configurações de layout
 */
class SessionManager {
  constructor() {
    this.sessionsFile = path.join(app.getPath('userData'), 'sessions.json');
    this.ensureSessionsFile();
  }

  /**
   * Garante que o arquivo de sessões existe
   */
  ensureSessionsFile() {
    try {
      if (!fs.existsSync(this.sessionsFile)) {
        fs.writeFileSync(this.sessionsFile, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Erro ao criar arquivo de sessões:', error);
    }
  }

  /**
   * Carrega todas as sessões salvas
   */
  loadSessions() {
    try {
      const data = fs.readFileSync(this.sessionsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      return [];
    }
  }

  /**
   * Salva uma nova sessão
   */
  saveSession(sessionName, layoutConfig) {
    try {
      const sessions = this.loadSessions();
      const existingIndex = sessions.findIndex(session => session.name === sessionName);
      
      const sessionData = {
        id: existingIndex !== -1 ? sessions[existingIndex].id : Date.now().toString(),
        name: sessionName,
        config: layoutConfig,
        createdAt: existingIndex !== -1 ? sessions[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex !== -1) {
        // Sobrescrever sessão existente
        sessions[existingIndex] = sessionData;
      } else {
        // Adicionar nova sessão
        sessions.push(sessionData);
      }

      fs.writeFileSync(this.sessionsFile, JSON.stringify(sessions, null, 2));
      return { success: true, session: sessionData };
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove uma sessão
   */
  deleteSession(sessionId) {
    try {
      const sessions = this.loadSessions();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);
      
      if (filteredSessions.length === sessions.length) {
        return { success: false, error: 'Sessão não encontrada' };
      }

      fs.writeFileSync(this.sessionsFile, JSON.stringify(filteredSessions, null, 2));
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtém uma sessão específica
   */
  getSession(sessionId) {
    try {
      const sessions = this.loadSessions();
      const session = sessions.find(session => session.id === sessionId);
      return session || null;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
  }
}

module.exports = SessionManager;
