import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Componente de fallback para quando não é possível usar webview ou iframe
 */
const FallbackContent = ({ currentUrl, isElectron, canUseIframeForUrl }) => {
  const { t } = useTranslation();

  return (
    <div className="fallback-container">
      <div className="fallback-content">
        <div className="fallback-icon">🌐</div>
        <h2 className="fallback-title">
          {t('fallback.title')}
        </h2>
        <div className="info-panel">
          <div className="info-row">
            <span className="info-label">{t('fallback.urlLabel')}</span>
            <span className="info-value">
              {currentUrl}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">{t('fallback.statusLabel')}</span>
            <span className="info-status">
              {t('fallback.statusActive')}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">{t('fallback.environmentLabel')}</span>
            <span className="info-status">
              {isElectron ? '⚡' : '🌐'} {isElectron ? t('fallback.environmentElectron') : t('fallback.environmentBrowser')}
            </span>
          </div>
        </div>
        <div className="description">
          <p>{t('fallback.description')}</p>
          <div className="tip-panel">
            <p>
              <span className="tip-icon">💡 {t('fallback.tipLabel')}</span> {t('fallback.tip')}
            </p>
          </div>
        </div>
        {!isElectron && (
          <div className="warning-panel warning-yellow">
            <p>
              <span className="warning-icon">💡</span> {t('fallback.devModeWarningBefore')} <code>npm run dev</code> {t('fallback.devModeWarningAfter')}
            </p>
          </div>
        )}
        {!canUseIframeForUrl && currentUrl !== 'about:blank' && !isElectron && (
          <div className="warning-panel warning-red">
            <p>
              <span className="warning-icon">🔒</span> {t('fallback.iframeWarning')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FallbackContent;
