import { useState, useCallback } from 'react';
import { Model } from 'flexlayout-react';
import { getDefaultLayoutConfig } from '../config/flexLayoutConfig';

/**
 * Hook customizado para gerenciar o modelo do FlexLayout
 */
const useFlexLayoutModel = () => {
  const [model, setModel] = useState(() => Model.fromJson(getDefaultLayoutConfig()));

  // Função para carregar uma nova configuração
  const loadConfiguration = useCallback((layoutConfig) => {
    try {
      // Função para preservar ordem das tabs
      const preserveTabOrder = (node) => {
        if (node.type === 'tabset' && node.children) {
          // Adicionar índice de ordem para cada tab se não existir
          node.children.forEach((tab, index) => {
            if (!tab.config) tab.config = {};
            if (tab.config.originalIndex === undefined) {
              tab.config.originalIndex = index;
            }
          });
          
          // Ordenar tabs pelo originalIndex para manter ordem consistente
          node.children.sort((a, b) => {
            const indexA = a.config?.originalIndex ?? 0;
            const indexB = b.config?.originalIndex ?? 0;
            return indexA - indexB;
          });
        }
        
        if (node.children) {
          node.children.forEach(child => preserveTabOrder(child));
        }
      };
      
      // Aplicar preservação de ordem
      const configCopy = JSON.parse(JSON.stringify(layoutConfig));
      preserveTabOrder(configCopy.layout);
      
      const newModel = Model.fromJson(configCopy);
      setModel(newModel);
      
      return true;
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      return false;
    }
  }, []);

  // Função para obter a configuração atual
  const getCurrentConfiguration = useCallback(() => {
    return model.toJson();
  }, [model]);

  return {
    model,
    loadConfiguration,
    getCurrentConfiguration
  };
};

export default useFlexLayoutModel;
