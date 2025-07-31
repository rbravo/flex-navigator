import React, { useState, useEffect } from 'react';
import { Popover, Switch, InputNumber, Space, Typography, Divider, Select } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

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
  const [timeUnit, setTimeUnit] = useState('segundos');

  useEffect(() => {
    setLocalInterval(refreshInterval);
  }, [refreshInterval]);

  const handleIntervalChange = (value) => {
    setLocalInterval(value);
    onIntervalChange(value);
  };

  const handleUnitChange = (unit) => {
    setTimeUnit(unit);
    // Converter o valor atual quando muda a unidade
    if (unit === 'minutos' && timeUnit === 'segundos') {
      const newValue = Math.ceil(localInterval / 60);
      setLocalInterval(newValue);
      onIntervalChange(newValue * 60);
    } else if (unit === 'segundos' && timeUnit === 'minutos') {
      const newValue = localInterval * 60;
      setLocalInterval(newValue);
      onIntervalChange(newValue);
    }
  };

  const getMinValue = () => timeUnit === 'segundos' ? 1 : 1;
  const getMaxValue = () => timeUnit === 'segundos' ? 100000 : 1666; // 1666 minutos = ~100000 segundos

  const getCurrentValue = () => {
    if (timeUnit === 'minutos') {
      return Math.ceil(localInterval / 60);
    }
    return localInterval;
  };

  const handleValueChange = (value) => {
    const actualValue = timeUnit === 'minutos' ? value * 60 : value;
    setLocalInterval(actualValue);
    onIntervalChange(actualValue);
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
              min={getMinValue()}
              max={getMaxValue()}
              value={getCurrentValue()}
              onChange={handleValueChange}
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
            <Select
              value={timeUnit}
              onChange={handleUnitChange}
              disabled={!isAutoRefreshEnabled}
              style={{
                width: '100px'
              }}
              dropdownStyle={{
                backgroundColor: '#2d2d30',
                border: '1px solid #3e3e42'
              }}
              popupClassName="dark-select-dropdown"
            >
              <Option value="segundos">segundos</Option>
              <Option value="minutos">minutos</Option>
            </Select>
          </div>
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
