import React from 'react';

/**
 * Componente de fallback para quando não é possível usar webview ou iframe
 */
const FallbackContent = ({ currentUrl, isElectron, canUseIframeForUrl }) => {
  return (
    <div className="fallback-container">
      <div className="fallback-content">
        <div className="fallback-icon">🌐</div>
        <h2 className="fallback-title">
          Flex Navigator
        </h2>
        <div className="info-panel">
          <div className="info-row">
            <span className="info-label">URL:</span> 
            <span className="info-value">
              {currentUrl}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span> 
            <span className="info-status">
              🎯 Ativo
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Ambiente:</span> 
            <span className="info-status">
              {isElectron ? '⚡' : '🌐'} {isElectron ? 'Electron' : 'Browser'}
            </span>
          </div>
        </div>
        <div className="description">
          <p>Este é o painel do navegador. No Electron, aqui aparecerá o conteúdo web real usando webview.</p>
          <div className="tip-panel">
            <p>
              <span className="tip-icon">💡 Dica:</span> A barra de navegação está sempre ativa e pronta para uso!
            </p>
          </div>
        </div>
        {!isElectron && (
          <div className="warning-panel warning-yellow">
            <p>
              <span className="warning-icon">💡 Modo Desenvolvimento:</span> Execute com <code>npm run dev</code> para ver no Electron com navegação real!
            </p>
          </div>
        )}
        {!canUseIframeForUrl && currentUrl !== 'about:blank' && !isElectron && (
          <div className="warning-panel warning-red">
            <p>
              <span className="warning-icon">🔒 Observação:</span> Alguns sites (como Google/GitHub) bloqueiam iframes por segurança.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FallbackContent;
