import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Space, Button, Input, InputNumber, Tag, Popconfirm, Form } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  BUILTIN_DEVICE_PRESETS,
  getDeviceCategoryLabels,
  loadCustomDevices,
  addCustomDevice,
  removeCustomDevice
} from '../../utils/devicePresets';

const { Text } = Typography;

/**
 * Aba "Dimensões" das Configurações: mostra os tamanhos de tela pré-cadastrados
 * (celulares/tablets, fixos) e os personalizados pelo usuário (com opção de
 * remover), além de um formulário pra cadastrar novos. Usado pelo popover de
 * Dimensões da barra de navegação (DimensionsPopover.js) pra deixar a webview
 * do tamanho de um aparelho conhecido, sem precisar redimensionar o painel.
 */
const DimensionsSettingsTab = () => {
  const { t } = useTranslation();
  const [customDevices, setCustomDevices] = useState([]);
  const [form] = Form.useForm();

  const deviceCategoryLabels = getDeviceCategoryLabels(t);

  const loadDevices = useCallback(() => {
    setCustomDevices(loadCustomDevices());
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleAdd = (values) => {
    addCustomDevice(values.name.trim(), values.width, values.height);
    form.resetFields();
    loadDevices();
  };

  const handleRemove = (id) => {
    removeCustomDevice(id);
    loadDevices();
  };

  const renderDeviceRow = (device, removable) => (
    <div
      key={device.id}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}
    >
      <Text style={{ fontSize: 13 }}>{device.name}</Text>
      <Space size="small">
        <Text type="secondary" style={{ fontSize: 12 }}>
          {device.width}×{device.height}
        </Text>
        {removable ? (
          <Popconfirm
            title={t('settings.dimensions.removeTitle')}
            okText={t('common.remove')}
            cancelText={t('common.cancel')}
            onConfirm={() => handleRemove(device.id)}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ) : (
          <Tag style={{ fontSize: 11, marginRight: 0 }}>{t('settings.dimensions.default')}</Tag>
        )}
      </Space>
    </div>
  );

  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        {t('settings.dimensions.description')}
      </Text>

      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 12 }}>{deviceCategoryLabels.phone}</Text>
        {BUILTIN_DEVICE_PRESETS.filter((d) => d.category === 'phone').map((d) => renderDeviceRow(d, false))}
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 12 }}>{deviceCategoryLabels.tablet}</Text>
        {BUILTIN_DEVICE_PRESETS.filter((d) => d.category === 'tablet').map((d) => renderDeviceRow(d, false))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 12 }}>{deviceCategoryLabels.custom}</Text>
        {customDevices.length === 0 ? (
          <div style={{ padding: '6px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>{t('settings.dimensions.noneCustom')}</Text>
          </div>
        ) : (
          customDevices.map((d) => renderDeviceRow(d, true))
        )}
      </div>

      <Form form={form} layout="inline" onFinish={handleAdd} style={{ flexWrap: 'wrap', rowGap: 8 }}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: t('settings.dimensions.nameRequired') }]}
          style={{ flex: 1, minWidth: 140, marginRight: 8 }}
        >
          <Input placeholder={t('settings.dimensions.namePlaceholder')} maxLength={40} />
        </Form.Item>
        <Form.Item name="width" rules={[{ required: true, message: t('settings.dimensions.widthRequired') }]} style={{ marginRight: 8 }}>
          <InputNumber min={100} max={4000} placeholder={t('settings.dimensions.widthPlaceholder')} addonAfter="L" />
        </Form.Item>
        <Form.Item name="height" rules={[{ required: true, message: t('settings.dimensions.heightRequired') }]} style={{ marginRight: 8 }}>
          <InputNumber min={100} max={4000} placeholder={t('settings.dimensions.heightPlaceholder')} addonAfter="A" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<PlusOutlined />} htmlType="submit">
            {t('settings.dimensions.add')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DimensionsSettingsTab;
