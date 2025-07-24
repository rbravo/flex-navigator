/**
 * Utilitários para gerenciar configurações do usuário
 */

/**
 * Obtém a URL da página inicial configurada pelo usuário
 * @returns {string} A URL da página inicial ou o padrão
 */
export const getDefaultHomePage = () => {
  try {
    const savedSettings = localStorage.getItem('flex-navigator-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.defaultHomePage || 'https://www.google.com';
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  
  return 'https://www.google.com';
};

/**
 * Salva as configurações do usuário
 * @param {object} settings - As configurações a serem salvas
 */
export const saveUserSettings = (settings) => {
  try {
    localStorage.setItem('flex-navigator-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return false;
  }
};

/**
 * Carrega todas as configurações do usuário
 * @returns {object} As configurações do usuário
 */
export const getUserSettings = () => {
  try {
    const savedSettings = localStorage.getItem('flex-navigator-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  
  return {
    defaultHomePage: 'https://www.google.com',
    autoUpdate: true,
    autoDownload: true
  };
};

/**
 * Verifica se as atualizações automáticas estão habilitadas
 * @returns {boolean} True se auto-update estiver habilitado
 */
export const isAutoUpdateEnabled = () => {
  const settings = getUserSettings();
  return settings.autoUpdate !== false; // Default para true
};

/**
 * Verifica se o download automático está habilitado
 * @returns {boolean} True se auto-download estiver habilitado
 */
export const isAutoDownloadEnabled = () => {
  const settings = getUserSettings();
  return settings.autoDownload !== false; // Default para true
};
