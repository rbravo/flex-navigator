import React from 'react';
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

const App = () => {
  // Gerenciar modelo do FlexLayout
  const model = useFlexLayoutModel();

  // Configurar listeners do Electron IPC
  useElectronIPC(model);

  // Factory para criação de componentes
  const factory = LayoutFactory({ model });

  // Renderizadores personalizados
  const onRenderTabSet = TabSetRenderer({ model });
  const onRenderTab = TabRenderer();

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
    </div>
  );
};

export default App;
