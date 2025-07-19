import React from 'react';
import { Plus, SplitSquareHorizontal, SplitSquareVertical, Maximize2, Minimize2 } from 'lucide-react';
import { createNewTab, splitPanelHorizontal, splitPanelVertical, toggleMaximize } from '../../utils/layoutActions';

/**
 * Renderizador customizado para tabsets do FlexLayout
 * Adiciona botões de controle personalizados
 */
const TabSetRenderer = ({ model }) => {
  return (tabSetNode, renderValues) => {
    // Botão para adicionar nova tab
    renderValues.buttons.push(
      <button
        key="add-tab"
        className="tabset-button tabset-button-add"
        title="Adicionar nova tab"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Clicou no botão add-tab');
          createNewTab(model, tabSetNode.getId());
        }}
      >
        <Plus size={14} />
      </button>
    );

    // Botão para dividir painel horizontalmente
    renderValues.buttons.push(
      <button
        key="split-horizontal"
        className="tabset-button tabset-button-split"
        title="Dividir painel horizontalmente"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Clicou no botão split-horizontal');
          splitPanelHorizontal(model, tabSetNode.getId());
        }}
      >
        <SplitSquareHorizontal size={14} />
      </button>
    );

    // Botão para dividir painel verticalmente
    renderValues.buttons.push(
      <button
        key="split-vertical"
        className="tabset-button tabset-button-split"
        title="Dividir painel verticalmente"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Clicou no botão split-vertical');
          splitPanelVertical(model, tabSetNode.getId());
        }}
      >
        <SplitSquareVertical size={14} />
      </button>
    );

    // Botão para maximizar/restaurar
    renderValues.buttons.push(
      <button
        key="maximize"
        className="tabset-button tabset-button-maximize"
        title={tabSetNode.isMaximized() ? "Restaurar painel" : "Maximizar painel"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Clicou no botão maximizar/restaurar');
          toggleMaximize(model, tabSetNode.getId());
        }}
      >
        {tabSetNode.isMaximized() ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>
    );
  };
};

export default TabSetRenderer;
