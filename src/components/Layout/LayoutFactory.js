import React from 'react';
import BrowserPanel from '../BrowserPanel';

/**
 * Factory para criação de componentes do FlexLayout
 * Determina qual componente renderizar baseado no tipo do nó
 */
const LayoutFactory = ({ model }) => {
  return (node) => {
    const component = node.getComponent();
    const config = node.getConfig();
    const nodeType = node.getType();
    
    console.log('Factory chamado para tipo:', nodeType, 'componente:', component, 'Node:', node.getId());
    
    // Ignorar tabsets - eles são containers, não precisam de renderização
    if (nodeType === 'tabset') {
      console.log('Ignorando tabset, não precisa renderizar');
      return null;
    }
    
    // Apenas processar tabs
    if (nodeType === 'tab') {
      console.log('Config do nó tab:', config);
      
      if (component === "browser") {
        return (
          <BrowserPanel 
            node={node}
            model={model}
            initialUrl={config.url || "https://www.google.com"}
          />
        );
      }
      
      // Se o componente está undefined mas temos uma URL no config, assumir que é browser
      if (!component && config && config.url) {
        console.log('Componente undefined mas config tem URL, assumindo browser');
        return (
          <BrowserPanel 
            node={node}
            model={model}
            initialUrl={config.url || "https://www.google.com"}
          />
        );
      }
      
      // Fallback: se é uma tab sem componente definido, criar um browser padrão
      if (!component) {
        console.log('Tab sem componente definido, criando browser padrão');
        return (
          <BrowserPanel 
            node={node}
            model={model}
            initialUrl="https://www.google.com"
          />
        );
      }
    }
    
    return <div>Unknown component: {component} (type: {nodeType})</div>;
  };
};

export default LayoutFactory;
