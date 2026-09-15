import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Typography } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const describePermission = (t, permission, mediaTypes) => {
  if (permission === 'media') {
    const types = mediaTypes || [];
    const hasAudio = types.includes('audio');
    const hasVideo = types.includes('video');
    if (hasAudio && hasVideo) return t('permissionRequest.actions.mediaAudioVideo');
    if (hasVideo) return t('permissionRequest.actions.mediaVideo');
    if (hasAudio) return t('permissionRequest.actions.mediaAudio');
    return t('permissionRequest.actions.mediaGeneric');
  }

  const knownActions = ['geolocation', 'notifications', 'midiSysex', 'clipboard-read'];
  if (knownActions.includes(permission)) {
    return t(`permissionRequest.actions.${permission}`);
  }
  return t('permissionRequest.actions.generic', { permission });
};

/**
 * Mostra um aviso sempre que um site aberto numa aba pede acesso a câmera,
 * microfone, localização, notificações etc. O processo principal intercepta
 * o pedido nativo do Chromium (setPermissionRequestHandler em
 * webContentsSetup.js) e só libera depois que o usuário decide aqui - pedidos
 * chegam em fila para não empilhar vários modais ao mesmo tempo.
 */
const PermissionRequestManager = () => {
  const { t } = useTranslation();
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (!window.electronAPI) return undefined;

    const handleRequest = (request) => {
      setQueue((prev) => [...prev, request]);
    };

    return window.electronAPI.onPermissionRequest(handleRequest);
  }, []);

  const current = queue[0];

  const respond = useCallback((granted) => {
    if (!current) return;
    window.electronAPI.respondToPermissionRequest(current.requestId, granted);
    setQueue((prev) => prev.slice(1));
  }, [current]);

  return (
    <Modal
      title={t('permissionRequest.title')}
      open={!!current}
      onOk={() => respond(true)}
      onCancel={() => respond(false)}
      okText={t('permissionRequest.allow')}
      cancelText={t('permissionRequest.block')}
      centered
      width={420}
    >
      {current && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <SafetyCertificateOutlined
            style={{ color: '#1677ff', fontSize: '22px', marginTop: '2px' }}
          />
          <div>
            <Text strong>{current.origin}</Text>
            <br />
            <Text>{t('permissionRequest.wantsTo', { action: describePermission(t, current.permission, current.mediaTypes) })}</Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PermissionRequestManager;
