import React, { useState, useEffect } from 'react';
import { Layout } from 'flexlayout-react';
import { ConfigProvider } from 'antd';
import 'flexlayout-react/style/dark.css'; // ou 'light.css' se preferir tema claro
import './App.css';

// Hooks customizados
import useFlexLayoutModel from './hooks/useFlexLayoutModel';
import useElectronIPC from './hooks/useElectronIPC';
import useSessionManager from './hooks/useSessionManager';

// Componentes de layout
import LayoutFactory from './components/Layout/LayoutFactory';
import TabSetRenderer from './components/Layout/TabSetRenderer';
import TabRenderer from './components/Layout/TabRenderer';
import TabContextMenu from './components/Layout/TabContextMenu';

// Componentes de sessão
import SaveSessionModal from './components/Session/SaveSessionModal';
import DeleteSessionModal from './components/Session/DeleteSessionModal';
import ClearSessionModal from './components/Session/ClearSessionModal';

// Componentes de configurações
import SettingsModal from './components/Settings/SettingsModal';

// Sistema de notificação customizado
import { NotificationProvider, useNotification } from './components/Updates/CustomNotificationSystem';
import CustomNotificationManager from './components/Updates/CustomNotificationSystem';

// Componente de atualizações
import UpdateManager from './components/Updates/UpdateManager';

// Utilitários para ações de tabs
import { refreshTab, duplicateTab, toggleTabMute, closeTab, isTabMuted, setupWebviewListeners } from './utils/tabActions';

