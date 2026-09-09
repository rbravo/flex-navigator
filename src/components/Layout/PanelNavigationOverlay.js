import React from 'react';

/**
 * Overlay que mostra os atalhos de navegação entre painéis enquanto os
 * modificadores configurados (ex.: Ctrl+Shift) estão pressionados
 */
const PanelNavigationOverlay = ({
  isVisible,
  activePanelIndex,
  totalPanels,
  shortcutModifiers = 'Ctrl+Shift'
}) => {
  if (!isVisible) return null;

  const modifierKeys = shortcutModifiers.split('+');

  const shortcuts = [
    { label: 'Dividir verticalmente', keys: [...modifierKeys, 'V'] },
    { label: 'Dividir horizontalmente', keys: [...modifierKeys, 'H'] },
    { label: 'Navegar entre painéis', keys: [...modifierKeys, '←  →'] },
    { label: 'Ir para primeiro/último painel', keys: [...modifierKeys, '↑  ↓'] },
    { label: 'Focar no painel', keys: [...modifierKeys, 'Enter'] },
    { label: 'Fechar painel', keys: [...modifierKeys, 'W'] },
    { label: 'Sair do modo', keys: ['Esc'] }
  ];

  return (
    <div className="panel-navigation-overlay">
      <div className="pno-header">
        <div>
          <div className="pno-title">🎯 Navegação entre Painéis</div>
          <div className="pno-subtitle">Segurados juntos · separador é a combinação</div>
        </div>
        <div className="pno-panel-count">
          Painel <strong>{activePanelIndex + 1}</strong> de {totalPanels}
        </div>
      </div>

      <div className="pno-list">
        {shortcuts.map((shortcut) => (
          <div className="pno-row" key={shortcut.label}>
            <span className="pno-label">{shortcut.label}</span>
            <span className="pno-keys">
              {shortcut.keys.map((key, index) => (
                <React.Fragment key={`${shortcut.label}-${key}-${index}`}>
                  {index > 0 && <span className="pno-plus">+</span>}
                  <kbd className="pno-key">{key}</kbd>
                </React.Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelNavigationOverlay;
