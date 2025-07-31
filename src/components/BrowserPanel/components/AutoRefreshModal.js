import React, { useState, useEffect } from 'react';
import { Popover, Switch, InputNumber, Space, Typography, Divider } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Popover para configurar auto-refresh da página
 */
const AutoRefreshPopover = ({
  children,
  isAutoRefreshEnabled,
  refreshInterval,
  onToggleAutoRefresh,
  onIntervalChange
}) => {
  const [localInterval, setLocalInterval] = useState(refreshInterval);

  useEffect(() => {
    setLocalInterval(refreshInterval);
  }, [refreshInterval]);

  const handleIntervalChange = (value) => {
    setLocalInterval(value);
    onIntervalChange(value);
  };

  const content = (
    <div style={{ 
      width: '280px', 
      backgroundColor: '#2d2d30',
      border: 'none'
    }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Toggle principal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#cccccc' }}>Ativar auto atualização</Text>
          <Switch
            checked={isAutoRefreshEnabled}
            onChange={onToggleAutoRefresh}
            style={{
              backgroundColor: isAutoRefreshEnabled ? '#007acc' : '#434343'
            }}
          />
        </div>

        <Divider style={{ margin: '8px 0', backgroundColor: '#3e3e42' }} />

        {/* Configuração do intervalo */}
        <div style={{ opacity: isAutoRefreshEnabled ? 1 : 0.5 }}>
          <Text style={{ color: '#cccccc', fontSize: '14px' }}>
            Intervalo de atualização
          </Text>
          
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InputNumber
              min={5}
              max={300}
              value={localInterval}
              onChange={handleIntervalChange}
              disabled={!isAutoRefreshEnabled}
              style={{
                backgroundColor: '#383838',
                borderColor: '#3e3e42',
                color: '#cccccc',
                width: '80px'
              }}
              styles={{
                input: {
                  backgroundColor: '#383838',
                  color: '#cccccc'
                }
              }}
            />
            <Text style={{ color: '#999999', fontSize: '12px' }}>
              segundos
            </Text>
          </div>
          
          <Text style={{ color: '#666666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Mínimo: 5s | Máximo: 300s (5 min)
          </Text>
        </div>

        {/* Info sobre preservação do scroll */}
        <div style={{ 
          backgroundColor: '#383838', 
          padding: '8px', 
          borderRadius: '4px',
          marginTop: '8px'
        }}>
          <Text style={{ color: '#999999', fontSize: '11px' }}>
            💡 A posição do scroll será mantida após cada atualização
          </Text>
        </div>
      </Space>
    </div>
  );

  const title = (
    <Space>
      <ClockCircleOutlined style={{ color: '#007acc' }} />
      <Text style={{ color: '#cccccc' }}>Auto Atualizar</Text>
    </Space>
  );

  return (
    <Popover
      content={content}
      title={title}
      trigger="click"
      placement="bottomRight"
      overlayStyle={{
        backgroundColor: '#2d2d30',
      }}
      overlayInnerStyle={{
        backgroundColor: '#2d2d30',
        border: '1px solid #3e3e42',
        borderRadius: '6px'
      }}
    >
      {children}
    </Popover>
  );
};

export default AutoRefreshPopover;
