import React, { useState, useCallback } from 'react';
import { Popover, Select, Space, Typography, Divider, Spin } from 'antd';
import { LockOutlined, WarningOutlined, GlobalOutlined } from '@ant-design/icons';
import useCloseOnWebviewFocus from '../../../hooks/useCloseOnWebviewFocus';
import { PERMISSION_LABELS, PERMISSION_DECISION_OPTIONS, decisionToOption, optionToDecision } from '../../../utils/permissionLabels';

const { Text } = Typography;

const formatCertDate = (unixSeconds) => {
  if (!unixSeconds) return '—';
  return new Date(unixSeconds * 1000).toLocaleDateString();
};

/**
 * Popover de informações do site: mostra o estado do certificado TLS da
 * página atual e a lista de permissões (câmera, localização, etc.) já
 * concedidas/negadas para esse site, deixando o usuário mudar cada uma.
 * Abre a partir do ícone de globo na barra de URL (ver ControlsBar.js).
 */
const SiteInfoPopover = ({ children, currentUrl }) => {
  const [open, setOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSiteInfo = useCallback(async () => {
    if (!window.electronAPI || !currentUrl) return;
    setLoading(true);
    try {
      const info = await window.electronAPI.getSiteInfo(currentUrl);
      setSiteInfo(info);
    } finally {
      setLoading(false);
    }
  }, [currentUrl]);

  useCloseOnWebviewFocus(open, () => setOpen(false));

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) loadSiteInfo();
  };

  const handlePermissionChange = (permission, option) => {
    if (!siteInfo || !siteInfo.origin) return;
    const granted = optionToDecision(option);
    window.electronAPI.setSitePermission(siteInfo.origin, permission, granted);
    setSiteInfo((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) => (p.permission === permission ? { ...p, granted } : p))
    }));
  };

  const renderSecuritySummary = () => {
    if (!siteInfo || !siteInfo.protocol) {
      return <Text style={{ color: '#a0a0a0' }}>Sem informações de segurança para esta página.</Text>;
    }

    if (siteInfo.protocol === 'https:') {
      const cert = siteInfo.certificate;
      return (
        <div>
          <Space>
            <LockOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: '#cccccc' }}>Conexão segura (HTTPS)</Text>
          </Space>
          {cert ? (
            <div style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0' }}>
              <div>Emitido para: {cert.subject?.commonName || siteInfo.hostname}</div>
              <div>Emitido por: {cert.issuer?.commonName || cert.issuer?.organizations?.[0] || 'desconhecido'}</div>
              <div>Válido até: {formatCertDate(cert.validExpiry)}</div>
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0' }}>
              Detalhes do certificado ainda não disponíveis - recarregue a página.
            </div>
          )}
        </div>
      );
    }

    if (siteInfo.protocol === 'http:') {
      return (
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <Text style={{ color: '#cccccc' }}>Conexão não é segura (HTTP)</Text>
        </Space>
      );
    }

    return <Text style={{ color: '#a0a0a0' }}>Página interna, sem informações de conexão.</Text>;
  };

  const content = (
    <div style={{ width: '300px', backgroundColor: '#2d2d30' }}>
      {loading || !siteInfo ? (
        <Spin size="small" />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {renderSecuritySummary()}

          <Divider style={{ margin: 0, backgroundColor: '#3e3e42' }} />

          <div>
            <Text style={{ color: '#cccccc', fontSize: '13px', fontWeight: 500 }}>
              Permissões para este site
            </Text>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {siteInfo.permissions.map(({ permission, granted }) => (
                <div key={permission} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: '#cccccc', fontSize: 12 }}>{PERMISSION_LABELS[permission] || permission}</Text>
                  <Select
                    size="small"
                    value={decisionToOption(granted)}
                    onChange={(option) => handlePermissionChange(permission, option)}
                    style={{ width: 140 }}
                    popupClassName="dark-select-dropdown"
                    options={PERMISSION_DECISION_OPTIONS}
                  />
                </div>
              ))}
            </div>
          </div>
        </Space>
      )}
    </div>
  );

  const title = (
    <Space>
      <GlobalOutlined style={{ color: '#007acc' }} />
      <Text style={{ color: '#cccccc' }}>{siteInfo?.hostname || 'Informações do site'}</Text>
    </Space>
  );

  return (
    <Popover
      content={content}
      title={title}
      trigger="click"
      placement="bottomLeft"
      open={open}
      onOpenChange={handleOpenChange}
      overlayStyle={{ backgroundColor: '#2d2d30' }}
      overlayInnerStyle={{
        backgroundColor: '#2d2d30',
        border: '1px solid #3e3e42',
        borderRadius: '6px'
      }}
    >
      {children}
    </Popover>
  );
};

export default SiteInfoPopover;
