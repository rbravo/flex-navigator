import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Switch, Divider, Space, Tabs, Select } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getUserSettings, saveUserSettings } from '../../utils/userSettings';
import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import PermissionsSettingsTab from './PermissionsSettingsTab';
import DimensionsSettingsTab from './DimensionsSettingsTab';

const { Title, Text } = Typography;

/**
 * Modal de configurações da aplicação
 */
const SettingsModal = ({ visible, onClose, onSave }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  // O antd Tabs não propaga updates de forma confiável pra dentro de uma aba
  // que não está ativa no momento (fica "presa" com o que tinha na última
  // vez que esteve ativa). Incrementar isso a cada abertura do modal e usar
  // como `key` da aba de Permissões força uma remontagem completa, evitando
  // depender desse update.
  const [openCount, setOpenCount] = useState(0);
  const { setThemeMode } = useTheme();
  const { setLanguageMode } = useLanguage();

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
      setCurrentVersion(version || t('settings.general.unknownVersion'));
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
        setThemeMode(values.themeMode);
        setLanguageMode(values.languageMode);
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
        title={t('settings.title')}
        open={visible}
        onCancel={handleCancel}
        width={560}
        footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('settings.cancel')}
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          {t('settings.save')}
        </Button>
        ]}
      >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          defaultHomePage: 'https://www.google.com',
          autoUpdate: true,
          autoDownload: true
        }}
      >
      <Tabs
        items={[
          {
            key: 'general',
            label: t('settings.tabs.general'),
            children: (
              <>
                <Title level={5}>{t('settings.general.navigationTitle')}</Title>

                <Form.Item
                  name="defaultHomePage"
                  label={t('settings.general.defaultHomePage')}
                  rules={[
                    { required: true, message: t('settings.general.defaultHomePageRequired') },
                    { type: 'url', message: t('settings.general.defaultHomePageInvalid') }
                  ]}
                  extra={t('settings.general.defaultHomePageExtra')}
                >
                  <Input
                    placeholder="https://www.google.com"
                    prefix="🌐"
                  />
                </Form.Item>

                <Form.Item
                  name="themeMode"
                  label={t('settings.general.themeLabel')}
                  extra={t('settings.general.themeExtra')}
                >
                  <Select
                    options={[
                      { value: 'auto', label: t('settings.general.themeAuto') },
                      { value: 'light', label: t('settings.general.themeLight') },
                      { value: 'dark', label: t('settings.general.themeDark') }
                    ]}
                  />
                </Form.Item>

                <Divider />

                <Title level={5}>{t('settings.general.updatesTitle')}</Title>

                <Form.Item
                  name="autoUpdate"
                  label={t('settings.general.autoUpdateLabel')}
                  valuePropName="checked"
                  extra={t('settings.general.autoUpdateExtra')}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="autoDownload"
                  label={t('settings.general.autoDownloadLabel')}
                  valuePropName="checked"
                  extra={t('settings.general.autoDownloadExtra')}
                >
                  <Switch />
                </Form.Item>

                <div style={{
                  background: 'var(--nav-hover)',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{t('settings.general.currentVersion', { version: currentVersion })}</Text>
                      <Button
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={handleCheckUpdates}
                      >
                        {t('settings.general.checkNow')}
                      </Button>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('settings.general.lastCheck')}
                    </Text>
                  </Space>
                </div>
              </>
            )
          },
          {
            key: 'language',
            label: t('settings.tabs.language'),
            children: (
              <Form.Item
                name="languageMode"
                label={t('settings.language.label')}
                extra={t('settings.language.extra')}
              >
                <Select
                  options={[
                    { value: 'auto', label: t('languages.auto') },
                    { value: 'pt-BR', label: t('languages.pt-BR') },
                    { value: 'en', label: t('languages.en') },
                    { value: 'es', label: t('languages.es') }
                  ]}
                />
              </Form.Item>
            )
          },
          {
            key: 'permissions',
            label: t('settings.tabs.permissions'),
            children: <PermissionsSettingsTab key={openCount} />
          },
          {
            key: 'dimensions',
            label: t('settings.tabs.dimensions'),
            children: <DimensionsSettingsTab key={openCount} />
          }
        ]}
      />
      </Form>
    </Modal>
  );
};

export default SettingsModal;
