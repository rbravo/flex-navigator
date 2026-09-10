const { app } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Persiste em disco as decisões de permissão (câmera/mic, localização,
 * notificações etc.) por origem - antes ficavam só em memória (Map) e se
 * perdiam a cada reinício do app, obrigando o usuário a decidir de novo pra
 * todo site já visitado.
 */
class PermissionManager {
  constructor() {
    this.permissionsFile = path.join(app.getPath('userData'), 'permissions.json');
    this.data = this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.permissionsFile)) return {};
      const raw = fs.readFileSync(this.permissionsFile, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      console.error('Erro ao carregar permissões salvas:', error);
      return {};
    }
  }

  persist() {
    try {
      fs.writeFileSync(this.permissionsFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
    }
  }

  /**
   * null = nunca decidido (ou decisão esquecida) - o site pode perguntar
   * normalmente. true/false = decisão lembrada.
   */
  getDecision(origin, permission) {
    const siteData = this.data[origin];
    if (!siteData || !(permission in siteData)) return null;
    return siteData[permission];
  }

  setDecision(origin, permission, granted) {
    if (!this.data[origin]) this.data[origin] = {};
    this.data[origin][permission] = granted;
    this.persist();
  }

  resetDecision(origin, permission) {
    if (!this.data[origin]) return;
    delete this.data[origin][permission];
    if (Object.keys(this.data[origin]).length === 0) {
      delete this.data[origin];
    }
    this.persist();
  }

  removeSite(origin) {
    if (!this.data[origin]) return;
    delete this.data[origin];
    this.persist();
  }

  listSites() {
    return Object.entries(this.data).map(([origin, permissions]) => ({
      origin,
      permissions: { ...permissions }
    }));
  }
}

module.exports = PermissionManager;
