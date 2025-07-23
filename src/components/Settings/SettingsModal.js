import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography } from 'antd';
import { getUserSettings, saveUserSettings } from '../../utils/userSettings';

const { Title, Text } = Typography;

/**
 * Modal de configurações da aplicação
 */
const SettingsModal = ({ visible, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Carregar configurações atuais
  useEffect(() => {
    if (visible) {
      loadCurrentSettings();
    }
  }, [visible]);

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
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          defaultHomePage: 'https://www.google.com'
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
       
      </Form>
    </Modal>
  );
};

export default SettingsModal;
