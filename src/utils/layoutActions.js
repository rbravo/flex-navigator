import { Actions, DockLocation } from 'flexlayout-react';

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
      url: "https://www.google.com"
    }
  };

  const finalConfig = { ...defaultConfig, ...tabConfig };
  
  const action = Actions.addNode(finalConfig, tabSetId, DockLocation.CENTER, -1);
  return model.doAction(action);
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
      url: "https://www.google.com"
    }
  };
  
  const addTabAction = Actions.addNode(newTabJson, tabSetId, DockLocation.CENTER, -1);
  const newTab = model.doAction(addTabAction);
  
  // 2. Mover a tab para um novo tabset à direita
  if (newTab) {
    const moveAction = Actions.moveNode(newTab.getId(), tabSetId, DockLocation.RIGHT, -1);
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
      url: "https://www.google.com"
    }
  };
  
  const addTabAction = Actions.addNode(newTabJson, tabSetId, DockLocation.CENTER, -1);
  const newTab = model.doAction(addTabAction);
  
  // 2. Mover a tab para um novo tabset abaixo
  if (newTab) {
    const moveAction = Actions.moveNode(newTab.getId(), tabSetId, DockLocation.BOTTOM, -1);
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
      url: tabConfig?.url || "https://www.google.com"
    }
  };

  model.doAction(Actions.addNode(defaultConfig, tabsetId, DockLocation.CENTER, -1));
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
