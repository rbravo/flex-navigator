import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Modal de confirmação para limpar sessão atual
 */
const ClearSessionModal = ({ onConfirm }) => {
  const showConfirm = () => {
    Modal.confirm({
      title: 'Limpar sessão atual',
      icon: <ExclamationCircleOutlined />,
      content: (
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
      ),
      okText: 'Sim, limpar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        if (onConfirm) {
          onConfirm();
        }
      },
      onCancel() {
        console.log('Limpeza de sessão cancelada');
      },
    });
  };

  return { showConfirm };
};

export default ClearSessionModal;
