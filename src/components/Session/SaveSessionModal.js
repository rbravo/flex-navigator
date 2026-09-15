import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, message } from 'antd';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Modal para salvar os painéis (abas + posicionamento) atuais
 */
const SaveSessionModal = ({ isVisible, onSave, onCancel, existingSessions = [] }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [sessionName, setSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Limpar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isVisible) {
      form.resetFields();
      setSessionName('');
    }
  }, [isVisible, form]);

  const handleSave = async () => {
    try {
      await form.validateFields();
      setIsLoading(true);

      const result = await onSave(sessionName.trim());

      if (result.success) {
        message.success(t('session.save.successMessage', { name: sessionName }));
        onCancel(); // Fechar modal
      } else {
        message.error(t('session.save.errorMessage', { error: result.error }));
      }
    } catch (error) {
      console.error('Erro na validação do formulário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateSessionName = (_, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error(t('session.save.nameRequired')));
    }

    if (value.trim().length < 2) {
      return Promise.reject(new Error(t('session.save.nameTooShort')));
    }

    if (value.trim().length > 50) {
      return Promise.reject(new Error(t('session.save.nameTooLong')));
    }

    // Um nome já usado é permitido (sobrescreve o painel salvo existente,
    // como o aviso abaixo do campo já explica) - não é um erro de validação,
    // então não deve bloquear o formulário.
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} />
          <span>{t('session.save.title')}</span>
        </div>
      }
      open={isVisible}
      onOk={handleSave}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText={t('session.save.ok')}
      cancelText={t('session.save.cancel')}
      width={480}
      destroyOnClose
    >
      <div style={{ margin: '20px 0' }}>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          {t('session.save.description')}
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label={t('session.save.nameLabel')}
            name="sessionName"
            rules={[{ validator: validateSessionName }]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input
              placeholder={t('session.save.namePlaceholder')}
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onPressEnter={handleSave}
              autoFocus
              maxLength={50}
              showCount
            />
          </Form.Item>
        </Form>

        {existingSessions.find(
          session => session.name.toLowerCase() === sessionName.trim().toLowerCase()
        ) && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#d46b08'
          }}>
            {t('session.save.overwriteWarning')}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SaveSessionModal;
