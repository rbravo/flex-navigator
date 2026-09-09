import React, { useState } from 'react';
import { Button, Input, Space, Tooltip, Badge } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  ReloadOutlined, 
  StopOutlined,
  GlobalOutlined,
  SendOutlined,
  ClockCircleOutlined,
  ControlOutlined
} from '@ant-design/icons';
import AutoRefreshPopover from './AutoRefreshPopover';
import ShortcutsConfigPopover from './ShortcutsConfigPopover';

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
  onUrlSubmit,
  // Props para auto-refresh
  isAutoRefreshEnabled,
  refreshInterval,
  timeRemaining,
  onToggleAutoRefresh,
  onIntervalChange,
  // Props para shortcuts
  isShortcutsEnabled = true,
  shortcutModifiers = 'Ctrl+Shift',
  onToggleShortcuts,
  onShortcutModifiersChange
}) => {
  // Formatar o tempo restante para exibição
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
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

      {/* Seção de Extensions */}
      <div className="extensions-section">
        <Space size="small">
          <AutoRefreshPopover
            isAutoRefreshEnabled={isAutoRefreshEnabled}
            refreshInterval={refreshInterval}
            onToggleAutoRefresh={onToggleAutoRefresh}
            onIntervalChange={onIntervalChange}
          >
            <Tooltip 
              title={
                isAutoRefreshEnabled 
                  ? `Auto-refresh ativo${timeRemaining > 0 ? ` - próximo em ${formatTimeRemaining(timeRemaining)}` : ''}`
                  : "Configurar auto-refresh"
              }
            >
              <Badge 
                dot={isAutoRefreshEnabled} 
                color="#007acc"
                offset={[-2, 2]}
              >
                <Button
                  type="text"
                  icon={<ClockCircleOutlined />}
                  size="small"
                  style={{
                    color: isAutoRefreshEnabled ? '#007acc' : '#cccccc',
                    borderColor: '#3e3e42',
                    backgroundColor: isAutoRefreshEnabled ? '#383838' : '#2d2d30',
                    border: isAutoRefreshEnabled ? '1px solid #007acc' : '1px solid transparent'
                  }}
                />
              </Badge>
            </Tooltip>
          </AutoRefreshPopover>

          <ShortcutsConfigPopover
            isShortcutsEnabled={isShortcutsEnabled}
            shortcutModifiers={shortcutModifiers}
            onToggleShortcuts={onToggleShortcuts}
            onModifiersChange={onShortcutModifiersChange}
          >
            <Tooltip 
              title={
                isShortcutsEnabled 
                  ? `Atalhos ativos - ${shortcutModifiers} + tecla`
                  : "Configurar atalhos de navegação"
              }
            >
              <Badge 
                dot={isShortcutsEnabled} 
                color="#007acc"
                offset={[-2, 2]}
              >
                <Button
                  type="text"
                  icon={<ControlOutlined />}
                  size="small"
                  style={{
                    color: isShortcutsEnabled ? '#007acc' : '#cccccc',
                    borderColor: '#3e3e42',
                    backgroundColor: isShortcutsEnabled ? '#383838' : '#2d2d30',
                    border: isShortcutsEnabled ? '1px solid #007acc' : '1px solid transparent'
                  }}
                />
              </Badge>
            </Tooltip>
          </ShortcutsConfigPopover>
        </Space>
      </div>
    </div>
  );
};

export default ControlsBar;
