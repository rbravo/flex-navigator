import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, message } from 'antd';
import { Save } from 'lucide-react';

/**
 * Modal para salvar os painéis (abas + posicionamento) atuais
 */
const SaveSessionModal = ({ isVisible, onSave, onCancel, existingSessions = [] }) => {
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
        message.success(`Painéis "${sessionName}" salvos com sucesso!`);
        onCancel(); // Fechar modal
      } else {
        message.error(`Erro ao salvar painéis: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro na validação do formulário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateSessionName = (_, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error('Por favor, digite um nome para os painéis'));
    }

    if (value.trim().length < 2) {
      return Promise.reject(new Error('O nome deve ter pelo menos 2 caracteres'));
    }

    if (value.trim().length > 50) {
      return Promise.reject(new Error('O nome não pode ter mais de 50 caracteres'));
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
          <span>Salvar Painéis Atuais</span>
        </div>
      }
      open={isVisible}
      onOk={handleSave}
      onCancel={onCancel}
      confirmLoading={isLoading}
      okText="Salvar"
      cancelText="Cancelar"
      width={480}
      destroyOnClose
    >
      <div style={{ margin: '20px 0' }}>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          Salve a configuração atual dos painéis (abas abertas, posicionamento e
          tamanhos) para poder restaurá-la posteriormente.
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="Nome dos Painéis"
            name="sessionName"
            rules={[{ validator: validateSessionName }]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input
              placeholder="Digite um nome para identificar estes painéis..."
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
            ⚠️ Painéis salvos com este nome já existem e serão sobrescritos.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SaveSessionModal;
