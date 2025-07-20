import { useState, useCallback } from 'react';
import { Model } from 'flexlayout-react';
import { defaultLayoutConfig } from '../config/flexLayoutConfig';

/**
 * Hook customizado para gerenciar o modelo do FlexLayout
 */
const useFlexLayoutModel = () => {
  const [model, setModel] = useState(() => Model.fromJson(defaultLayoutConfig));

  // Função para carregar uma nova configuração
  const loadConfiguration = useCallback((layoutConfig) => {
    try {
      const newModel = Model.fromJson(layoutConfig);
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
