import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Space, Tooltip, theme, ConfigProvider } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  ReloadOutlined, 
  GlobalOutlined,
  SendOutlined 
} from '@ant-design/icons';
import './BrowserPanel.css';

const BrowserPanel = ({ node, model, initialUrl }) => {
  const [url, setUrl] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
      colorPrimary: '#007acc',
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
        activeBorderColor: '#007acc',
        hoverBorderColor: '#007acc',
      },
    },
  };

  // Detecta se está rodando no Electron
  useEffect(() => {
    setIsElectron(window.require !== undefined);
  }, []);

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

  const handleWebviewLoad = () => {
    // Marca como completo e depois de um pequeno delay remove o loading
    setLoadingComplete(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingComplete(false);
    }, 300);
    
    if (isElectron && webviewRef.current) {
      setCanGoBack(webviewRef.current.canGoBack());
      setCanGoForward(webviewRef.current.canGoForward());
      setCurrentUrl(webviewRef.current.getURL());
      setUrl(webviewRef.current.getURL());
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Adiciona um pequeno delay para evitar blur quando clicando em elementos do painel
    setTimeout(() => {
      if (!document.activeElement || !document.activeElement.closest('.browser-panel')) {
        setIsFocused(false);
      }
    }, 100);
  };

  const handlePanelClick = () => {
    setIsFocused(true);
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
          onLoadStart={() => setIsLoading(true)}
          onLoadStop={handleWebviewLoad}
          onDidNavigate={(e) => {
            setCurrentUrl(e.url);
            setUrl(e.url);
          }}
          allowpopups="true"
          nodeintegration="false"
          webpreferences="allowRunningInsecureContent"
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
                    {isFocused ? '🎯' : '😴'} {isFocused ? 'Focado' : 'Sem foco'}
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
                    <span className="tip-icon">💡 Dica:</span> Clique neste painel para focar e ver os controles de navegação ativados!
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
      <div 
        className={`browser-panel ${isFocused ? 'focused' : ''}`}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handlePanelClick}
        tabIndex="0"
      >
        <div className="controls-bar">
          <Space size="small">
            <Tooltip title={isFocused ? "Voltar" : "Clique no painel para focar"}>
              <Button
                type="text"
                icon={<LeftOutlined />}
                size="small"
                disabled={!canGoBack || !isFocused}
                onClick={handleBack}
                className={!isFocused || !canGoBack ? 'opacity-30' : ''}
                style={{
                  color: isFocused && canGoBack ? '#cccccc' : '#666666',
                  borderColor: '#3e3e42',
                  backgroundColor: '#383838'
                }}
              />
            </Tooltip>
            
            <Tooltip title={isFocused ? "Avançar" : "Clique no painel para focar"}>
              <Button
                type="text"
                icon={<RightOutlined />}
                size="small"
                disabled={!canGoForward || !isFocused}
                onClick={handleForward}
                className={!isFocused || !canGoForward ? 'opacity-30' : ''}
                style={{
                  color: isFocused && canGoForward ? '#cccccc' : '#666666',
                  borderColor: '#3e3e42',
                  backgroundColor: '#383838'
                }}
              />
            </Tooltip>
            
            <Tooltip title={isFocused ? "Atualizar página" : "Clique no painel para focar"}>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                size="small"
                disabled={!isFocused}
                onClick={handleRefresh}
                className={!isFocused ? 'opacity-30' : ''}
                style={{
                  color: isFocused ? '#cccccc' : '#666666',
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
                  isFocused && !isLoading && (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      size="small"
                      htmlType="submit"
                      style={{
                        backgroundColor: '#007acc',
                        borderColor: '#007acc',
                        height: '24px',
                        minWidth: '28px'
                      }}
                    />
                  )
                }
                readOnly={!isFocused}
                style={{
                  backgroundColor: isFocused ? '#383838' : '#2d2d30',
                  borderColor: isFocused ? '#007acc' : '#3e3e42',
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
