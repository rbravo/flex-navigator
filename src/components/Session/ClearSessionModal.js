import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Modal de confirmação para limpar sessão atual
 */
const ClearSessionModal = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      title="Limpar sessão atual"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Sim, limpar"
      cancelText="Cancelar"
      okType="danger"
      centered
      width={420}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <ExclamationCircleOutlined 
          style={{ 
            color: '#faad14', 
            fontSize: '22px',
            marginTop: '2px'
          }} 
        />
        <div>
          <Text>
            Esta ação irá fechar todas as abas abertas e começar uma nova sessão.
          </Text>
          <br />
          <br />
          <Text type="warning">
            ⚠️ Certifique-se de salvar sua sessão atual se desejar mantê-la.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ClearSessionModal;
