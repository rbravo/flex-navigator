import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, message } from 'antd';
import { Save } from 'lucide-react';

/**
 * Modal para salvar sessão atual
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
        message.success(`Sessão "${sessionName}" salva com sucesso!`);
        onCancel(); // Fechar modal
      } else {
        message.error(`Erro ao salvar sessão: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro na validação do formulário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateSessionName = (_, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error('Por favor, digite um nome para a sessão'));
    }
    
    if (value.trim().length < 2) {
      return Promise.reject(new Error('O nome da sessão deve ter pelo menos 2 caracteres'));
    }
    
    if (value.trim().length > 50) {
      return Promise.reject(new Error('O nome da sessão não pode ter mais de 50 caracteres'));
    }
    
    // Verificar se já existe uma sessão com esse nome
    const existingSession = existingSessions.find(
      session => session.name.toLowerCase() === value.trim().toLowerCase()
    );
    
    if (existingSession) {
      return Promise.reject(new Error('Já existe uma sessão com este nome. Ela será sobrescrita.'));
    }
    
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} />
          <span>Salvar Sessão Atual</span>
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
          Salve a configuração atual do layout (abas abertas, tamanhos dos painéis, etc.) 
          para poder restaurá-la posteriormente.
        </p>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="Nome da Sessão"
            name="sessionName"
            rules={[{ validator: validateSessionName }]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input
              placeholder="Digite um nome para identificar esta sessão..."
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
            ⚠️ Uma sessão com este nome já existe e será sobrescrita.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SaveSessionModal;
