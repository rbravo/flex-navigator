import React from 'react';
import { useTranslation } from 'react-i18next';

const MENU_ITEMS = [
  { id: 'file', labelKey: 'menu.file.title' },
  { id: 'edit', labelKey: 'menu.edit.title' },
  { id: 'view', labelKey: 'menu.view.title' },
  { id: 'navigate', labelKey: 'menu.navigate.title' },
  { id: 'dev', labelKey: 'menu.dev.title' },
  { id: 'help', labelKey: 'menu.help.title' }
];

/**
 * Barra de título customizada: substitui a barra de título nativa + a barra
 * de menu (que juntas ocupavam duas linhas) por uma única linha, no estilo
 * Chrome/VSCode. Os botões de minimizar/maximizar/fechar continuam sendo
 * desenhados pelo Windows (via titleBarOverlay), sobrepostos no canto
 * direito; só o ícone, o menu e a área arrastável são nossos.
 */
const TitleBar = () => {
  const { t } = useTranslation();

  const handleMenuClick = (menuId, event) => {
    if (!window.electronAPI) return;

    try {
      const rect = event.currentTarget.getBoundingClientRect();
      window.electronAPI.popupAppMenu(menuId, Math.round(rect.left), Math.round(rect.bottom));
    } catch (error) {
      console.log('IPC não disponível para abrir o menu:', error);
    }
  };

  const isMac = window.electronAPI?.platform === 'darwin';

  return (
    <div className={`app-titlebar${isMac ? ' app-titlebar-mac' : ''}`}>
      <div className="app-titlebar-icon">
        <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="" />
      </div>
      <div className="app-titlebar-menu">
        {MENU_ITEMS.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className="app-titlebar-menu-item"
            onClick={(event) => handleMenuClick(id, event)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      <div className="app-titlebar-drag-spacer" />
    </div>
  );
};

export default TitleBar;
