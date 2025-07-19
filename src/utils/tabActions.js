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
 * Duplica uma tab existente
 */
export const duplicateTab = (model, tabId) => {
  try {
    const tabNode = model.getNodeById(tabId);
    if (!tabNode) return;

    const config = tabNode.getConfig();
    const tabSetNode = tabNode.getParent();
    
    if (tabSetNode) {
      const newTabConfig = {
        type: "tab",
        name: `${tabNode.getName()} (Cópia)`,
        component: tabNode.getComponent(),
        config: { ...config }
      };

      // Adicionar a nova tab ao lado da atual
      const tabIndex = tabSetNode.getChildren().indexOf(tabNode);
      const action = Actions.addNode(
        newTabConfig, 
        tabSetNode.getId(), 
        DockLocation.CENTER, 
        tabIndex + 1
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

/**
 * Verifica se uma tab está mutada
 */
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
        isMuted: isTabMuted(model, tabId)
      };
    }
  } catch (error) {
    console.error('Erro ao obter informações da tab:', error);
  }
  return null;
};
