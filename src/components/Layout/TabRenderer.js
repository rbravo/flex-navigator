import React from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { isTabMuted, isTabPlayingAudio } from '../../utils/tabActions';

/**
 * Renderizador customizado para tabs individuais do FlexLayout
 * Adiciona favicons e eventos de contexto
 */
const TabRenderer = ({ model, onContextMenu }) => {
  return (node, renderValues) => {
    const config = node.getConfig();
    const component = node.getComponent();
    const tabId = node.getId();
    
    // Não precisamos mais definir onContextMenu aqui - usando event delegation no App
    // Apenas adicionar o ID da tab como data attribute para facilitar a identificação
    renderValues.id = tabId;
    
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
        
        // Gerar key único baseado na URL para forçar atualização do favicon
        const faviconKey = `favicon-${tabId}-${url.hostname}`;
        
        // Verificar estado de áudio e mute
        const isMuted = isTabMuted(model, tabId);
        const isPlayingAudio = isTabPlayingAudio(model, tabId);
        
        console.log(`Tab ${tabId} - isMuted: ${isMuted}, isPlayingAudio: ${isPlayingAudio}`);

        // BOTÃO DE TESTE SIMPLES - para demonstrar a funcionalidade
        if (component === "browser") {
          renderValues.content = (
            <div style={{ display: 'flex', alignItems: 'center', maxWidth: '230px' }}>
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {node.getName()}
              </span>
            </div>
          );
        }
        
        // PRIORIDADE: Mostrar ícone de áudio/mute se houver áudio OU se estiver mutado
        // Só mostrar favicon se NÃO houver áudio e NÃO estiver mutado
        if (isPlayingAudio || isMuted) {
          let AudioIcon = Music; // ícone padrão para áudio
          let iconColor = '#1976d2'; // cor padrão
          
          if (isMuted) {
            AudioIcon = VolumeX;
            iconColor = '#666'; // cor mais escura para muted
          } else if (isPlayingAudio) {
            AudioIcon = Volume2;
            iconColor = '#1976d2'; // cor azul para áudio ativo
          }
          
          renderValues.leading = (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AudioIcon 
                size={16} 
                style={{
                  marginRight: '6px',
                  color: iconColor
                }}
              />
            </div>
          );
        } else {
          // Mostrar favicon APENAS se não houver áudio e não estiver mutado
          renderValues.leading = (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                key={faviconKey} // Key único para forçar re-render quando URL muda
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
        }
      } catch (error) {
        console.log('Erro ao extrair URL para favicon:', error);
      }
    }
  };
};

export default TabRenderer;
