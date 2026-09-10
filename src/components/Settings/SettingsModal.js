import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Switch, Divider, Space, Tabs } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { getUserSettings, saveUserSettings } from '../../utils/userSettings';
import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import PermissionsSettingsTab from './PermissionsSettingsTab';

const { Title, Text } = Typography;

/**
 * Modal de configurações da aplicação
 */
const SettingsModal = ({ visible, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  // O antd Tabs não propaga updates de forma confiável pra dentro de uma aba
  // que não está ativa no momento (fica "presa" com o que tinha na última
  // vez que esteve ativa). Incrementar isso a cada abertura do modal e usar
  // como `key` da aba de Permissões força uma remontagem completa, evitando
  // depender desse update.
  const [openCount, setOpenCount] = useState(0);

  const { checkForUpdates, getAppVersion } = useAutoUpdater();

  // Carregar configurações atuais
  useEffect(() => {
    if (visible) {
      loadCurrentSettings();
      loadAppVersion();
      setOpenCount((count) => count + 1);
    }
  }, [visible]);

  const loadAppVersion = async () => {
    try {
      const version = await getAppVersion();
      setCurrentVersion(version || 'Desconhecida');
    } catch (error) {
      console.error('Erro ao carregar versão:', error);
    }
  };

  const loadCurrentSettings = async () => {
    try {
      // Usar a função utilitária para carregar configurações
      const settings = getUserSettings();
      form.setFieldsValue(settings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Usar a função utilitária para salvar
      const success = saveUserSettings(values);
      
      if (success) {
        // Chamar callback se fornecido
        if (onSave) {
          onSave(values);
        }
        
        onClose();
      } else {
        throw new Error('Falha ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUpdates = async () => {
    try {
      await checkForUpdates();
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Configurações"
      open={visible}
      onCancel={handleCancel}
      width={500}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          Salvar
        </Button>
      ]}
    >
      <Tabs
        items={[
          {
            key: 'general',
            label: 'Geral',
            children: (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  defaultHomePage: 'https://www.google.com',
                  autoUpdate: true,
                  autoDownload: true
                }}
              >
                <Title level={5}>Navegação</Title>

                <Form.Item
                  name="defaultHomePage"
                  label="Página inicial padrão"
                  rules={[
                    { required: true, message: 'Por favor, insira uma URL válida' },
                    { type: 'url', message: 'Por favor, insira uma URL válida' }
                  ]}
                  extra="Esta será a página inicial ao criar novas abas"
                >
                  <Input
                    placeholder="https://www.google.com"
                    prefix="🌐"
                  />
                </Form.Item>

                <Divider />

                <Title level={5}>Atualizações</Title>

                <Form.Item
                  name="autoUpdate"
                  label="Verificar atualizações automaticamente"
                  valuePropName="checked"
                  extra="Verifica por novas versões ao iniciar o aplicativo"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="autoDownload"
                  label="Baixar atualizações automaticamente"
                  valuePropName="checked"
                  extra="Baixa atualizações em segundo plano (requer confirmação para instalar)"
                >
                  <Switch />
                </Form.Item>

                <div style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>Versão Atual: {currentVersion}</Text>
                      <Button
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={handleCheckUpdates}
                      >
                        Verificar Agora
                      </Button>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Última verificação: ao iniciar o aplicativo
                    </Text>
                  </Space>
                </div>
              </Form>
            )
          },
          {
            key: 'permissions',
            label: 'Permissões',
            children: <PermissionsSettingsTab key={openCount} />
          }
        ]}
      />
    </Modal>
  );
};

export default SettingsModal;
