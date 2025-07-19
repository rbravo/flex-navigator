/**
 * Utilitários para manipulação de URLs
 */

/**
 * Processa uma URL digitada pelo usuário, adicionando protocolo se necessário
 * ou convertendo para busca no Google
 * @param {string} inputUrl - URL digitada pelo usuário
 * @returns {string} URL processada
 */
export const processUrl = (inputUrl) => {
  let targetUrl = inputUrl.trim();
  
  // Adiciona protocolo se não existir
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    // Se parece com uma URL (contém ponto), adiciona https
    if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
      targetUrl = 'https://' + targetUrl;
    } else {
      // Caso contrário, faz busca no Google
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
    }
  }
  
  return targetUrl;
};

/**
 * Extrai o domínio de uma URL para usar como título da tab
 * @param {string} url - URL completa
 * @returns {string} Domínio ou URL truncada
 */
export const extractDomainOrTitle = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (e) {
    // Se a URL for inválida, usa o valor truncado
    return url.length > 20 ? url.substring(0, 20) + '...' : url;
  }
};

/**
 * Verifica se uma URL pode ser carregada em iframe
 * @param {string} url - URL a ser verificada
 * @returns {boolean} true se pode usar iframe
 */
export const canUseIframe = (url) => {
  if (!url || url === 'about:blank') return false;
  
  const blockedDomains = [
    'google.com',
    'github.com',
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'instagram.com'
  ];
  
  return !blockedDomains.some(domain => url.includes(domain)) &&
         !url.includes('search?q=') &&
         !url.startsWith('https://www.');
};