// Componente interno do App que usa o hook de notificação
const AppContent = () => {
  // Gerenciar modelo do FlexLayout
  const { model, loadConfiguration } = useFlexLayoutModel();

  // Acessar o sistema de notificação
  const notificationAPI = useNotification();

  // Configurar listeners do Electron IPC
  useElectronIPC(model);

  // Gerenciar sessões
  const { 
    sessions, 
    saveSession, 
    deleteSession
    // isLoading: sessionsLoading // Commented out as it's not used
  } = useSessionManager(model, loadConfiguration);

  // Configurar o sistema de notificação customizado
  useEffect(() => {
    CustomNotificationManager.setNotificationAPI(notificationAPI);
    console.log('🔔 Sistema de notificação customizado configurado');
  }, [notificationAPI]);

  // Debug das sessões
  useEffect(() => {
    console.log('🗂️ Sessões disponíveis:', sessions.length, sessions);
  }, [sessions]);

  // Estados para modais de sessão
  const [saveSessionModalVisible, setSaveSessionModalVisible] = useState(false);
  const [clearSessionModalVisible, setClearSessionModalVisible] = useState(false);
  const [deleteSessionModal, setDeleteSessionModal] = useState({
    visible: false,
    sessionId: null,
    sessionName: ''
  });

  // Estados para novos modais
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

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
  }, [model]); // Adicionando model como dependência

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

  // Configurar listeners para eventos de sessão do menu
  useEffect(() => {
    // Listener para mostrar dialog de salvar sessão
    const handleShowSaveSessionDialog = () => {
      setSaveSessionModalVisible(true);
    };
    
    // Listener para confirmar deleção de sessão
    const handleConfirmDeleteSession = (event) => {
      const { sessionId, sessionName } = event.detail;
      setDeleteSessionModal({
        visible: true,
        sessionId,
        sessionName
      });
    };

    const handleShowClearSessionDialog = () => {
      console.log('🔔 App: Evento show-clear-session-dialog capturado');
      setClearSessionModalVisible(true);
    };

    const handleShowSettingsDialog = () => {
      setSettingsModalVisible(true);
    };

    const handleOpenUrl = (event) => {
      const url = event.detail;
      // Adicionar uma nova tab com a URL
      addNewTab(url);
    };

    const handleTestNotifications = (event) => {
      console.log('🧪 Teste de notificações solicitado via menu');
      // Usar o novo sistema customizado
      const manager = CustomNotificationManager.getInstance();
      manager.testNotification();
    };
    
    window.addEventListener('show-save-session-dialog', handleShowSaveSessionDialog);
    window.addEventListener('confirm-delete-session', handleConfirmDeleteSession);
    window.addEventListener('show-clear-session-dialog', handleShowClearSessionDialog);
    window.addEventListener('show-settings-dialog', handleShowSettingsDialog);
    window.addEventListener('open-url', handleOpenUrl);
    window.addEventListener('test-notifications', handleTestNotifications);
    
    return () => {
      window.removeEventListener('show-save-session-dialog', handleShowSaveSessionDialog);
      window.removeEventListener('confirm-delete-session', handleConfirmDeleteSession);
      window.removeEventListener('show-clear-session-dialog', handleShowClearSessionDialog);
      window.removeEventListener('show-settings-dialog', handleShowSettingsDialog);
      window.removeEventListener('open-url', handleOpenUrl);
      window.removeEventListener('test-notifications', handleTestNotifications);
    };
  }, []);

  // Estado do menu de contexto das tabs
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    tabId: null
  });

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

  // Handlers para sessões
  const handleSaveSession = async (sessionName) => {
    const result = await saveSession(sessionName);
    setSaveSessionModalVisible(false);
    
    // Atualizar menu da aplicação
    if (window.require) {
      const electron = window.require('electron');
      electron.ipcRenderer.send('update-sessions-menu');
    }
    
    return result;
  };

  const handleDeleteSession = async () => {
    const result = await deleteSession(deleteSessionModal.sessionId);
    setDeleteSessionModal({ visible: false, sessionId: null, sessionName: '' });
    
    // Atualizar menu da aplicação
    if (window.require) {
      const electron = window.require('electron');
      electron.ipcRenderer.send('update-sessions-menu');
    }
    
    return result;
  };

  // Função para limpar sessão atual
  const handleClearSession = () => {
    try {
      console.log('🧹 Iniciando limpeza da sessão atual...');
      
      // Restaurar a configuração padrão com a página inicial atual do usuário
      const { getDefaultLayoutConfig } = require('./config/flexLayoutConfig');
      const defaultConfig = getDefaultLayoutConfig();
      
      console.log('📋 Configuração padrão carregada:', defaultConfig);
      
      const result = loadConfiguration(defaultConfig);
      
      if (result) {
        console.log('✅ Sessão limpa com sucesso!');
        
        // Mostrar notificação de sucesso se disponível
        if (window.electron?.showNotification) {
          window.electron.showNotification({
            title: 'Sessão Limpa',
            body: 'A sessão atual foi limpa e uma nova sessão foi iniciada.'
          });
        }
      } else {
        console.error('❌ Erro ao limpar sessão');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro na função handleClearSession:', error);
      return false;
    }
  };

  // Função para adicionar nova tab
  const addNewTab = (url) => {
    const defaultHomePage = localStorage.getItem('flex-navigator-settings')
      ? JSON.parse(localStorage.getItem('flex-navigator-settings')).defaultHomePage
      : 'https://www.google.com';
    
    const targetUrl = url || defaultHomePage;
    
    // Usar utilitário para adicionar nova tab
    const { addNewTab } = require('./utils/layoutActions');
    addNewTab(model, targetUrl);
  };

  // Handler para salvar configurações
  const handleSaveSettings = (settings) => {
    console.log('Configurações salvas:', settings);
    // As configurações já são salvas no localStorage pelo modal
  };

  const handleCancelSaveSession = () => {
    setSaveSessionModalVisible(false);
  };

  const handleCancelDeleteSession = () => {
    setDeleteSessionModal({ visible: false, sessionId: null, sessionName: '' });
  };

  const handleClearSessionConfirm = () => {
    setClearSessionModalVisible(false);
    handleClearSession();
  };

  const handleClearSessionCancel = () => {
    setClearSessionModalVisible(false);
    console.log('Limpeza de sessão cancelada');
  };

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
    <ConfigProvider
      getPopupContainer={() => document.body}
    >
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
        
        {/* Modais de sessão */}
        <SaveSessionModal
          isVisible={saveSessionModalVisible}
          onSave={handleSaveSession}
          onCancel={handleCancelSaveSession}
          existingSessions={sessions}
        />
        
        <DeleteSessionModal
          isVisible={deleteSessionModal.visible}
          sessionName={deleteSessionModal.sessionName}
          onConfirm={handleDeleteSession}
          onCancel={handleCancelDeleteSession}
        />

        <ClearSessionModal
          visible={clearSessionModalVisible}
          onConfirm={handleClearSessionConfirm}
          onCancel={handleClearSessionCancel}
        />

        {/* Modal de configurações */}
        <SettingsModal
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
          onSave={handleSaveSettings}
        />

        {/* Gerenciador de atualizações */}
        <UpdateManager />
      </div>
    </ConfigProvider>
  );
};

// Componente principal com Provider de notificação
const App = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
