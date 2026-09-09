import { useEffect } from 'react';
import {
  addNewTabToFirstTabset,
  addNewTabToSameTabset,
  createNewTab,
  splitPanelHorizontal,
  splitPanelVertical,
  findAllTabsets
} from '../utils/layoutActions';
import { updateTabAudioState, startAudioStateMonitoring } from '../utils/tabActions';

/**
 * Retorna o id do tabset "atual": o ativo no FlexLayout ou, na ausência de
 * um ativo, o primeiro disponível
 */
const getCurrentTabsetId = (model) => {
  const activeTabset = model.getActiveTabset && model.getActiveTabset();
  if (activeTabset) return activeTabset.getId();

  const tabsets = findAllTabsets(model);
  return tabsets.length > 0 ? tabsets[0].getId() : null;
};

/**
 * Hook customizado para gerenciar eventos do Electron IPC
 */
const useElectronIPC = (model) => {
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');

        // Listener para abrir link em nova aba (vindo do context menu)
        const handleAddNewTab = (event, data) => {
          console.log('Recebido evento para adicionar nova aba:', data);
          
          if (data.sourceTabId) {
            // Se temos o ID da tab source, adicionar no mesmo tabset
            console.log('Adicionando nova aba no mesmo tabset da tab:', data.sourceTabId);
            addNewTabToSameTabset(model, data.sourceTabId, data);
          } else {
            // Fallback para o primeiro tabset
            console.log('SourceTabId não fornecido, usando primeiro tabset como fallback');
            addNewTabToFirstTabset(model, data);
          }
        };

        // Listener para comandos do context menu
        const handleOpenInNewTab = (event, url) => {
          handleAddNewTab(event, { url });
        };

        // Listeners para novos eventos dos modais
        const handleShowClearSessionDialog = () => {
          console.log('🔔 IPC: Evento show-clear-session-dialog recebido');
          window.dispatchEvent(new CustomEvent('show-clear-session-dialog'));
        };

        const handleShowSettingsDialog = () => {
          window.dispatchEvent(new CustomEvent('show-settings-dialog'));
        };

        const handleOpenUrl = (event, url) => {
          window.dispatchEvent(new CustomEvent('open-url', { detail: url }));
        };

        // Listener para teste de notificações
        const handleTestNotifications = () => {
          console.log('🧪 Teste de notificações solicitado via IPC');
          window.dispatchEvent(new CustomEvent('test-notifications'));
        };

        // Listeners para os comandos do menu "Arquivo": nova aba e divisão
        // de painel, sempre agindo sobre o tabset atualmente ativo
        const handleMenuNewTab = () => {
          const tabsetId = getCurrentTabsetId(model);
          if (tabsetId) createNewTab(model, tabsetId);
        };

        const handleMenuSplitHorizontal = () => {
          const tabsetId = getCurrentTabsetId(model);
          if (tabsetId) splitPanelHorizontal(model, tabsetId);
        };

        const handleMenuSplitVertical = () => {
          const tabsetId = getCurrentTabsetId(model);
          if (tabsetId) splitPanelVertical(model, tabsetId);
        };

        // Listener para teclas de atalho de navegação capturadas dentro de
        // uma webview (o keydown do host não dispara nesse caso, então o
        // processo principal repassa o evento via before-input-event)
        const handleWebviewNavigationKeyEvent = (event, data) => {
          window.dispatchEvent(new CustomEvent('webview-navigation-key-event', { detail: data }));
        };

        // Listener para atualizações de estado de áudio
        const handleAudioStateUpdate = (event, data) => {
          //console.log('Recebido update de áudio:', data);
          if (data.tabId) {
            if (typeof data.isAudible === 'boolean') {
              updateTabAudioState(model, data.tabId, data.isAudible);
            } else {
              console.warn('Resultado de áudio inválido para tab', data.tabId, ':', data);
            }
          }
        };

        // Registrar listeners
        ipcRenderer.on('add-new-tab', handleAddNewTab);
        ipcRenderer.on('open-in-new-tab', handleOpenInNewTab);
        ipcRenderer.on('audio-state-update', handleAudioStateUpdate);
        ipcRenderer.on('show-clear-session-dialog', handleShowClearSessionDialog);
        ipcRenderer.on('show-settings-dialog', handleShowSettingsDialog);
        ipcRenderer.on('open-url', handleOpenUrl);
        ipcRenderer.on('test-notifications', handleTestNotifications);
        ipcRenderer.on('navigation-webview-key-event', handleWebviewNavigationKeyEvent);
        ipcRenderer.on('menu-new-tab', handleMenuNewTab);
        ipcRenderer.on('menu-split-horizontal', handleMenuSplitHorizontal);
        ipcRenderer.on('menu-split-vertical', handleMenuSplitVertical);

        // Iniciar monitoramento de áudio
        const stopAudioMonitoring = startAudioStateMonitoring(model);

        // Cleanup ao desmontar o componente
        return () => {
          ipcRenderer.removeListener('add-new-tab', handleAddNewTab);
          ipcRenderer.removeListener('open-in-new-tab', handleOpenInNewTab);
          ipcRenderer.removeListener('audio-state-update', handleAudioStateUpdate);
          ipcRenderer.removeListener('show-clear-session-dialog', handleShowClearSessionDialog);
          ipcRenderer.removeListener('show-settings-dialog', handleShowSettingsDialog);
          ipcRenderer.removeListener('open-url', handleOpenUrl);
          ipcRenderer.removeListener('test-notifications', handleTestNotifications);
          ipcRenderer.removeListener('navigation-webview-key-event', handleWebviewNavigationKeyEvent);
          ipcRenderer.removeListener('menu-new-tab', handleMenuNewTab);
          ipcRenderer.removeListener('menu-split-horizontal', handleMenuSplitHorizontal);
          ipcRenderer.removeListener('menu-split-vertical', handleMenuSplitVertical);
          
          // Parar monitoramento de áudio
          if (stopAudioMonitoring) {
            stopAudioMonitoring();
          }
        };
      } catch (error) {
        console.log('Erro ao configurar IPC listeners:', error);
      }
    }
  }, [model]);
};

export default useElectronIPC;
