import React, { useState, useEffect } from 'react';
import { Switch, InputNumber, Space, Typography, Divider, Select } from 'antd';

const { Text } = Typography;
const { Option } = Select;

/**
 * Conteúdo de configuração de auto-refresh - vive dentro do menu unificado
 * da barra de URL (ver ControlsBar.js), não é mais um Popover próprio.
 */
const AutoRefreshSettings = ({
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

  return (
    <div style={{ width: '280px' }}>
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

        <p style={{ color: '#a0a0a0', fontSize: 11, marginTop: -5, marginBottom: -5 }}>Atualizar aba automaticamente no intervalo definido</p>

        <Divider style={{ margin: '0 0 0 0', backgroundColor: '#3e3e42' }} />

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
};

export default AutoRefreshSettings;
