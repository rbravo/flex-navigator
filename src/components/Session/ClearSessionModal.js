import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Modal de confirmação para limpar os painéis atuais
 */
const ClearSessionModal = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      title="Limpar painéis atuais"
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
            Esta ação irá fechar todas as abas e painéis abertos e começar do zero.
          </Text>
          <br />
          <br />
          <Text type="warning">
            ⚠️ Certifique-se de salvar os painéis atuais se desejar mantê-los.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ClearSessionModal;
