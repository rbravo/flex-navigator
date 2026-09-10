import React from 'react';

const MENU_LABELS = ['Arquivo', 'Editar', 'Visualizar', 'Navegar', 'Sessão', 'Dev', 'Ajuda'];

/**
 * Barra de título customizada: substitui a barra de título nativa + a barra
 * de menu (que juntas ocupavam duas linhas) por uma única linha, no estilo
 * Chrome/VSCode. Os botões de minimizar/maximizar/fechar continuam sendo
 * desenhados pelo Windows (via titleBarOverlay), sobrepostos no canto
 * direito; só o ícone, o menu e a área arrastável são nossos.
 */
const TitleBar = () => {
  const handleMenuClick = (label, event) => {
    if (!window.require) return;

    try {
      const { ipcRenderer } = window.require('electron');
      const rect = event.currentTarget.getBoundingClientRect();
      ipcRenderer.send('popup-app-menu', {
        label,
        x: Math.round(rect.left),
        y: Math.round(rect.bottom)
      });
    } catch (error) {
      console.log('IPC não disponível para abrir o menu:', error);
    }
  };

  const isMac = process.platform === 'darwin';

  return (
    <div className={`app-titlebar${isMac ? ' app-titlebar-mac' : ''}`}>
      <div className="app-titlebar-icon">
        <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="" />
      </div>
      <div className="app-titlebar-menu">
        {MENU_LABELS.map((label) => (
          <button
            key={label}
            type="button"
            className="app-titlebar-menu-item"
            onClick={(event) => handleMenuClick(label, event)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="app-titlebar-drag-spacer" />
    </div>
  );
};

export default TitleBar;
