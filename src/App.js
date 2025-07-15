import React, { useState } from 'react';
import { Layout, Model, Actions, DockLocation } from 'flexlayout-react';
import { Plus, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';
import 'flexlayout-react/style/dark.css'; // ou 'light.css' se preferir tema claro
import './App.css';
import BrowserPanel from './components/BrowserPanel';

const App = () => {
  const [model] = useState(() => 
    Model.fromJson({
      global: {
        tabEnableClose: true,
        tabEnableRename: true,
        tabEnableDrag: true,
        tabDragSpeed: 0.3,
        splitterSize: 6,
        tabSetMinWidth: 150,
        tabSetMinHeight: 100,
        borderBarSize: 0,
        borderEnableDrop: false,
        tabSetClassNameTabStrip: "custom-tabstrip",
        tabSetHeaderHeight: 32,
        tabSetTabStripHeight: 32,
        tabSetEnableTabStrip: true,
        tabSetAutoSelectTab: true
      },
      borders: [],
      layout: {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 50,
            selected: 0,
            children: [
              {
                type: "tab",
                name: "Google",
                component: "browser",
                config: {
                  url: "https://www.google.com"
                }
              },
              {
                type: "tab",
                name: "GitHub",
                component: "browser",
                config: {
                  url: "https://github.com"
                }
              }
            ]
          },
          {
            type: "tabset",
            weight: 50,
            selected: 0,
            children: [
              {
                type: "tab",
                name: "YouTube",
                component: "browser",
                config: {
                  url: "https://www.youtube.com"
                }
              }
            ]
          }
        ]
      }
    })
  );

  const factory = (node) => {
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

  // Renderizador customizado para adicionar botões nos tabsets
  const onRenderTabSet = (tabSetNode, renderValues) => {
    // Adiciona botões personalizados na área de botões do tabset
    renderValues.buttons.push(
      <a
        key="add-tab"
        className="tabset-button tabset-button-add"
        title="Adicionar nova tab"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Clicou no botão add-tab');
          
          // Usar a API oficial do FlexLayout Actions
          const newTabJson = {
            type: "tab",
            name: "Nova Tab",
            component: "browser",
            config: {
              url: "https://www.google.com"
            }
          };
          
          // Usar Actions.addNode com a API correta - CENTER significa adicionar como tab no tabset atual
          const action = Actions.addNode(newTabJson, tabSetNode.getId(), DockLocation.CENTER, -1);
          
          console.log('Executando ação:', action);
          const result = model.doAction(action);
          console.log('Resultado:', result);
        }}
      >
        <Plus size={14} />
      </a>
    );

    renderValues.buttons.push(
      <a
        key="split-horizontal"
        className="tabset-button tabset-button-split"
        title="Dividir painel horizontalmente"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Clicou no botão split-horizontal');
          
          // Abordagem: criar a tab primeiro, depois mover para um novo tabset
          // 1. Criar a nova tab no tabset atual
          const newTabJson = {
            type: "tab",
            name: "Nova Página",
            component: "browser",
            config: {
              url: "https://www.google.com"
            }
          };
          
          const addTabAction = Actions.addNode(newTabJson, tabSetNode.getId(), DockLocation.CENTER, -1);
          console.log('Primeiro adicionando tab:', addTabAction);
          const newTab = model.doAction(addTabAction);
          
          // 2. Agora mover a tab para um novo tabset à direita
          if (newTab) {
            console.log('Tab criada, agora movendo para nova posição');
            const moveAction = Actions.moveNode(newTab.getId(), tabSetNode.getId(), DockLocation.RIGHT, -1);
            console.log('Ação de mover tab:', moveAction);
            model.doAction(moveAction);
          }
        }}
      >
        <SplitSquareHorizontal size={14} />
      </a>
    );

    renderValues.buttons.push(
      <a
        key="split-vertical"
        className="tabset-button tabset-button-split"
        title="Dividir painel verticalmente"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Clicou no botão split-vertical');
          
          // Abordagem: criar a tab primeiro, depois mover para um novo tabset
          // 1. Criar a nova tab no tabset atual
          const newTabJson = {
            type: "tab",
            name: "Nova Página",
            component: "browser",
            config: {
              url: "https://www.google.com"
            }
          };
          
          const addTabAction = Actions.addNode(newTabJson, tabSetNode.getId(), DockLocation.CENTER, -1);
          console.log('Primeiro adicionando tab:', addTabAction);
          const newTab = model.doAction(addTabAction);
          
          // 2. Agora mover a tab para um novo tabset abaixo
          if (newTab) {
            console.log('Tab criada, agora movendo para nova posição');
            const moveAction = Actions.moveNode(newTab.getId(), tabSetNode.getId(), DockLocation.BOTTOM, -1);
            console.log('Ação de mover tab:', moveAction);
            model.doAction(moveAction);
          }
        }}
      >
        <SplitSquareVertical size={14} />
      </a>
    );
  };

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
      />
    </div>
  );
};

export default App;
