import { Actions, DockLocation } from 'flexlayout-react';

/**
 * Utilitários para ações específicas das tabs
 */

/**
 * Atualiza uma tab (recarrega o conteúdo)
 */
export const refreshTab = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (tabNode && tabNode.getComponent() === 'browser') {
      // Enviar evento para recarregar a webview
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('refresh-webview', { tabId });
      } else {
        // No desenvolvimento, apenas fazer log
        console.log('Refresh tab:', tabId);
        // Aqui você pode implementar uma forma de recarregar no desenvolvimento
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar tab:', error);
  }
};

/**
 * Obtém o título atual de uma webview
 */
export const getWebviewTitle = (tabId) => {
  try {
    const webview = document.querySelector(`webview[data-tab-id="${tabId}"]`);
    if (webview && webview.getTitle) {
      return webview.getTitle();
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter título da webview:', error);
    return null;
  }
};

/**
 * Obtém a URL atual de uma webview
 */
export const getWebviewURL = (tabId) => {
  try {
    const webview = document.querySelector(`webview[data-tab-id="${tabId}"]`);
    if (webview && webview.getURL) {
      return webview.getURL();
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter URL da webview:', error);
    return null;
  }
};

/**
 * Duplica uma tab existente criando uma nova tab e navegando para a mesma URL
 */
export const duplicateTab = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (!tabNode) return;

    const config = tabNode.getConfig();
    const tabSetNode = tabNode.getParent();
    
    if (tabSetNode && config && config.url) {
      // Obter a URL atual da webview se disponível
      let targetUrl = config.url;
      const currentUrl = getWebviewURL(tabId);
      if (currentUrl && currentUrl !== 'about:blank') {
        targetUrl = currentUrl;
      }

      // Criar uma nova tab limpa que navegará para a URL
      const newTabConfig = {
        type: "tab",
        name: "Nova Aba", // Nome genérico - será atualizado automaticamente quando carregar
        component: tabNode.getComponent(),
        config: { 
          url: targetUrl // A URL para onde a nova tab navegará
        }
        // FlexLayout gerará automaticamente um novo ID único
      };

      // Adicionar a nova tab ao lado da atual
      const tabIndex = tabSetNode.getChildren().indexOf(tabNode);
      const action = Actions.addNode(
        newTabConfig, 
        tabSetNode.getId(), 
        DockLocation.CENTER, 
        tabIndex + 1,
        true // Selecionar automaticamente a nova tab
      );
      
      return model.doAction(action);
    }
  } catch (error) {
    console.error('Erro ao duplicar tab:', error);
  }
};

/**
 * Alterna o estado de mute de uma tab
 */
export const toggleTabMute = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (tabNode && tabNode.getComponent() === 'browser') {
      const config = tabNode.getConfig();
      const currentMuteState = config.muted || false;
      
      // Atualizar o estado no modelo
      const newConfig = { ...config, muted: !currentMuteState };
      
      // Enviar comando para o Electron
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('toggle-webview-mute', { 
          tabId, 
          muted: !currentMuteState 
        });
      } else {
        console.log('Toggle mute tab:', tabId, 'new state:', !currentMuteState);
      }

      // Atualizar o modelo com o novo estado
      const action = Actions.updateNodeAttributes(tabId, { config: newConfig });
      return model.doAction(action);
    }
  } catch (error) {
    console.error('Erro ao alternar mute da tab:', error);
  }
};

/**
 * Fecha uma tab específica
 */
export const closeTab = (model, tabId) => {
  try {
    const action = Actions.deleteTab(tabId);
    return model.doAction(action);
  } catch (error) {
    console.error('Erro ao fechar tab:', error);
  }
};

// Cache para evitar atualizações desnecessárias
const tabUpdateCache = new Map();

/**
 * Atualiza o título e URL de uma tab baseado no estado atual da webview
 */
