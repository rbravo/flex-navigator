import React, { useMemo } from 'react';
import { ConfigProvider } from 'antd';
import { darkTheme } from '../utils/theme';
import { canUseIframe } from '../utils/urlUtils';
import { getDefaultUserAgent } from '../utils/userAgentUtils';
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
  // Memoriza o user agent para evitar recriações desnecessárias
  const userAgent = useMemo(() => getDefaultUserAgent(), []);
  
  // Memoriza a webview para não recriar a cada mudança de URL
  const webviewElement = useMemo(() => {
    if (!isElectron) return null;
    
    return (
      <webview
        ref={webviewRef}
        src={currentUrl} // Esta será a URL inicial apenas
        data-tab-id={nodeId}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        allowpopups="true"
        nodeintegration="false"
        webpreferences="allowRunningInsecureContent=false, javascript=true, webSecurity=true, contextIsolation=true"
        useragent={userAgent}
        partition="persist:webview"
        enableremotemodule="false"
      />
    );
  }, [isElectron, currentUrl, nodeId, userAgent]); // currentUrl só afeta na criação inicial

  const renderWebContent = () => {
    if (isElectron) {
      // Retorna a webview memorizada
      return webviewElement;
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
