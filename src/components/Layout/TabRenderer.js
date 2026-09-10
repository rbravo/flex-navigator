import React from 'react';
import { Volume2, VolumeX, Music, Globe } from 'lucide-react';
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

        // Ordem de tentativas: o favicon que a própria página declarou (via
        // evento 'page-favicon-updated' da webview, o mais preciso) primeiro;
        // depois as convenções comuns de caminho. Sem serviço de terceiros -
        // se tudo isso falhar, cai no ícone genérico (Globe) abaixo, sem
        // depender de enviar o domínio visitado para o Google.
        const faviconUrls = [
          config.faviconUrl,
          `${domain}/favicon.ico`,
          `${domain}/favicon.png`,
          `${domain}/apple-touch-icon.png`
        ].filter(Boolean);

        // Gerar key único baseado na URL/favicon para forçar atualização
        // (e reiniciar a cadeia de fallback) quando a tab navega
        const faviconKey = `favicon-${tabId}-${url.hostname}-${config.faviconUrl || 'default'}`;
        
        // Verificar estado de áudio e mute
        const isMuted = isTabMuted(model, tabId);
        const isPlayingAudio = isTabPlayingAudio(model, tabId);
        
        //console.log(`Tab ${tabId} - isMuted: ${isMuted}, isPlayingAudio: ${isPlayingAudio}`);

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
          // Mostrar favicon APENAS se não houver áudio e não estiver mutado.
          // O ícone genérico (Globe) fica sempre por baixo, mas só continua
          // visível enquanto a <img> não carregou (ou depois de esgotar
          // todas as tentativas) - onLoad esconde o Globe assim que um
          // favicon carrega de verdade, senão favicons com transparência
          // deixam o Globe aparecendo por trás.
          renderValues.leading = (
            <div
              key={faviconKey} // Remonta Globe + img juntos quando a cadeia de favicon reinicia,
              // senão o Globe (não controlado pelo React após o onLoad imperativo) fica
              // com display:none preso de uma tentativa anterior bem-sucedida
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '16px',
                height: '16px',
                marginRight: '6px'
              }}>
              <Globe
                size={16}
                style={{ position: 'absolute', top: 0, left: 0, color: '#999999' }}
              />
              {faviconUrls.length > 0 && (
                <img
                  src={faviconUrls[0]}
                  alt="favicon"
                  style={{
                    position: 'relative',
                    width: '16px',
                    height: '16px',
                    borderRadius: '2px'
                  }}
                  onLoad={(e) => {
                    // Favicon carregou de verdade: esconde o Globe por baixo
                    const globeIcon = e.target.previousElementSibling;
                    if (globeIcon) globeIcon.style.display = 'none';
                  }}
                  onError={(e) => {
                    // Tentar a próxima URL da cadeia de fallback se a atual falhar
                    const attemptIndex = Number(e.target.dataset.faviconAttempt || 0);
                    const nextIndex = attemptIndex + 1;

                    if (nextIndex < faviconUrls.length) {
                      e.target.dataset.faviconAttempt = nextIndex;
                      e.target.src = faviconUrls[nextIndex];
                    } else {
                      // Esgotou as tentativas: esconde a img, revelando o Globe
                      e.target.style.display = 'none';
                    }
                  }}
                />
              )}
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