export const updateTabFromWebview = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (!tabNode || tabNode.getComponent() !== 'browser') return;

    const currentTitle = getWebviewTitle(tabId);
    const currentUrl = getWebviewURL(tabId);
    
    if (currentTitle || currentUrl) {
      const config = tabNode.getConfig();
      
      // Verificar cache para evitar atualizações desnecessárias
      const cacheKey = `${tabId}-${currentTitle}-${currentUrl}`;
      const lastUpdate = tabUpdateCache.get(tabId);
      
      if (lastUpdate && lastUpdate.cacheKey === cacheKey) {
        return; // Não há mudanças significativas
      }
      
      const updates = {};
      
      // Atualizar título se mudou (evitar atualizações desnecessárias)
      if (currentTitle && currentTitle !== tabNode.getName() && 
          currentTitle.trim() !== '' && currentTitle !== 'about:blank') {
        updates.name = currentTitle;
      }
      
      // Atualizar URL se mudou (evitar atualizações desnecessárias)
      if (currentUrl && currentUrl !== config.url && 
          currentUrl.trim() !== '' && currentUrl !== 'about:blank') {
        updates.config = { ...config, url: currentUrl };
      }
      
      // Aplicar as atualizações se houver mudanças significativas
      if (Object.keys(updates).length > 0) {
        // Atualizar cache
        tabUpdateCache.set(tabId, { 
          cacheKey, 
          timestamp: Date.now() 
        });
        
        // Delay pequeno para evitar conflitos durante interações
        setTimeout(() => {
          try {
            const action = Actions.updateNodeAttributes(tabId, updates);
            model.doAction(action);
          } catch (error) {
            console.error('Erro ao aplicar atualização da tab:', error);
          }
        }, 200);
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar tab da webview:', error);
  }
};

/**
 * Atualiza o estado de áudio de uma tab
 */
export const updateTabAudioState = (model, tabId, isPlayingAudio) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (tabNode && tabNode.getComponent() === 'browser') {
      const config = tabNode.getConfig();
      
      // Só atualizar se o estado realmente mudou
      if (config.isPlayingAudio !== isPlayingAudio) {
        const newConfig = { ...config, isPlayingAudio };
        
        const action = Actions.updateNodeAttributes(tabId, { config: newConfig });
        model.doAction(action);
        
        console.log(`Tab ${tabId} audio state updated:`, isPlayingAudio);
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar estado de áudio da tab:', error);
  }
};

/**
 * Verifica periodicamente o estado de áudio de todas as tabs
 */
export const startAudioStateMonitoring = (model) => {
  if (!window.require) return null;
  
  const { ipcRenderer } = window.require('electron');
  
  const checkAudioStates = () => {
    try {
      // Obter todas as webviews ativas diretamente do DOM
      const allWebviews = document.querySelectorAll('webview[data-tab-id]');
      
      allWebviews.forEach(webview => {
        const tabId = webview.getAttribute('data-tab-id');
        if (tabId) {
          ipcRenderer.send('check-webview-audio-state', { tabId });
        }
      });
      
    } catch (error) {
      console.error('Erro ao verificar estados de áudio:', error);
    }
  };
  
  // Verificar a cada 3 segundos (reduzindo frequência para melhor performance)
  const intervalId = setInterval(checkAudioStates, 3000);
  
  // Fazer uma verificação inicial após 2 segundos
  setTimeout(checkAudioStates, 2000);
  
  return () => {
    clearInterval(intervalId);
  };
};

/**
 * Configura listeners para atualização automática de tabs quando webviews navegam
 */
