import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConfigProvider } from 'antd';
import { Actions } from 'flexlayout-react';
import { darkTheme } from './utils/theme';
import { extractDomainOrTitle, processUrl } from './utils/urlUtils';
import { consumeUrlBarFocusRequest } from '../../utils/tabActions';
import { layoutEventEmitter, LAYOUT_EVENTS } from '../../utils/layoutEventEmitter';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import useShortcutsConfig from '../../hooks/useShortcutsConfig';
import ControlsBar from './components/ControlsBar';
import WebContent from './components/WebContent';
import LoadingBar from './components/LoadingBar';
import './BrowserPanel.css';

/**
 * Componente principal do painel de navegação
 */
const BrowserPanel = ({ node, model, initialUrl }) => {
  const [url, setUrl] = useState(initialUrl);
  const [initialWebviewUrl] = useState(initialUrl); // URL inicial fixa para webview
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [hideNavigationBar, setHideNavigationBar] = useState(false);
  
  const webviewRef = useRef(null);
  const iframeRef = useRef(null);
  const urlInputRef = useRef(null);

  // Função de refresh que será usada pelo auto-refresh
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

  // Hook para gerenciar auto-refresh
  const {
    isAutoRefreshEnabled,
    refreshInterval,
    timeRemaining,
    toggleAutoRefresh,
    updateRefreshInterval
  } = useAutoRefresh(handleRefresh);

  // Hook para gerenciar configurações de shortcuts
  const {
    isShortcutsEnabled,
    shortcutModifiers,
    showOverlay,
    toggleShortcuts,
    updateModifiers,
    toggleShowOverlay
  } = useShortcutsConfig();

  // Detecta se está rodando no Electron
  useEffect(() => {
    setIsElectron(typeof window.electronAPI !== 'undefined');
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
          if (window.electronAPI) {
            window.electronAPI.openInNewTab(e.url);
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

  const navigateToUrl = useCallback((inputUrl) => {
    const targetUrl = processUrl(inputUrl);
    setCurrentUrl(targetUrl);
    setIsLoading(true);
    
    if (isElectron && webviewRef.current) {
      // Navega programaticamente sem recriar a webview.
      // loadURL() retorna uma Promise que rejeita se a webview for destruída
      // antes da navegação terminar (ex.: usuário fecha a aba com Ctrl+W
      // enquanto a página ainda está carregando) - sem o catch, isso vira uma
      // unhandled rejection.
      webviewRef.current.loadURL(targetUrl).catch((error) => {
        console.log('Navegação cancelada ou falhou:', error.message);
      });
    } else if (iframeRef.current) {
      // Para desenvolvimento no browser, usa iframe
      iframeRef.current.src = targetUrl;
    }
  }, [isElectron]);

  // Atualiza o título da tab com base na URL
  useEffect(() => {
    if (node && currentUrl) {
      const title = extractDomainOrTitle(currentUrl);
      node.getModel().doAction(Actions.renameTab(node.getId(), title));
    }
  }, [currentUrl, node]);

  // Atalho Ctrl+L (global, via menu do Electron): foca e seleciona o texto
  // da barra de URL desta aba, só quando ela é a aba ativa
  useEffect(() => {
    const handleFocusUrlBar = (event) => {
      if (node && event.detail?.tabId === node.getId()) {
        urlInputRef.current?.focus({ cursor: 'all' });
      }
    };

    window.addEventListener('focus-url-bar', handleFocusUrlBar);
    return () => window.removeEventListener('focus-url-bar', handleFocusUrlBar);
  }, [node]);

  // Uma aba em branco recém-criada (botão "+", Ctrl+T, menu "Nova Aba") já
  // nasce marcada para focar a barra de URL - é o mais natural que o usuário
  // vai querer fazer em seguida, como no Chrome. Verificado no mount (não via
  // evento) porque a tab é criada e montada antes de haver qualquer listener
  // pronto para escutar um evento disparado no mesmo instante.
  useEffect(() => {
    if (node && consumeUrlBarFocusRequest(node.getId())) {
      urlInputRef.current?.focus({ cursor: 'all' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Effect para monitorar mudanças na configuração do tabset
  useEffect(() => {
    if (node && model) {
      const updateNavigationBarVisibility = () => {
        // Encontra o tabset pai da tab atual
        const parent = node.getParent();
        if (parent && parent.getType() === 'tabset') {
          const config = parent.getConfig() || {};
          const shouldHide = config.hideNavigationBar || false;
          console.log('BrowserPanel - Configuração do tabset:', parent.getId(), 'hideNavigationBar:', shouldHide);
          setHideNavigationBar(shouldHide);
          return shouldHide;
        }
        return false;
      };

      // Verificar imediatamente
      updateNavigationBarVisibility();

      // Listener para mudanças na configuração do tabset
      const handleNavigationBarToggle = (eventData) => {
        const parent = node.getParent();
        if (parent && parent.getId() === eventData.tabSetId) {
          console.log('BrowserPanel - Evento recebido para nosso tabset:', eventData);
          setHideNavigationBar(eventData.hideNavigationBar);
        }
      };

      // Registrar listener
      layoutEventEmitter.on(LAYOUT_EVENTS.NAVIGATION_BAR_TOGGLED, handleNavigationBarToggle);

      return () => {
        // Cleanup listener
        layoutEventEmitter.off(LAYOUT_EVENTS.NAVIGATION_BAR_TOGGLED, handleNavigationBarToggle);
      };
    }
  }, [node, model]);

  return (
    <ConfigProvider theme={darkTheme}>
      <div className="browser-panel">
        {!hideNavigationBar && (
          <ControlsBar
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            isLoading={isLoading}
            url={url}
            setUrl={setUrl}
            currentUrl={currentUrl}
            onBack={handleBack}
            onForward={handleForward}
            onRefresh={handleRefreshClick}
            onUrlSubmit={handleUrlSubmit}
            urlInputRef={urlInputRef}
            isAutoRefreshEnabled={isAutoRefreshEnabled}
            refreshInterval={refreshInterval}
            timeRemaining={timeRemaining}
            onToggleAutoRefresh={toggleAutoRefresh}
            onIntervalChange={updateRefreshInterval}
            isShortcutsEnabled={isShortcutsEnabled}
            shortcutModifiers={shortcutModifiers}
            onToggleShortcuts={toggleShortcuts}
            onShortcutModifiersChange={updateModifiers}
            showShortcutsOverlay={showOverlay}
            onToggleShortcutsOverlay={toggleShowOverlay}
          />
        )}
        
        <div className="content-area">
          <LoadingBar 
            isLoading={isLoading} 
            loadingComplete={loadingComplete} 
          />
          <WebContent
            isElectron={isElectron}
            currentUrl={initialWebviewUrl} // Usa URL inicial fixa
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
