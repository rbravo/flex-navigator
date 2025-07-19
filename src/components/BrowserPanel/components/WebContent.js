import React from 'react';
import { ConfigProvider } from 'antd';
import { darkTheme } from '../utils/theme';
import { canUseIframe } from '../utils/urlUtils';
import FallbackContent from './FallbackContent';

/**
 * Componente responsável por renderizar o conteúdo web (webview, iframe ou fallback)
 */
const WebContent = ({
  isElectron,
  currentUrl,
  webviewRef,
  iframeRef,
  nodeId,
  setIsLoading,
  setLoadingComplete
}) => {
  const renderWebContent = () => {
    if (isElectron) {
      // No Electron, usa webview real
      return (
        <webview
          ref={webviewRef}
          src={currentUrl}
          data-tab-id={nodeId}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allowpopups="true"
          nodeintegration="false"
          webpreferences="allowRunningInsecureContent, contextIsolation=false"
          partition="persist:webview"
        />
      );
    } else {
      // No browser de desenvolvimento, tenta usar iframe quando possível
      const canUseIframeForUrl = canUseIframe(currentUrl);
      
      if (canUseIframeForUrl && currentUrl !== 'about:blank') {
        return (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'white'
            }}
            onLoad={() => {
              setLoadingComplete(true);
              setTimeout(() => {
                setIsLoading(false);
                setLoadingComplete(false);
              }, 300);
            }}
            onError={() => {
              setLoadingComplete(true);
              setTimeout(() => {
                setIsLoading(false);
                setLoadingComplete(false);
              }, 300);
            }}
            title="Browser content"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        );
      }
      
      // Fallback: mostra simulação melhorada com Ant Design
      return (
        <ConfigProvider theme={darkTheme}>
          <FallbackContent 
            currentUrl={currentUrl}
            isElectron={isElectron}
            canUseIframeForUrl={canUseIframeForUrl}
          />
        </ConfigProvider>
      );
    }
  };

  return renderWebContent();
};

export default WebContent;
