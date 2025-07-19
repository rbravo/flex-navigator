import { useState } from 'react';
import { Model } from 'flexlayout-react';
import { defaultLayoutConfig } from '../config/flexLayoutConfig';

/**
 * Hook customizado para gerenciar o modelo do FlexLayout
 */
const useFlexLayoutModel = () => {
  const [model] = useState(() => Model.fromJson(defaultLayoutConfig));

  return model;
};

export default useFlexLayoutModel;
