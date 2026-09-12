import React from 'react';
import { Modal, message } from 'antd';
import { Trash2, AlertTriangle } from 'lucide-react';

/**
 * Modal para confirmar remoção de painéis salvos
 */
const DeleteSessionModal = ({ isVisible, sessionName, onConfirm, onCancel }) => {
  const handleDelete = async () => {
    try {
      const result = await onConfirm();

      if (result.success) {
        message.success(`Painéis "${sessionName}" removidos com sucesso!`);
      } else {
        message.error(`Erro ao remover painéis: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro ao remover painéis:', error);
      message.error('Erro inesperado ao remover painéis');
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={18} color="#ff4d4f" />
          <span>Confirmar Remoção</span>
        </div>
      }
      open={isVisible}
      onOk={handleDelete}
      onCancel={onCancel}
      okText="Remover"
      cancelText="Cancelar"
      okType="danger"
      width={480}
      destroyOnClose
    >
      <div style={{ margin: '20px 0' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '12px',
          marginBottom: '16px'
        }}>
          <AlertTriangle size={20} color="#faad14" style={{ marginTop: '2px' }} />
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>
              Tem certeza que deseja remover os painéis "<strong>{sessionName}</strong>"?
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
              Esta ação não pode ser desfeita. Todas as configurações de layout
              destes painéis serão perdidas permanentemente.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteSessionModal;
