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
 * Adiciona uma nova aba ao primeiro tabset disponível
 */
export const addNewTabToFirstTabset = (model, tabConfig) => {
  const tabsets = findAllTabsets(model);
  
  if (tabsets.length > 0) {
    const targetTabset = tabsets[0];
    
    const defaultConfig = {
      type: "tab",
      name: "Nova aba",
      component: "browser",
      config: {
        url: tabConfig?.url || "https://www.google.com"
      }
    };

    model.doAction(Actions.addNode(defaultConfig, targetTabset.getId(), DockLocation.CENTER, -1));
  }
};
