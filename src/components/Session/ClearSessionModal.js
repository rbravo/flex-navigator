import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

/**
 * Modal de confirmação para limpar os painéis atuais
 */
const ClearSessionModal = ({ visible, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('session.clear.title')}
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={t('session.clear.ok')}
      cancelText={t('session.clear.cancel')}
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
            {t('session.clear.confirmText')}
          </Text>
          <br />
          <br />
          <Text type="warning">
            {t('session.clear.warningText')}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ClearSessionModal;
