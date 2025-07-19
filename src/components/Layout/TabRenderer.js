import React from 'react';
import { isTabMuted } from '../../utils/tabActions';

/**
 * Renderizador customizado para tabs individuais do FlexLayout
 * Adiciona favicons e eventos de contexto
 */
const TabRenderer = ({ model, onContextMenu }) => {
  return (node, renderValues) => {
    const config = node.getConfig();
    const component = node.getComponent();
    const tabId = node.getId();
    
    // Handler para o menu de contexto
    const handleContextMenu = (event) => {
      // Verificar se o clique foi no botão de fechar (evitar abrir menu no X)
      // Testar diferentes seletores possíveis para o botão de fechar
      const closeButton = event.target.closest('.flexlayout__tab_button_trailing') ||
                         event.target.closest('.flexlayout__tab_close') ||
                         event.target.closest('[title="Close"]') ||
                         event.target.closest('.close') ||
                         (event.target.textContent === '×' || event.target.textContent === '✕');
      
      if (closeButton) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      if (onContextMenu) {
        onContextMenu(event, tabId, node);
      }
    };
    
    // Adicionar context menu para toda a tab
    renderValues.onContextMenu = handleContextMenu;
    
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
          <div>
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
          </div>
        );
      } catch (error) {
        console.log('Erro ao extrair URL para favicon:', error);
      }
    }

    // Adicionar indicador visual se a tab estiver mutada
    if (component === "browser" && isTabMuted(model, tabId)) {
      const originalContent = renderValues.content || node.getName();
      renderValues.content = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>{originalContent}</span>
          <span style={{ 
            marginLeft: '6px', 
            opacity: 0.6, 
            fontSize: '12px' 
          }}>🔇</span>
        </div>
      );
    }
  };
};

export default TabRenderer;
