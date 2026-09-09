import { useState, useEffect, useCallback } from 'react';
import { splitPanelHorizontal, splitPanelVertical } from '../utils/layoutActions';
import { Actions } from 'flexlayout-react';

/**
 * Hook para navegação entre painéis com teclado
 * Ctrl+B ativa o modo de navegação
 * Setas do teclado navegam entre os painéis
 * ESC ou Ctrl+B novamente desativa o modo
 */
const usePanelNavigation = (model) => {
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [availablePanels, setAvailablePanels] = useState([]);

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

  // Event listener para teclas
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+B para ativar/desativar modo de navegação
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        toggleNavigationMode();
        return;
      }
      
      // Se não está no modo de navegação, ignorar outras teclas
      if (!isNavigationMode) return;
      
      // ESC para sair do modo de navegação
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsNavigationMode(false);
        return;
      }
      
      // Setas para navegar entre painéis
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          navigateToNextPanel();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateToPreviousPanel();
          break;
        case 'ArrowUp':
          event.preventDefault();
          navigateUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateDown();
          break;
        case 'Enter':
          event.preventDefault();
          focusActivePanel();
          setIsNavigationMode(false);
          break;
        case 'v':
        case 'V':
          event.preventDefault();
          splitActivePanelVertical();
          break;
        case 'h':
        case 'H':
          event.preventDefault();
          splitActivePanelHorizontal();
          break;
        case 'w':
        case 'W':
          event.preventDefault();
          closeActivePanel();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNavigationMode, toggleNavigationMode, navigateToNextPanel, navigateToPreviousPanel, navigateUp, navigateDown, focusActivePanel, splitActivePanelHorizontal, splitActivePanelVertical, closeActivePanel]);

  return {
    isNavigationMode,
    activePanelIndex,
    availablePanels,
    toggleNavigationMode
  };
};

export default usePanelNavigation;
