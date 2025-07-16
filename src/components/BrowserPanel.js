import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Space, Tooltip, theme, ConfigProvider } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  ReloadOutlined, 
  StopOutlined,
  GlobalOutlined,
  SendOutlined 
} from '@ant-design/icons';
import './BrowserPanel.css';

const BrowserPanel = ({ node, model, initialUrl }) => {
  const [url, setUrl] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const webviewRef = useRef(null);
  const iframeRef = useRef(null);

  // Configuração do tema escuro para Ant Design
  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorBgContainer: '#2d2d30',
      colorBgElevated: '#383838',
      colorBorder: '#3e3e42',
      colorPrimary: '#cccccc',
      colorText: '#cccccc',
      colorTextSecondary: '#999999',
      colorBgLayout: '#1e1e1e',
      controlHeight: 32,
      borderRadius: 4,
    },
    components: {
      Button: {
        controlHeight: 32,
        borderRadius: 4,
        colorBgContainer: '#383838',
        colorBorder: '#3e3e42',
      },
      Input: {
        controlHeight: 32,
        borderRadius: 4,
        colorBgContainer: '#383838',
        colorBorder: '#3e3e42',
        activeBorderColor: '#aaaaaa',
        hoverBorderColor: '#aaaaaa',
      },
    },
  };

  // Detecta se está rodando no Electron
  useEffect(() => {
    setIsElectron(window.require !== undefined);
  }, []);

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
  }, [isElectron]); // Removido currentUrl da dependência para evitar re-execução desnecessária

  // Atualiza o título da tab com base na URL
  useEffect(() => {
    if (node && currentUrl) {
      try {
        const domain = new URL(currentUrl).hostname;
        node.getModel().doAction({
          type: 'rename_tab',
          node: node.getId(),
          text: domain
        });
      } catch (e) {
        // Se a URL for inválida, usa o valor atual
        node.getModel().doAction({
          type: 'rename_tab',
          node: node.getId(),
          text: currentUrl.substring(0, 20) + '...'
        });
      }
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
      }, 8000); // 8 segundos timeout (um pouco menos para dar tempo da animação)

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    let targetUrl = url;
    
    // Adiciona protocolo se não existir
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      // Se parece com uma URL (contém ponto), adiciona https
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        // Caso contrário, faz busca no Google
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }
    
    setCurrentUrl(targetUrl);
    setIsLoading(true);
    
    if (isElectron && webviewRef.current) {
      webviewRef.current.src = targetUrl;
    } else if (iframeRef.current) {
      // Para desenvolvimento no browser, usa iframe
      iframeRef.current.src = targetUrl;
    }
  };

  const handleRefresh = () => {
    if (isLoading) {
      // Se está carregando, para o carregamento
      handleStop();
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
  };

  const handleStop = () => {
    setIsLoading(false);
    setLoadingComplete(false);
    if (isElectron && webviewRef.current) {
      webviewRef.current.stop();
    }
  };

  const handleBack = () => {
    if (isElectron && webviewRef.current && canGoBack) {
      webviewRef.current.goBack();
    }
  };

  const handleForward = () => {
    if (isElectron && webviewRef.current && canGoForward) {
      webviewRef.current.goForward();
    }
  };

  // Função para atualizar o estado de navegação
  const updateNavigationState = () => {
    if (isElectron && webviewRef.current) {
      try {
        setCanGoBack(webviewRef.current.canGoBack());
        setCanGoForward(webviewRef.current.canGoForward());
      } catch (error) {
        console.error('Erro ao atualizar estado de navegação:', error);
      }
    }
  };

  const renderWebContent = () => {
    if (isElectron) {
      // No Electron, usa webview real
      return (
        <webview
          ref={webviewRef}
          src={currentUrl}
          data-tab-id={node.getId()}
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
      const canUseIframe = currentUrl && !currentUrl.includes('google.com') && 
                          !currentUrl.includes('github.com') && 
                          !currentUrl.startsWith('https://www.') &&
                          !currentUrl.includes('search?q=');
      
      if (canUseIframe && currentUrl !== 'about:blank') {
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
              {!canUseIframe && currentUrl !== 'about:blank' && !isElectron && (
                <div className="warning-panel warning-red">
                  <p>
                    <span className="warning-icon">🔒 Observação:</span> Alguns sites (como Google/GitHub) bloqueiam iframes por segurança.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ConfigProvider>
      );
    }
  };

  return (
    <ConfigProvider theme={darkTheme}>
      <div className="browser-panel">
        <div className="controls-bar">
          <Space size="small">
            <Tooltip title="Voltar">
              <Button
                type="text"
                icon={<LeftOutlined />}
                size="small"
                disabled={!canGoBack}
                onClick={handleBack}
                style={{
                  color: canGoBack ? '#cccccc' : '#666666',
                  borderColor: '#3e3e42',
                  backgroundColor: '#383838'
                }}
              />
            </Tooltip>
            
            <Tooltip title="Avançar">
              <Button
                type="text"
                icon={<RightOutlined />}
                size="small"
                disabled={!canGoForward}
                onClick={handleForward}
                style={{
                  color: canGoForward ? '#cccccc' : '#666666',
                  borderColor: '#3e3e42',
                  backgroundColor: '#383838'
                }}
              />
            </Tooltip>
            
            <Tooltip title={isLoading ? "Parar carregamento" : "Atualizar página"}>
              <Button
                type="text"
                icon={isLoading ? <StopOutlined /> : <ReloadOutlined />}
                size="small"
                onClick={handleRefresh}
                style={{
                  color: isLoading ? '#ff6b6b' : '#cccccc',
                  borderColor: '#3e3e42',
                  backgroundColor: '#383838'
                }}
              />
            </Tooltip>
          </Space>
          
          <form className="url-form" onSubmit={handleUrlSubmit}>
            <div className="url-input-container">
              <Input
                placeholder="Digite uma URL ou pesquise..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                prefix={
                  isLoading ? 
                    <ReloadOutlined spin style={{ color: '#007acc' }} /> : 
                    <GlobalOutlined style={{ color: '#999999' }} />
                }
                suffix={
                  !isLoading && (
                    <Button
                      type="default"
                      icon={<SendOutlined />}
                      size="small"
                      htmlType="submit"
                      style={{
                        backgroundColor: '#007acc',
                        borderColor: '#007acc',
                        borderWidth: 0,
                        height: '24px',
                        minWidth: '28px'
                      }}
                    />
                  )
                }
                style={{
                  backgroundColor: '#383838',
                  // borderColor: '#007acc',
                  borderWidth: 0,
                  color: '#cccccc'
                }}
                onPressEnter={handleUrlSubmit}
              />
            </div>
          </form>
        </div>
        
        <div className="content-area">
          {isLoading && (
            <div className="loading-bar">
              <div className={`loading-progress ${loadingComplete ? 'complete' : ''}`}></div>
            </div>
          )}
          {renderWebContent()}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default BrowserPanel;
