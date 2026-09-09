import { useState, useEffect, useCallback, useRef } from 'react';
import { splitPanelHorizontal, splitPanelVertical } from '../utils/layoutActions';
import { Actions } from 'flexlayout-react';
import useShortcutsConfig from './useShortcutsConfig';

const noop = () => {};

// Cada opção de ShortcutsConfigPopover mapeada para um teste de modificadores
const MODIFIER_MATCHERS = {
  'Ctrl+Shift': (e) => e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey,
  'Ctrl+Alt': (e) => e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey,
  'Alt+Shift': (e) => e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey,
  'Ctrl+Meta': (e) => e.ctrlKey && e.metaKey && !e.shiftKey && !e.altKey
};

/**
 * Hook para navegação entre painéis com teclado.
 * Mantendo pressionada a combinação de modificadores configurada em
 * ShortcutsConfigPopover (Ctrl+Shift por padrão), o overlay de navegação
 * aparece e as demais teclas (setas, V, H, W, Enter, Esc) agem sobre os
 * painéis. Soltar os modificadores sai do modo.
 */
const usePanelNavigation = (model) => {
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [availablePanels, setAvailablePanels] = useState([]);
  const { isShortcutsEnabled, shortcutModifiers } = useShortcutsConfig();

  // Função para coletar todos os painéis (tabsets) disponíveis
  const collectPanels = useCallback(() => {
    if (!model || !model.getRoot) return [];
    
    const panels = [];
    
    const collectTabSets = (node) => {
      if (node.getType && node.getType() === 'tabset') {
        panels.push({
          id: node.getId(),
          node: node,
          rect: null // Será preenchido quando necessário
        });
      }
      
      if (node.getChildren) {
        node.getChildren().forEach(collectTabSets);
      }
    };
    
    collectTabSets(model.getRoot());
    return panels;
  }, [model]);

  // Atualizar lista de painéis quando o modelo mudar
  useEffect(() => {
    const panels = collectPanels();
    setAvailablePanels(panels);
    
    // Se estava no modo de navegação e o painel ativo não existe mais, resetar
    if (isNavigationMode && activePanelIndex >= panels.length) {
      setActivePanelIndex(Math.max(0, panels.length - 1));
    }
  }, [model, collectPanels, isNavigationMode, activePanelIndex]);

  // Função para aplicar estilos de opacidade aos painéis usando o sistema nativo do FlexLayout
  const applyPanelStyles = useCallback(() => {
    // Remover todas as classes de navegação primeiro
    const allTabsets = document.querySelectorAll('.flexlayout__tabset');
    allTabsets.forEach(tabset => {
      tabset.classList.remove('panel-navigation-active', 'panel-navigation-inactive');
    });

    if (!isNavigationMode) return;

    // No modo de navegação, aplicar estilos baseados no estado ativo do FlexLayout
    availablePanels.forEach((panel, index) => {
      let tabsetElement = document.querySelector(`div[data-tabsetid="${panel.id}"]`);
      
      if (!tabsetElement && allTabsets[index]) {
        tabsetElement = allTabsets[index];
      }
      
      if (tabsetElement) {
        // Verificar se o painel está ativo usando o sistema nativo do FlexLayout
        const isActivePanel = panel.node.isActive();
        
        if (isActivePanel) {
          tabsetElement.classList.add('panel-navigation-active');
          // Atualizar o índice ativo se necessário
          if (index !== activePanelIndex) {
            setActivePanelIndex(index);
          }
        } else {
          tabsetElement.classList.add('panel-navigation-inactive');
        }
      }
    });
  }, [availablePanels, isNavigationMode, activePanelIndex]);

  // Aplicar estilos sempre que o estado mudar
  useEffect(() => {
    applyPanelStyles();
  }, [applyPanelStyles]);

  // Função para navegar para o próximo painel
  const navigateToNextPanel = useCallback(() => {
    if (availablePanels.length === 0) return;
    const nextIndex = (activePanelIndex + 1) % availablePanels.length;
    setActivePanelIndex(nextIndex);
    
    // Usar a funcionalidade nativa do FlexLayout para definir o painel ativo
    const nextPanel = availablePanels[nextIndex];
    if (nextPanel && model) {
      model.doAction(Actions.setActiveTabset(nextPanel.id));
    }
  }, [availablePanels, activePanelIndex, model]);

  // Função para navegar para o painel anterior
  const navigateToPreviousPanel = useCallback(() => {
    if (availablePanels.length === 0) return;
    const prevIndex = (activePanelIndex - 1 + availablePanels.length) % availablePanels.length;
    setActivePanelIndex(prevIndex);
    
    // Usar a funcionalidade nativa do FlexLayout para definir o painel ativo
    const prevPanel = availablePanels[prevIndex];
    if (prevPanel && model) {
      model.doAction(Actions.setActiveTabset(prevPanel.id));
    }
  }, [availablePanels, activePanelIndex, model]);

  // Função para navegar para cima (primeira linha de painéis)
  const navigateUp = useCallback(() => {
    setActivePanelIndex(0);
    
    // Usar a funcionalidade nativa do FlexLayout para definir o painel ativo
    const firstPanel = availablePanels[0];
    if (firstPanel && model) {
      model.doAction(Actions.setActiveTabset(firstPanel.id));
    }
  }, [availablePanels, model]);

  // Função para navegar para baixo (última linha de painéis)
  const navigateDown = useCallback(() => {
    if (availablePanels.length > 0) {
      const lastIndex = availablePanels.length - 1;
      setActivePanelIndex(lastIndex);
      
      // Usar a funcionalidade nativa do FlexLayout para definir o painel ativo
      const lastPanel = availablePanels[lastIndex];
      if (lastPanel && model) {
        model.doAction(Actions.setActiveTabset(lastPanel.id));
      }
    }
  }, [availablePanels, model]);

  // Função para ativar/desativar o modo de navegação
  const toggleNavigationMode = useCallback(() => {
    setIsNavigationMode(prev => {
      const newMode = !prev;
      
      if (newMode) {
        // Ativando modo de navegação
        console.log('🎯 Modo de navegação entre painéis ATIVADO');
        // Encontrar o painel atualmente ativo usando o sistema nativo do FlexLayout
        if (model) {
          const activeTabset = model.getActiveTabset();
          if (activeTabset) {
            const activeIndex = availablePanels.findIndex(panel => panel.id === activeTabset.getId());
            if (activeIndex >= 0) {
              setActivePanelIndex(activeIndex);
            }
          }
        }
      } else {
        // Desativando modo de navegação
        console.log('🎯 Modo de navegação entre painéis DESATIVADO');
        // Remover todas as classes de navegação
        const allTabsets = document.querySelectorAll('.flexlayout__tabset');
        allTabsets.forEach(tabset => {
          tabset.classList.remove('panel-navigation-active', 'panel-navigation-inactive');
        });
      }
      
      return newMode;
    });
  }, [availablePanels.length]);

  // Função para dividir o painel ativo horizontalmente
  const splitActivePanelHorizontal = useCallback(() => {
    if (availablePanels.length === 0 || !isNavigationMode) return;
    
    const activePanel = availablePanels[activePanelIndex];
    if (activePanel) {
      console.log('🔄 Dividindo painel horizontalmente:', activePanel.id);
      splitPanelHorizontal(model, activePanel.id);
    }
  }, [availablePanels, activePanelIndex, isNavigationMode, model]);

  // Função para dividir o painel ativo verticalmente
  const splitActivePanelVertical = useCallback(() => {
    if (availablePanels.length === 0 || !isNavigationMode) return;
    
    const activePanelVertical = availablePanels[activePanelIndex];
    if (activePanelVertical) {
      console.log('🔄 Dividindo painel verticalmente:', activePanelVertical.id);
      splitPanelVertical(model, activePanelVertical.id);
    }
  }, [availablePanels, activePanelIndex, isNavigationMode, model]);

  // Função para fechar o painel ativo com todas as suas abas
  const closeActivePanel = useCallback(() => {
    if (availablePanels.length === 0 || !isNavigationMode) return;
    
    const panelToClose = availablePanels[activePanelIndex];
    if (panelToClose) {
      console.log('❌ Fechando painel:', panelToClose.id);
      model.doAction(Actions.deleteTabset(panelToClose.id));
    }
  }, [availablePanels, activePanelIndex, isNavigationMode, model]);

  // Função para focar no painel ativo
  const focusActivePanel = useCallback(() => {
    if (availablePanels.length === 0 || !isNavigationMode) return;
    
    const focusPanel = availablePanels[activePanelIndex];
    if (!focusPanel) return;
    
    // Encontrar o elemento do tabset ativo
    const tabsetElement = document.querySelector(`div[data-tabsetid="${focusPanel.id}"]`) ||
                          document.querySelectorAll('.flexlayout__tabset')[activePanelIndex];
    
    if (tabsetElement) {
      // Focar no primeiro elemento focável dentro do painel
      const focusableElements = tabsetElement.querySelectorAll('webview, iframe, input, button, [tabindex]');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [availablePanels, activePanelIndex, isNavigationMode]);

  // Sempre aponta para a versão mais recente das funções de ação. As ações
  // mudam de identidade a cada split/navegação (dependem de availablePanels/
  // activePanelIndex), então o efeito de teclado abaixo lê essa ref em vez de
  // depender das funções diretamente — caso contrário, executar uma ação
  // desmontaria e remontaria os listeners no meio da tecla pressionada,
  // perdendo o estado local "modificadores segurados" e deixando o overlay
  // aberto para sempre após soltar as teclas.
  const actionsRef = useRef({});
  useEffect(() => {
    actionsRef.current = {
      navigateToNextPanel,
      navigateToPreviousPanel,
      navigateUp,
      navigateDown,
      splitActivePanelHorizontal,
      splitActivePanelVertical,
      closeActivePanel,
      focusActivePanel
    };
  });

  // Detecção dos modificadores configurados (mantidos pressionados) + teclas de ação
  useEffect(() => {
    // Atalhos desabilitados pelo usuário: garantir que o modo é encerrado e não registrar nada
    if (!isShortcutsEnabled) {
      setIsNavigationMode(false);
      return undefined;
    }

    const matchesConfiguredModifiers = MODIFIER_MATCHERS[shortcutModifiers] || MODIFIER_MATCHERS['Ctrl+Shift'];
    let isModifiersHeld = false;

    const activateNavigationMode = () => {
      if (!isModifiersHeld) {
        isModifiersHeld = true;
        setIsNavigationMode(true);
      }
    };

    const deactivateNavigationMode = () => {
      if (isModifiersHeld) {
        isModifiersHeld = false;
        setIsNavigationMode(false);

        // Limpar classes visuais
        setTimeout(() => {
          const allTabsets = document.querySelectorAll('.flexlayout__tabset');
          allTabsets.forEach(tabset => {
            tabset.classList.remove('panel-navigation-active', 'panel-navigation-inactive');
          });
        }, 100);
      }
    };

    // handleKeyDown/handleKeyUp recebem tanto KeyboardEvent reais (foco fora
    // de uma webview) quanto objetos repassados pelo processo principal via
    // 'webview-navigation-key-event' (foco dentro de uma webview, onde o
    // keydown do host não é disparado)
    const handleKeyDown = (e) => {
      if (!matchesConfiguredModifiers(e)) return;

      activateNavigationMode();
      const actions = actionsRef.current;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          actions.navigateToNextPanel();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          actions.navigateToPreviousPanel();
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          actions.navigateUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          actions.navigateDown();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          e.stopPropagation();
          actions.splitActivePanelVertical();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          e.stopPropagation();
          actions.splitActivePanelHorizontal();
          break;
        case 'w':
        case 'W':
          e.preventDefault();
          e.stopPropagation();
          actions.closeActivePanel();
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          actions.focusActivePanel();
          deactivateNavigationMode(); // Sair após focar
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          deactivateNavigationMode();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (isModifiersHeld && !matchesConfiguredModifiers(e)) {
        // Pequeno delay para evitar flicker
        setTimeout(deactivateNavigationMode, 50);
      }
    };

    const handleWindowBlur = () => deactivateNavigationMode();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        deactivateNavigationMode();
      }
    };

    // Eventos reais do host (funcionam quando o foco não está em uma webview)
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Eventos repassados pelo processo principal (before-input-event) quando
    // o foco está dentro de uma webview
    const handleWebviewKeyEvent = (event) => {
      const data = event.detail;
      if (data.type === 'keyDown') {
        handleKeyDown({ ...data, preventDefault: noop, stopPropagation: noop });
      } else if (data.type === 'keyUp') {
        handleKeyUp(data);
      }
    };
    window.addEventListener('webview-navigation-key-event', handleWebviewKeyEvent);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('webview-navigation-key-event', handleWebviewKeyEvent);
    };
    // As ações são lidas via actionsRef (sempre atualizada), não como dependências:
    // isso mantém os listeners e o estado local "modificadores segurados" estáveis
    // mesmo quando um split/navegação recria essas funções.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShortcutsEnabled, shortcutModifiers]);

  return {
    isNavigationMode,
    activePanelIndex,
    availablePanels,
    shortcutModifiers,
    toggleNavigationMode
  };
};

export default usePanelNavigation;
