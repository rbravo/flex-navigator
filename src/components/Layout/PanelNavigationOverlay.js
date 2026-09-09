import React from 'react';

/**
 * Componente que exibe instruções durante o modo de navegação entre painéis
 */
const PanelNavigationOverlay = ({ isVisible, activePanelIndex, totalPanels }) => {
  if (!isVisible) return null;

  return (
    <div className="panel-navigation-overlay">
      <div className="title">🎯 Navegação entre Painéis</div>
      <div className="instructions">
        <div>Painel {activePanelIndex + 1} de {totalPanels}</div>
        <div><span className="shortcut-key">→ ←</span> Navegar entre painéis</div>
        <div><span className="shortcut-key">↑ ↓</span> Ir para primeiro/último</div>
        <div><span className="shortcut-key">V</span>: Dividir verticalmente</div>
        <div><span className="shortcut-key">H</span>: Dividir horizontalmente</div>
        <div><span className="shortcut-key">W</span>: Fechar painel</div>
        <div><span className="shortcut-key">Enter</span>: Focar no painel</div>
        <div><span className="shortcut-key">Esc</span> ou <span className="shortcut-key">Ctrl+B</span>: Sair</div>
      </div>
    </div>
  );
};

export default PanelNavigationOverlay;
