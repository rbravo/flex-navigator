import { Actions, DockLocation } from 'flexlayout-react';
import { getDefaultHomePage } from './userSettings';
import { layoutEventEmitter, LAYOUT_EVENTS } from './layoutEventEmitter';

/**
 * Utilitários para ações do FlexLayout
 */

/**
 * Cria uma nova tab no tabset especificado
 */
export const createNewTab = (model, tabSetId, tabConfig = {}) => {
  const defaultConfig = {
    type: "tab",
    name: "Nova Tab",
    component: "browser",
    config: {
      url: getDefaultHomePage()
    }
  };

  const finalConfig = { ...defaultConfig, ...tabConfig };
  
  // Adiciona select: true para automaticamente selecionar a nova tab
  const action = Actions.addNode(finalConfig, tabSetId, DockLocation.CENTER, -1, true);
  return model.doAction(action);
};

/**
 * Adiciona uma nova tab com URL específica ao primeiro tabset disponível
 */
export const addNewTab = (model, url = null, name = null) => {
  // Usar URL configurada pelo usuário se nenhuma URL for fornecida
  const targetUrl = url || getDefaultHomePage();
  
  // Encontrar o primeiro tabset disponível
  const root = model.getRoot();
  const findFirstTabSet = (node) => {
    if (node.getType() === 'tabset') {
      return node;
    }
    const children = node.getChildren();
    for (const child of children) {
      const result = findFirstTabSet(child);
      if (result) return result;
    }
    return null;
  };

  const firstTabSet = findFirstTabSet(root);
  if (firstTabSet) {
    const tabName = name || new URL(targetUrl).hostname || 'Nova Tab';
    const tabConfig = {
      name: tabName,
      config: {
        url: targetUrl,
        originalIndex: firstTabSet.getChildren().length
      }
    };
    
    return createNewTab(model, firstTabSet.getId(), tabConfig);
  }
  
  return null;
};

/**
 * Divide um painel horizontalmente
 */
export const splitPanelHorizontal = (model, tabSetId) => {
  // 1. Criar a nova tab no tabset atual
  const newTabJson = {
    type: "tab",
    name: "Nova Página",
    component: "browser",
    config: {
      url: getDefaultHomePage()
    }
  };
  
  const addTabAction = Actions.addNode(newTabJson, tabSetId, DockLocation.CENTER, -1, true);
  const newTab = model.doAction(addTabAction);
  
  // 2. Mover a tab para um novo tabset à direita
  if (newTab) {
    const moveAction = Actions.moveNode(newTab.getId(), tabSetId, DockLocation.RIGHT, -1, true);
    model.doAction(moveAction);
  }
  
  return newTab;
};

/**
 * Divide um painel verticalmente
 */
export const splitPanelVertical = (model, tabSetId) => {
  // 1. Criar a nova tab no tabset atual
  const newTabJson = {
    type: "tab",
    name: "Nova Página",
    component: "browser",
    config: {
      url: getDefaultHomePage()
    }
  };
  
  const addTabAction = Actions.addNode(newTabJson, tabSetId, DockLocation.CENTER, -1, true);
  const newTab = model.doAction(addTabAction);
  
  // 2. Mover a tab para um novo tabset abaixo
  if (newTab) {
    const moveAction = Actions.moveNode(newTab.getId(), tabSetId, DockLocation.BOTTOM, -1, true);
    model.doAction(moveAction);
  }
  
  return newTab;
};

/**
 * Maximiza/restaura um tabset
 */
export const toggleMaximize = (model, tabSetId) => {
  try {
    const action = Actions.maximizeToggle(tabSetId);
    return model.doAction(action);
  } catch (error) {
    console.log('Erro ao maximizar/restaurar:', error);
    return null;
  }
};

/**
 * Toggle da visibilidade da barra de navegação de um tabset
 */
export const toggleNavigationBar = (model, tabSetId) => {
  try {
    // Encontra o tabset
    const tabset = model.getNodeById(tabSetId);
    if (!tabset) {
      console.error('Tabset não encontrado:', tabSetId);
      return null;
    }

    // Verifica o estado atual da barra de navegação
    const currentConfig = tabset.getConfig() || {};
    const hideNavBar = !currentConfig.hideNavigationBar; // Inverte o estado

    console.log(`${hideNavBar ? 'Escondendo' : 'Mostrando'} barra de navegação do tabset ${tabSetId}`);
    
    // Atualiza a configuração do tabset
    const action = Actions.updateNodeAttributes(tabSetId, {
      config: {
        ...currentConfig,
        hideNavigationBar: hideNavBar
      }
    });

    const result = model.doAction(action);
    
    // Emitir evento para notificar componentes interessados
    layoutEventEmitter.emit(LAYOUT_EVENTS.NAVIGATION_BAR_TOGGLED, {
      tabSetId,
      hideNavigationBar: hideNavBar
    });
    
    layoutEventEmitter.emit(LAYOUT_EVENTS.TABSET_CONFIG_CHANGED, {
      tabSetId,
      config: { ...currentConfig, hideNavigationBar: hideNavBar }
    });
    
    console.log('Evento emitido para tabset:', tabSetId, 'hideNavigationBar:', hideNavBar);
    
    return result;
  } catch (error) {
    console.log('Erro ao toggle da barra de navegação:', error);
    return null;
  }
};

/**
 * Encontra todos os tabsets no modelo
 */
export const findAllTabsets = (model) => {
  const rootNode = model.getRoot();
  const tabsets = [];
  
  function findTabsets(node) {
    if (node.getType() === 'tabset') {
      tabsets.push(node);
    }
    node.getChildren().forEach(child => findTabsets(child));
  }
  
  findTabsets(rootNode);
  return tabsets;
};

/**
 * Encontra o tabset que contém uma tab específica
 */
export const findTabsetContainingTab = (model, tabId) => {
  const tabsets = findAllTabsets(model);
  
  for (const tabset of tabsets) {
    const children = tabset.getChildren();
    for (const child of children) {
      if (child.getId() === tabId) {
        return tabset;
      }
    }
  }
  return null;
};

/**
 * Adiciona uma nova aba ao tabset especificado
 */
export const addNewTabToTabset = (model, tabsetId, tabConfig) => {
  const defaultConfig = {
    type: "tab",
    name: "Nova aba",
    component: "browser",
    config: {
      url: tabConfig?.url || getDefaultHomePage()
    }
  };

  model.doAction(Actions.addNode(defaultConfig, tabsetId, DockLocation.CENTER, -1, true));
};

/**
 * Adiciona uma nova aba ao primeiro tabset disponível
 */
export const addNewTabToFirstTabset = (model, tabConfig) => {
  const tabsets = findAllTabsets(model);
  
  if (tabsets.length > 0) {
    const targetTabset = tabsets[0];
    addNewTabToTabset(model, targetTabset.getId(), tabConfig);
  }
};

/**
 * Adiciona uma nova aba ao mesmo tabset de uma tab específica
 */
export const addNewTabToSameTabset = (model, sourceTabId, tabConfig) => {
  const sourceTabset = findTabsetContainingTab(model, sourceTabId);
  
  if (sourceTabset) {
    addNewTabToTabset(model, sourceTabset.getId(), tabConfig);
  } else {
    // Fallback para o primeiro tabset se não encontrar o source
    console.warn('Tabset não encontrado para tab:', sourceTabId, 'usando primeiro tabset como fallback');
    addNewTabToFirstTabset(model, tabConfig);
  }
};