export const setupWebviewListeners = (model) => {
  // Função para configurar listeners em uma webview específica
  const setupWebviewListener = (webview) => {
    if (!webview || webview.hasListener) return;
    
    // Marcar que já tem listener para evitar duplicações
    webview.hasListener = true;
    
    const tabId = webview.getAttribute('data-tab-id');
    if (!tabId) return;
    
    // Listener para quando a página termina de carregar
    webview.addEventListener('dom-ready', () => {
      setTimeout(() => updateTabFromWebview(model, tabId), 2000);
    });
    
    // Listener para mudanças de título
    webview.addEventListener('page-title-updated', () => {
      setTimeout(() => updateTabFromWebview(model, tabId), 1000);
    });
    
    // Listener para navegação
    webview.addEventListener('did-navigate', () => {
      setTimeout(() => updateTabFromWebview(model, tabId), 1500);
    });
    
    // Listener para navegação dentro da página
    webview.addEventListener('did-navigate-in-page', () => {
      setTimeout(() => updateTabFromWebview(model, tabId), 1500);
    });

    // NOVOS LISTENERS PARA ÁUDIO - usando eventos nativos do Electron
    
    // Quando o áudio começa a tocar
    webview.addEventListener('media-started-playing', () => {
      console.log(`Audio started playing in tab: ${tabId}`);
      updateTabAudioState(model, tabId, true);
    });
    
    // Quando o áudio para de tocar
    webview.addEventListener('media-paused', () => {
      //console.log(`Audio paused in tab: ${tabId}`);
      updateTabAudioState(model, tabId, false);
    });
    
    // Evento quando o áudio é pausado ou parado completamente
    webview.addEventListener('page-favicon-updated', () => {
      // Este evento pode indicar mudanças na página que afetam o áudio
      // Vamos usar como trigger para verificar o estado atual
      setTimeout(() => {
        try {
          if (typeof webview.isCurrentlyAudible === 'function') {
            const isPlaying = webview.isCurrentlyAudible();
            //console.log(`Audio state check for tab ${tabId}:`, isPlaying);
            updateTabAudioState(model, tabId, isPlaying);
          }
        } catch (error) {
          // Silenciar erro pois nem todas as webviews suportam este método
        }
      }, 500);
    });
    
    // Event listeners adicionais para capturar mudanças de estado de mídia
    webview.addEventListener('did-start-loading', () => {
      // Quando começa a carregar uma nova página, resetar estado de áudio
      updateTabAudioState(model, tabId, false);
    });
    
    webview.addEventListener('dom-ready', () => {
      // Verificar estado de áudio quando a página está pronta
      setTimeout(() => {
        try {
          if (typeof webview.isCurrentlyAudible === 'function') {
            const isPlaying = webview.isCurrentlyAudible();
            if (isPlaying) {
              //console.log(`Audio detected on page load for tab ${tabId}`);
              updateTabAudioState(model, tabId, true);
            }
          }
        } catch (error) {
          // Ignorar erros
        }
      }, 1000);
    });
  };
  
  // Observer para detectar novas webviews
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'WEBVIEW') {
              setupWebviewListener(node);
            } else {
              // Procurar webviews dentro do node adicionado
              const webviews = node.querySelectorAll('webview');
              webviews.forEach(setupWebviewListener);
            }
          }
        });
      }
    });
  });
  
  // Iniciar observação
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Configurar listeners para webviews já existentes
  const existingWebviews = document.querySelectorAll('webview');
  existingWebviews.forEach(setupWebviewListener);
  
  return observer;
};
export const isTabMuted = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (tabNode) {
      const config = tabNode.getConfig();
      return config.muted || false;
    }
  } catch (error) {
    console.error('Erro ao verificar estado de mute:', error);
  }
  return false;
};

export const isTabPlayingAudio = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (tabNode) {
      const config = tabNode.getConfig();
      return config.isPlayingAudio || false;
    }
  } catch (error) {
    console.error('Erro ao verificar se a tab está tocando áudio:', error);
  }
  return false;
};

/**
 * Obtém informações da tab para o menu de contexto
 */
export const getTabInfo = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (tabNode) {
      return {
        id: tabId,
        name: tabNode.getName(),
        component: tabNode.getComponent(),
        config: tabNode.getConfig(),
        isMuted: isTabMuted(model, tabId),
        isPlayingAudio: isTabPlayingAudio(model, tabId)
      };
    }
  } catch (error) {
    console.error('Erro ao obter informações da tab:', error);
  }
  return null;
};
