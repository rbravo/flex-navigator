import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConfigProvider } from 'antd';
import { darkTheme } from './utils/theme';
import { extractDomainOrTitle, processUrl } from './utils/urlUtils';
import ControlsBar from './components/ControlsBar';
import WebContent from './components/WebContent';
import LoadingBar from './components/LoadingBar';
import './BrowserPanel.css';

/**
 * Componente principal do painel de navegação
 */
const BrowserPanel = ({ node, model, initialUrl }) => {
  const [url, setUrl] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  const webviewRef = useRef(null);
  const iframeRef = useRef(null);

  // Detecta se está rodando no Electron
  useEffect(() => {
    setIsElectron(window.require !== undefined);
  }, []);

  // Função para atualizar o estado de navegação
  const updateNavigationState = useCallback(() => {
    if (isElectron && webviewRef.current) {
      try {
        setCanGoBack(webviewRef.current.canGoBack());
        setCanGoForward(webviewRef.current.canGoForward());
      } catch (error) {
        console.error('Erro ao atualizar estado de navegação:', error);
      }
    }
  }, [isElectron]);

  // Configurar listeners da webview quando ela estiver pronta
  useEffect(() => {
    if (isElectron && webviewRef.current) {
      const webview = webviewRef.current;
      
      // Aguardar a webview estar pronta
      const handleDomReady = () => {
        console.log('WebView DOM ready, configurando listeners');
        
        // Aguardar um pequeno delay para garantir que tudo está pronto
        setTimeout(() => {
          updateNavigationState();
          
          // Tentar obter URL atual de forma segura
          try {
            if (webview.getURL && typeof webview.getURL === 'function') {
              const currentWebviewUrl = webview.getURL();
              if (currentWebviewUrl && currentWebviewUrl !== 'about:blank') {
                setCurrentUrl(currentWebviewUrl);
                setUrl(currentWebviewUrl);
              }
            }
          } catch (error) {
            console.log('Ainda não é possível obter URL da webview:', error.message);
          }
        }, 100);
        
        // Adicionar listener para mudanças de navegação
        webview.addEventListener('did-navigate', (e) => {
          setCurrentUrl(e.url);
          setUrl(e.url);
          updateNavigationState();
        });
        
        webview.addEventListener('did-navigate-in-page', (e) => {
          setCurrentUrl(e.url);
          setUrl(e.url);
          updateNavigationState();
        });
        
        webview.addEventListener('did-start-loading', () => {
          setIsLoading(true);
        });
        
        webview.addEventListener('did-stop-loading', () => {
          setLoadingComplete(true);
          setTimeout(() => {
            setIsLoading(false);
            setLoadingComplete(false);
          }, 300);
          updateNavigationState();
        });
        
        webview.addEventListener('did-fail-load', (e) => {
          console.error('Falha ao carregar página:', e);
          setLoadingComplete(true);
          setTimeout(() => {
            setIsLoading(false);
            setLoadingComplete(false);
          }, 300);
          updateNavigationState();
        });

        // Listener para abrir links em nova aba
        webview.addEventListener('new-window', (e) => {
          e.preventDefault();
          console.log('Link solicitado para abrir em nova janela:', e.url);
          
          // Enviar para o processo principal para criar nova aba
          if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('open-in-new-tab', e.url);
          }
        });
      };
      
      // Sempre aguardar o evento dom-ready para garantir que a webview está pronta
      webview.addEventListener('dom-ready', handleDomReady);
      
      return () => {
        // Cleanup listeners
        try {
          webview.removeEventListener('dom-ready', handleDomReady);
        } catch (error) {
          console.log('Erro ao remover listeners:', error.message);
        }
      };
    }
  }, [isElectron, updateNavigationState]);

  // Funções de navegação
  const handleBack = useCallback(() => {
    if (isElectron && webviewRef.current && canGoBack) {
      webviewRef.current.goBack();
    }
  }, [isElectron, canGoBack]);

  const handleForward = useCallback(() => {
    if (isElectron && webviewRef.current && canGoForward) {
      webviewRef.current.goForward();
    }
  }, [isElectron, canGoForward]);

  const handleRefresh = useCallback(() => {
    if (isLoading) {
      // Se está carregando, para o carregamento
      setIsLoading(false);
      if (isElectron && webviewRef.current) {
        webviewRef.current.stop();
      }
    } else {
      // Se não está carregando, recarrega a página
      setIsLoading(true);
      if (isElectron && webviewRef.current) {
        webviewRef.current.reload();
      } else if (iframeRef.current) {
        // Para desenvolvimento no browser, força reload do iframe
        const currentSrc = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => {
          iframeRef.current.src = currentSrc;
        }, 10);
      }
    }
  }, [isLoading, isElectron]);

  const navigateToUrl = useCallback((inputUrl) => {
    const targetUrl = processUrl(inputUrl);
    setCurrentUrl(targetUrl);
    setIsLoading(true);
    
    if (isElectron && webviewRef.current) {
      webviewRef.current.src = targetUrl;
    } else if (iframeRef.current) {
      // Para desenvolvimento no browser, usa iframe
      iframeRef.current.src = targetUrl;
    }
  }, [isElectron]);

  // Atualiza o título da tab com base na URL
  useEffect(() => {
    if (node && currentUrl) {
      const title = extractDomainOrTitle(currentUrl);
      node.getModel().doAction({
        type: 'rename_tab',
        node: node.getId(),
        text: title
      });
    }
  }, [currentUrl, node]);

  // Timeout para o loading - evita que fique "travado"
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingComplete(true);
        setTimeout(() => {
          setIsLoading(false);
          setLoadingComplete(false);
        }, 300);
      }, 8000); // 8 segundos timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    navigateToUrl(url);
  };

  const handleRefreshClick = () => {
    handleRefresh();
  };

  return (
    <ConfigProvider theme={darkTheme}>
      <div className="browser-panel">
        <ControlsBar
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isLoading={isLoading}
          url={url}
          setUrl={setUrl}
          onBack={handleBack}
          onForward={handleForward}
          onRefresh={handleRefreshClick}
          onUrlSubmit={handleUrlSubmit}
        />
        
        <div className="content-area">
          <LoadingBar 
            isLoading={isLoading} 
            loadingComplete={loadingComplete} 
          />
          <WebContent
            isElectron={isElectron}
            currentUrl={currentUrl}
            webviewRef={webviewRef}
            iframeRef={iframeRef}
            nodeId={node.getId()}
            setIsLoading={setIsLoading}
            setLoadingComplete={setLoadingComplete}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default BrowserPanel;
