import React from 'react';

/**
 * Renderizador customizado para tabs individuais do FlexLayout
 * Adiciona favicons e outros elementos visuais
 */
const TabRenderer = () => {
  return (node, renderValues) => {
    const config = node.getConfig();
    const component = node.getComponent();
    
    // Só adicionar favicon para tabs do tipo browser
    if (component === "browser" && config && config.url) {
      try {
        const url = new URL(config.url);
        const domain = `${url.protocol}//${url.hostname}`;
        
        // Tentar múltiplas estratégias para favicon
        const faviconUrls = [
          `${domain}/favicon.ico`,
          `${domain}/favicon.png`,
          `${domain}/apple-touch-icon.png`,
          `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=16`
        ];
        
        renderValues.leading = (
          <img 
            src={faviconUrls[3]} // Usar Google favicons como padrão (mais confiável)
            alt="favicon" 
            style={{
              width: '16px',
              height: '16px',
              marginRight: '6px',
              borderRadius: '2px'
            }}
            onError={(e) => {
              // Tentar próxima URL se a atual falhar
              const currentSrc = e.target.src;
              const currentIndex = faviconUrls.findIndex(url => url === currentSrc);
              
              if (currentIndex >= 0 && currentIndex < faviconUrls.length - 1) {
                e.target.src = faviconUrls[currentIndex + 1];
              } else {
                e.target.style.display = 'none';
              }
            }}
          />
        );
      } catch (error) {
        console.log('Erro ao extrair URL para favicon:', error);
      }
    }
  };
};

export default TabRenderer;
