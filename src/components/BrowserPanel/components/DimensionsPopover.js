import React, { useState, useEffect, useCallback } from 'react';
import { Popover, Typography, Space, Button, InputNumber, Divider } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import useCloseOnWebviewFocus from '../../../hooks/useCloseOnWebviewFocus';
import { getAllDevicePresets, DEVICE_CATEGORY_LABELS } from '../../../utils/devicePresets';

const { Text } = Typography;

const groupByCategory = (devices) => {
  const groups = {};
  devices.forEach((device) => {
    if (!groups[device.category]) groups[device.category] = [];
    groups[device.category].push(device);
  });
  return groups;
};

/**
 * Popover de dimensões da webview: deixa escolher um tamanho conhecido de
 * celular/tablet (gerenciados em Configurações > Dimensões) ou digitar uma
 * largura/altura própria, pra testar responsividade sem precisar redimensionar
 * o painel em si - só a webview interna encolhe, com a área restante do
 * fundo padrão do app. Abre a partir do ícone na barra de URL.
 */
const DimensionsPopover = ({ children, activeDimensions, onApply, onReset }) => {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [customWidth, setCustomWidth] = useState(activeDimensions?.width || 375);
  const [customHeight, setCustomHeight] = useState(activeDimensions?.height || 667);

  useCloseOnWebviewFocus(open, () => setOpen(false));

  const loadDevices = useCallback(() => {
    setDevices(getAllDevicePresets());
  }, []);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) loadDevices();
  };

  // Se o usuário editar as dimensões personalizadas em Configurações
  // enquanto essa aba está com um device aplicado, mantém o campo
  // personalizado alinhado ao valor ativo assim que o popover reabre.
  useEffect(() => {
    if (activeDimensions) {
      setCustomWidth(activeDimensions.width);
      setCustomHeight(activeDimensions.height);
    }
  }, [activeDimensions]);

  const handleApplyPreset = (device) => {
    onApply({ name: device.name, width: device.width, height: device.height });
  };

  const handleApplyCustom = () => {
    onApply({ name: null, width: customWidth, height: customHeight });
  };

  const grouped = groupByCategory(devices);
  const categoryOrder = ['phone', 'tablet', 'custom'];

  const content = (
    <div style={{ width: '280px', backgroundColor: 'var(--nav-panel)', maxHeight: 420, overflowY: 'auto' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>

        <div>
          <Text style={{ color: '#a0a0a0', fontSize: 11, textTransform: 'uppercase' }}>
            Tamanho personalizado
          </Text>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <InputNumber
              size="small"
              min={100}
              max={4000}
              value={customWidth}
              onChange={(value) => setCustomWidth(value || 100)}
              addonAfter="L"
              style={{ width: '50%' }}
            />
            <InputNumber
              size="small"
              min={100}
              max={4000}
              value={customHeight}
              onChange={(value) => setCustomHeight(value || 100)}
              addonAfter="A"
              style={{ width: '50%' }}
            />
          </div>
          <Button size="small" primary block style={{ marginTop: 8 }} onClick={handleApplyCustom}>
            Aplicar
          </Button>
        </div>

        <Divider style={{ margin: 0, backgroundColor: 'var(--nav-border)' }} />

        {categoryOrder
          .filter((category) => grouped[category]?.length)
          .map((category) => (
            <div key={category}>
              <Text style={{ color: '#a0a0a0', fontSize: 11, textTransform: 'uppercase' }}>
                {DEVICE_CATEGORY_LABELS[category]}
              </Text>
              <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column' }}>
                {grouped[category].map((device) => {
                  const isActive =
                    activeDimensions &&
                    activeDimensions.name === device.name &&
                    activeDimensions.width === device.width &&
                    activeDimensions.height === device.height;
                  return (
                    <Button
                      key={device.id}
                      type={isActive ? 'primary' : 'text'}
                      size="small"
                      onClick={() => handleApplyPreset(device)}
                      style={{ display: 'flex', justifyContent: 'space-between', width: '100%', textAlign: 'left' }}
                    >
                      <span>{device.name}</span>
                      <span style={{ opacity: 0.6, fontSize: 12 }}>
                        {device.width}×{device.height}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

      </Space>
    </div>
  );

  return (
    <Popover
      content={content}
      title={
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: 'var(--nav-text)' }}>
            Dimensões {activeDimensions && `— ${activeDimensions.width}×${activeDimensions.height}`}
          </Text>
          {activeDimensions && (
            <Button size="small" icon={<UndoOutlined />} onClick={onReset}>
              Resetar
            </Button>
          )}
        </div>
      }
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      overlayStyle={{ backgroundColor: 'var(--nav-panel)' }}
      overlayInnerStyle={{
        backgroundColor: 'var(--nav-panel)',
        border: '1px solid var(--nav-border)',
        borderRadius: '6px'
      }}
    >
      {children}
    </Popover>
  );
};

export default DimensionsPopover;
