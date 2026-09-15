import React from 'react';
import { Modal, message } from 'antd';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Modal para confirmar remoção de painéis salvos
 */
const DeleteSessionModal = ({ isVisible, sessionName, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  const handleDelete = async () => {
    try {
      const result = await onConfirm();

      if (result.success) {
        message.success(t('session.delete.successMessage', { name: sessionName }));
      } else {
        message.error(t('session.delete.errorMessage', { error: result.error }));
      }
    } catch (error) {
      console.error('Erro ao remover painéis:', error);
      message.error(t('session.delete.unexpectedError'));
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={18} color="#ff4d4f" />
          <span>{t('session.delete.title')}</span>
        </div>
      }
      open={isVisible}
      onOk={handleDelete}
      onCancel={onCancel}
      okText={t('session.delete.ok')}
      cancelText={t('session.delete.cancel')}
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
              {t('session.delete.confirmText', { name: sessionName })}
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
              {t('session.delete.warningText')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteSessionModal;
