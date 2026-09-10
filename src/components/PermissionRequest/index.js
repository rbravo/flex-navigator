import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Typography } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PERMISSION_LABELS = {
  geolocation: 'ver sua localização',
  notifications: 'mostrar notificações',
  midiSysex: 'acessar dispositivos MIDI',
  'clipboard-read': 'ler a área de transferência'
};

const describePermission = (permission, mediaTypes) => {
  if (permission === 'media') {
    const types = mediaTypes || [];
    const hasAudio = types.includes('audio');
    const hasVideo = types.includes('video');
    if (hasAudio && hasVideo) return 'usar sua câmera e microfone';
    if (hasVideo) return 'usar sua câmera';
    if (hasAudio) return 'usar seu microfone';
    return 'usar câmera/microfone';
  }
  return PERMISSION_LABELS[permission] || `usar a permissão "${permission}"`;
};

/**
 * Mostra um aviso sempre que um site aberto numa aba pede acesso a câmera,
 * microfone, localização, notificações etc. O processo principal intercepta
 * o pedido nativo do Chromium (setPermissionRequestHandler em
 * webContentsSetup.js) e só libera depois que o usuário decide aqui - pedidos
 * chegam em fila para não empilhar vários modais ao mesmo tempo.
 */
const PermissionRequestManager = () => {
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
      title="Solicitação de permissão"
      open={!!current}
      onOk={() => respond(true)}
      onCancel={() => respond(false)}
      okText="Permitir"
      cancelText="Bloquear"
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
            <Text>quer {describePermission(current.permission, current.mediaTypes)}.</Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PermissionRequestManager;
