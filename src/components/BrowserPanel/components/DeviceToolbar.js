import React, { useMemo } from 'react';
import { Select, Button, Tooltip, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { getAllDevicePresets, DEVICE_CATEGORY_LABELS } from '../../../utils/devicePresets';

const { Text } = Typography;

const CATEGORY_ORDER = ['phone', 'tablet', 'custom'];
const ZOOM_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5];
const CUSTOM_DEVICE_KEY = 'custom';
const CUSTOM_ZOOM_KEY = 'custom-zoom';

const presetKey = (device) => `${device.name}:${device.width}:${device.height}`;

/**
 * Barra fina acima da webview, visível só quando uma dimensão está ativa
 * (ver BrowserPanel/index.js) - deixa trocar de dispositivo e ajustar o
 * zoom visual sem precisar abrir o popover de Dimensões de novo. O dropdown
 * de zoom existe porque um dispositivo escolhido pode ser mais alto que o
 * painel disponível (ex.: um iPad Pro num painel pequeno) - reduzir o zoom
 * encolhe visualmente o "quadro" do dispositivo pra caber, sem mudar o que
 * a própria página enxerga como seu viewport (mesma ideia do device
 * toolbar do Chrome DevTools).
 */
const DeviceToolbar = ({ activeDimensions, deviceZoom, onSelectDevice, onChangeZoom, onFitZoom, onClose }) => {
  const grouped = useMemo(() => {
    const groups = {};
    getAllDevicePresets().forEach((device) => {
      if (!groups[device.category]) groups[device.category] = [];
      groups[device.category].push(device);
    });
    return groups;
  }, []);

  const isKnownPreset = CATEGORY_ORDER.some((category) =>
    (grouped[category] || []).some(
      (device) => device.name === activeDimensions.name && device.width === activeDimensions.width && device.height === activeDimensions.height
    )
  );
  const deviceSelectValue = activeDimensions.name && isKnownPreset ? presetKey(activeDimensions) : CUSTOM_DEVICE_KEY;

  const handleDeviceChange = (value) => {
    if (value === CUSTOM_DEVICE_KEY) return;
    const [name, width, height] = value.split(':');
    onSelectDevice({ name, width: Number(width), height: Number(height) });
  };

  const zoomSelectValue = ZOOM_OPTIONS.includes(deviceZoom) ? String(deviceZoom) : CUSTOM_ZOOM_KEY;

  const handleZoomChange = (value) => {
    if (value === 'fit') onFitZoom();
    else onChangeZoom(Number(value));
  };

  return (
    <div className="device-toolbar">
      <div className="device-toolbar-inner">
        <Select
          size="small"
          value={deviceSelectValue}
          onChange={handleDeviceChange}
          style={{ minWidth: 200 }}
          popupMatchSelectWidth={false}
        >
          {deviceSelectValue === CUSTOM_DEVICE_KEY && (
            <Select.Option value={CUSTOM_DEVICE_KEY}>
              {`Personalizado (${activeDimensions.width}×${activeDimensions.height})`}
            </Select.Option>
          )}
          {CATEGORY_ORDER.filter((category) => grouped[category]?.length).map((category) => (
            <Select.OptGroup key={category} label={DEVICE_CATEGORY_LABELS[category]}>
              {grouped[category].map((device) => (
                <Select.Option key={device.id} value={presetKey(device)}>
                  {device.name} ({device.width}×{device.height})
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>

        <Select size="small" value={zoomSelectValue} onChange={handleZoomChange} style={{ width: 100 }}>
          {zoomSelectValue === CUSTOM_ZOOM_KEY && (
            <Select.Option value={CUSTOM_ZOOM_KEY}>{Math.round(deviceZoom * 100)}%</Select.Option>
          )}
          <Select.Option value="fit">Ajustar</Select.Option>
          {ZOOM_OPTIONS.map((zoom) => (
            <Select.Option key={zoom} value={String(zoom)}>
              {Math.round(zoom * 100)}%
            </Select.Option>
          ))}
        </Select>

        <Text style={{ color: '#a0a0a0', fontSize: 12 }}>
          {activeDimensions.width}×{activeDimensions.height}
        </Text>
      </div>
      <Tooltip title="Sair do modo de dimensões">
        <Button size="small" type="text" icon={<CloseOutlined />} onClick={onClose} />
      </Tooltip>
    </div>
  );
};

export default DeviceToolbar;
