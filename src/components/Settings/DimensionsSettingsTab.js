import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Space, Button, Input, InputNumber, Tag, Popconfirm, Form } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  BUILTIN_DEVICE_PRESETS,
  DEVICE_CATEGORY_LABELS,
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
  const [customDevices, setCustomDevices] = useState([]);
  const [form] = Form.useForm();

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
            title="Remover esta dimensão?"
            okText="Remover"
            cancelText="Cancelar"
            onConfirm={() => handleRemove(device.id)}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ) : (
          <Tag style={{ fontSize: 11, marginRight: 0 }}>Padrão</Tag>
        )}
      </Space>
    </div>
  );

  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        Tamanhos disponíveis no popover de Dimensões da barra de navegação, pra
        testar como um site se comporta em celulares e tablets conhecidos.
      </Text>

      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 12 }}>{DEVICE_CATEGORY_LABELS.phone}</Text>
        {BUILTIN_DEVICE_PRESETS.filter((d) => d.category === 'phone').map((d) => renderDeviceRow(d, false))}
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 12 }}>{DEVICE_CATEGORY_LABELS.tablet}</Text>
        {BUILTIN_DEVICE_PRESETS.filter((d) => d.category === 'tablet').map((d) => renderDeviceRow(d, false))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 12 }}>{DEVICE_CATEGORY_LABELS.custom}</Text>
        {customDevices.length === 0 ? (
          <div style={{ padding: '6px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Nenhuma dimensão personalizada ainda.</Text>
          </div>
        ) : (
          customDevices.map((d) => renderDeviceRow(d, true))
        )}
      </div>

      <Form form={form} layout="inline" onFinish={handleAdd} style={{ flexWrap: 'wrap', rowGap: 8 }}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Nome obrigatório' }]}
          style={{ flex: 1, minWidth: 140, marginRight: 8 }}
        >
          <Input placeholder="Nome do aparelho" maxLength={40} />
        </Form.Item>
        <Form.Item name="width" rules={[{ required: true, message: 'Largura' }]} style={{ marginRight: 8 }}>
          <InputNumber min={100} max={4000} placeholder="Largura" addonAfter="L" />
        </Form.Item>
        <Form.Item name="height" rules={[{ required: true, message: 'Altura' }]} style={{ marginRight: 8 }}>
          <InputNumber min={100} max={4000} placeholder="Altura" addonAfter="A" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<PlusOutlined />} htmlType="submit">
            Adicionar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DimensionsSettingsTab;
