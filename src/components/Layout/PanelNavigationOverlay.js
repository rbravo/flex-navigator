import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  if (!isVisible) return null;

  const modifierKeys = shortcutModifiers.split('+');

  const shortcuts = [
    { label: t('panelNavigationOverlay.actions.splitVertical'), keys: [...modifierKeys, 'V'] },
    { label: t('panelNavigationOverlay.actions.splitHorizontal'), keys: [...modifierKeys, 'H'] },
    { label: t('panelNavigationOverlay.actions.navigatePanels'), keys: [...modifierKeys, '←  →'] },
    { label: t('panelNavigationOverlay.actions.firstLastPanel'), keys: [...modifierKeys, '↑  ↓'] },
    { label: t('panelNavigationOverlay.actions.focusPanel'), keys: [...modifierKeys, 'Enter'] },
    { label: t('panelNavigationOverlay.actions.closePanel'), keys: [...modifierKeys, 'W'] },
    { label: t('panelNavigationOverlay.actions.exitMode'), keys: ['Esc'] }
  ];

  return (
    <div className="panel-navigation-overlay">
      <div className="pno-header">
        <div>
          <div className="pno-title">{t('panelNavigationOverlay.title')}</div>
          <div className="pno-subtitle">{t('panelNavigationOverlay.subtitle')}</div>
        </div>
        <div className="pno-panel-count">
          {t('panelNavigationOverlay.panelLabel')} <strong>{activePanelIndex + 1}</strong>{' '}
          {t('panelNavigationOverlay.of', { total: totalPanels })}
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
