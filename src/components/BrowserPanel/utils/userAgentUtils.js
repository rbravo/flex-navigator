/**
 * Utilitários para gerenciamento de User Agents
 */

/**
 * User agents populares para diferentes navegadores
 */
export const USER_AGENTS = {
  CHROME_WINDOWS: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  CHROME_MAC: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  FIREFOX_WINDOWS: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  SAFARI_MAC: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  EDGE_WINDOWS: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
};

/**
 * Retorna o user agent padrão baseado na plataforma
 * @returns {string} User agent apropriado
 */
export const getDefaultUserAgent = () => {
  const platform = process.platform;
  
  switch (platform) {
    case 'darwin':
      return USER_AGENTS.CHROME_MAC;
    case 'win32':
      return USER_AGENTS.CHROME_WINDOWS;
    default:
      return USER_AGENTS.CHROME_WINDOWS;
  }
};



/**
 * Verifica se o user agent atual parece ser do Electron
 * @param {string} userAgent - User agent a verificar
 * @returns {boolean} true se parece com Electron
 */
export const isElectronUserAgent = (userAgent) => {
  return userAgent && (
    userAgent.includes('Electron') ||
    userAgent.includes('electron') ||
    userAgent.includes('flex-navigator')
  );
};
