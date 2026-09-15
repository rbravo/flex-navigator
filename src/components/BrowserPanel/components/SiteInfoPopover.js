import React, { useState, useCallback } from 'react';
import { Popover, Select, Space, Typography, Divider, Spin } from 'antd';
import { LockOutlined, WarningOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useCloseOnWebviewFocus from '../../../hooks/useCloseOnWebviewFocus';
import { getPermissionLabels, getPermissionDecisionOptions, decisionToOption, optionToDecision } from '../../../utils/permissionLabels';

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
  const { t } = useTranslation();
  const permissionLabels = getPermissionLabels(t);
  const permissionDecisionOptions = getPermissionDecisionOptions(t);
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
      return <Text style={{ color: '#a0a0a0' }}>{t('siteInfo.noSecurityInfo')}</Text>;
    }

    if (siteInfo.protocol === 'https:') {
      const cert = siteInfo.certificate;
      return (
        <div>
          <Space>
            <LockOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: 'var(--nav-text)' }}>{t('siteInfo.secureConnection')}</Text>
          </Space>
          {cert ? (
            <div style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0' }}>
              <div>{t('siteInfo.issuedTo', { name: cert.subject?.commonName || siteInfo.hostname })}</div>
              <div>{t('siteInfo.issuedBy', { name: cert.issuer?.commonName || cert.issuer?.organizations?.[0] || t('common.unknown') })}</div>
              <div>{t('siteInfo.validUntil', { date: formatCertDate(cert.validExpiry) })}</div>
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0' }}>
              {t('siteInfo.certUnavailable')}
            </div>
          )}
        </div>
      );
    }

    if (siteInfo.protocol === 'http:') {
      return (
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <Text style={{ color: 'var(--nav-text)' }}>{t('siteInfo.insecureConnection')}</Text>
        </Space>
      );
    }

    return <Text style={{ color: '#a0a0a0' }}>{t('siteInfo.internalPage')}</Text>;
  };

  const content = (
    <div style={{ width: '300px', backgroundColor: 'var(--nav-panel)' }}>
      {loading || !siteInfo ? (
        <Spin size="small" />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {renderSecuritySummary()}

          <Divider style={{ margin: 0, backgroundColor: 'var(--nav-border)' }} />

          <div>
            <Text style={{ color: 'var(--nav-text)', fontSize: '13px', fontWeight: 500 }}>
              {t('siteInfo.permissionsTitle')}
            </Text>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {siteInfo.permissions.map(({ permission, granted }) => (
                <div key={permission} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: 'var(--nav-text)', fontSize: 12 }}>{permissionLabels[permission] || permission}</Text>
                  <Select
                    size="small"
                    value={decisionToOption(granted)}
                    onChange={(option) => handlePermissionChange(permission, option)}
                    style={{ width: 140 }}
                    popupClassName="dark-select-dropdown"
                    options={permissionDecisionOptions}
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
      <Text style={{ color: 'var(--nav-text)' }}>{siteInfo?.hostname || t('siteInfo.title')}</Text>
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
      overlayStyle={{ backgroundColor: 'var(--nav-panel)' }}
      overlayInnerStyle={{
        backgroundColor: 'var(--nav-panel)',
        border: '1px solid var(--nav-border)',
        borderRadius: '6px'
      }}
    >
      {children}
    </Popover>
  );
};

export default SiteInfoPopover;
