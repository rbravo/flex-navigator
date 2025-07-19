import React, { useState } from 'react';
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
import { refreshTab, duplicateTab, toggleTabMute, closeTab, isTabMuted } from './utils/tabActions';

const App = () => {
  // Gerenciar modelo do FlexLayout
  const model = useFlexLayoutModel();

  // Configurar listeners do Electron IPC
  useElectronIPC(model);

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
    model, 
    onContextMenu: handleTabContextMenu 
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
