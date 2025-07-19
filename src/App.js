import React, { useState, useEffect } from 'react';
import { Layout } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css'; // ou 'light.css' se preferir tema claro
import './App.css';

// Hooks customizados
import useFlexLayoutModel from './hooks/useFlexLayoutModel';
import useElectronIPC from './hooks/useElectronIPC';

// Componentes de layout
import LayoutFactory from './components/Layout/LayoutFactory';
import TabSetRenderer from './components/Layout/TabSetRenderer';
import TabRenderer from './components/Layout/TabRenderer';
import TabContextMenu from './components/Layout/TabContextMenu';

// Utilitários para ações de tabs
import { refreshTab, duplicateTab, toggleTabMute, closeTab, isTabMuted, setupWebviewListeners } from './utils/tabActions';

const App = () => {
  // Gerenciar modelo do FlexLayout
  const model = useFlexLayoutModel();

  // Configurar listeners do Electron IPC
  useElectronIPC(model);

  // Configurar event delegation para context menu das tabs
  useEffect(() => {
    const handleGlobalContextMenu = (event) => {
      // Verificar se o clique direito foi em uma tab
      const tabElement = event.target.closest('.flexlayout__tab_button');
      
      if (tabElement) {
        // Procurar o ID da tab
        const tabButton = tabElement;
        const tabId = findTabIdFromElement(tabButton);
        
        if (tabId) {
          // Verificar se não foi no botão de fechar
          const closeButton = event.target.closest('.flexlayout__tab_button_trailing') ||
                             event.target.closest('.flexlayout__tab_close') ||
                             event.target.closest('[title="Close"]') ||
                             event.target.closest('.close') ||
                             (event.target.textContent === '×' || event.target.textContent === '✕');
          
          if (!closeButton) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('🎯 Context menu ativado para tab:', tabId);
            
            setContextMenu({
              isVisible: true,
              position: { x: event.clientX, y: event.clientY },
              tabId: tabId
            });
          }
        }
      }
    };
    
    // Função auxiliar para encontrar o ID da tab
    const findTabIdFromElement = (element) => {
      // Estratégia 1: Verificar atributos diretos
      const ariaControls = element.getAttribute('aria-controls');
      if (ariaControls) return ariaControls;
      
      const dataNodeId = element.getAttribute('data-node-id');
      if (dataNodeId) return dataNodeId;
      
      const id = element.getAttribute('id');
      if (id) return id;
      
      // Estratégia 2: Usar o modelo para mapear elementos para IDs
      // Vamos iterar pelas tabs no modelo e verificar qual corresponde
      if (model) {
        const allTabs = [];
        
        // Função recursiva para coletar todas as tabs
        const collectTabs = (node) => {
          if (node.getType && node.getType() === 'tab') {
            allTabs.push(node);
          }
          if (node.getChildren) {
            node.getChildren().forEach(collectTabs);
          }
        };
        
        if (model.getRoot) {
          collectTabs(model.getRoot());
        }
        
        // Para cada tab, verificar se o elemento corresponde
        for (const tabNode of allTabs) {
          const tabName = tabNode.getName();
          const textContent = element.textContent || '';
          
          // Se o texto do elemento contém o nome da tab, é provável que seja ela
          if (textContent.includes(tabName)) {
            return tabNode.getId();
          }
        }
      }
      
      return null;
    };
    
    // Adicionar listener global
    document.addEventListener('contextmenu', handleGlobalContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, []);

  // Configurar listeners para atualização automática de tabs
  useEffect(() => {
    if (model) {
      const observer = setupWebviewListeners(model);
      
      // Cleanup function
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [model]);

  // Estado do menu de contexto das tabs
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    tabId: null
  });

  // Handler para o menu de contexto das tabs
  const handleTabContextMenu = (event, tabId, node) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      tabId: tabId
    });
  };

  // Fechar menu de contexto
  const handleCloseContextMenu = () => {
    setContextMenu({
      isVisible: false,
      position: { x: 0, y: 0 },
      tabId: null
    });
  };

  // Ações do menu de contexto
  const handleRefresh = () => refreshTab(model, contextMenu.tabId);
  const handleDuplicate = () => duplicateTab(model, contextMenu.tabId);
  const handleToggleMute = () => toggleTabMute(model, contextMenu.tabId);
  const handleCloseTab = () => closeTab(model, contextMenu.tabId);

  // Factory para criação de componentes
  const factory = LayoutFactory({ model });

  // Renderizadores personalizados
  const onRenderTabSet = TabSetRenderer({ model });
  const onRenderTab = TabRenderer({ 
    model
    // Removido onContextMenu - usando event delegation agora
  });

  // Handler para interceptar ações do FlexLayout
  const onAction = (action) => {
    // Intercepta e permite todas as ações do FlexLayout
    console.log('Action recebida:', action);
    
    if (action.type === 'add_node') {
      console.log('Adicionando novo nó:', action);
    } else if (action.type === 'split_node') {
      console.log('Dividindo painel:', action);
    }
    
    // Sempre retorna a ação para permitir que seja executada
    return action;
  };

  return (
    <div className="App">
      <Layout 
        model={model} 
        factory={factory}
        onAction={onAction}
        onRenderTabSet={onRenderTabSet}
        onRenderTab={onRenderTab}
      />
      
      {/* Menu de contexto das tabs */}
      <TabContextMenu
        isVisible={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={handleCloseContextMenu}
        onRefresh={handleRefresh}
        onDuplicate={handleDuplicate}
        onToggleMute={handleToggleMute}
        onCloseTab={handleCloseTab}
        isMuted={contextMenu.tabId ? isTabMuted(model, contextMenu.tabId) : false}
      />
    </div>
  );
};

export default App;
