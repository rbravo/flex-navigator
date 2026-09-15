import React, { useState, useEffect, useCallback } from 'react';
import { Select, Typography, Empty, Button, Spin, Space, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  getPermissionLabels,
  getPermissionDecisionOptions,
  decisionToOption,
  optionToDecision
} from '../../utils/permissionLabels';

const { Text } = Typography;

/**
 * Aba "Permissões" das Configurações: lista todos os sites que já tiveram
 * alguma permissão decidida (câmera, localização, etc.) e deixa o usuário
 * mudar ou esquecer cada decisão. As mudanças aqui são aplicadas na hora -
 * não fazem parte do formulário/"Salvar" geral das Configurações, porque
 * ficam persistidas num arquivo à parte (permissions.json), o mesmo usado
 * pelo popover de informações do site.
 */
const PermissionsSettingsTab = () => {
  const { t } = useTranslation();
  const [sites, setSites] = useState(null);
  const [loading, setLoading] = useState(false);

  const permissionLabels = getPermissionLabels(t);
  const permissionDecisionOptions = getPermissionDecisionOptions(t);

  const loadSites = useCallback(async () => {
    if (!window.electronAPI) return;
    setLoading(true);
    try {
      const result = await window.electronAPI.listSitePermissions();
      setSites(result);
    } finally {
      setLoading(false);
    }
  }, []);

  // O modal de Configurações não desmonta ao fechar (só some visualmente),
  // e o antd também não propaga updates pra dentro de uma aba inativa do
  // Tabs de forma confiável - então em vez de tentar reagir a props, o
  // SettingsModal força essa aba a remontar (via `key`) toda vez que o modal
  // abre, e aqui basta recarregar no mount de sempre.
  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const handlePermissionChange = (origin, permission, option) => {
    window.electronAPI.setSitePermission(origin, permission, optionToDecision(option));
    setSites((prev) =>
      prev
        .map((site) =>
          site.origin === origin
            ? { ...site, permissions: { ...site.permissions, [permission]: optionToDecision(option) } }
            : site
        )
        // Se a última permissão do site virou "perguntar sempre", o site some
        // da lista - igual ao comportamento do processo principal.
        .filter((site) => Object.keys(site.permissions).length > 0)
    );
  };

  const handleForgetSite = (origin) => {
    window.electronAPI.removeSitePermissions(origin);
    setSites((prev) => prev.filter((site) => site.origin !== origin));
  };

  if (loading || sites === null) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <Spin size="small" />
      </div>
    );
  }

  if (sites.length === 0) {
    return <Empty description={t('settings.permissions.empty')} style={{ padding: '24px 0' }} />;
  }

  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        {t('settings.permissions.description')}
      </Text>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {sites.map((site) => (
          <div
            key={site.origin}
            style={{ border: '1px solid var(--nav-border)', borderRadius: 6, padding: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{site.origin}</Text>
              <Popconfirm
                title={t('settings.permissions.forgetSiteTitle')}
                description={t('settings.permissions.forgetSiteDescription')}
                okText={t('settings.permissions.forgetSite')}
                cancelText={t('common.cancel')}
                onConfirm={() => handleForgetSite(site.origin)}
              >
                <Button size="small" icon={<DeleteOutlined />} danger>
                  {t('settings.permissions.forgetSite')}
                </Button>
              </Popconfirm>
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {Object.entries(site.permissions).map(([permission, granted]) => (
                <div
                  key={permission}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
                >
                  <Text style={{ fontSize: 12 }}>{permissionLabels[permission] || permission}</Text>
                  <Select
                    size="small"
                    value={decisionToOption(granted)}
                    onChange={(option) => handlePermissionChange(site.origin, permission, option)}
                    style={{ width: 150 }}
                    options={permissionDecisionOptions}
                  />
                </div>
              ))}
            </Space>
          </div>
        ))}
      </Space>
    </div>
  );
};

export default PermissionsSettingsTab;
