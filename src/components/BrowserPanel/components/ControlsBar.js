import React from 'react';
import { Button, Input, Space, Tooltip } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  ReloadOutlined, 
  StopOutlined,
  GlobalOutlined,
  SendOutlined 
} from '@ant-design/icons';

/**
 * Barra de controles de navegação
 */
const ControlsBar = ({
  canGoBack,
  canGoForward,
  isLoading,
  url,
  setUrl,
  onBack,
  onForward,
  onRefresh,
  onUrlSubmit
}) => {
  return (
    <div className="controls-bar">
      <Space size="small">
        <Tooltip title="Voltar">
          <Button
            type="text"
            icon={<LeftOutlined />}
            size="small"
            disabled={!canGoBack}
            onClick={onBack}
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
            onClick={onForward}
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
            onClick={onRefresh}
            style={{
              color: isLoading ? '#ff6b6b' : '#cccccc',
              borderColor: '#3e3e42',
              backgroundColor: '#383838'
            }}
          />
        </Tooltip>
      </Space>
      
      <form className="url-form" onSubmit={onUrlSubmit}>
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
              borderWidth: 0,
              color: '#cccccc'
            }}
            onPressEnter={onUrlSubmit}
          />
        </div>
      </form>
    </div>
  );
};

export default ControlsBar;
