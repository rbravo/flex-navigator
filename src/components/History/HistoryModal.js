import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Input, Button, Typography, Empty, Spin, Space, Popconfirm, List, Avatar } from 'antd';
import { SearchOutlined, DeleteOutlined, GlobalOutlined, ClearOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

const formatVisitedAt = (isoString) => {
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return isoString;
  }
};

/**
 * Modal de Histórico de navegação: lista pesquisável das URLs visitadas em
 * qualquer aba (gravadas no processo principal, ver HistoryManager.js), com
 * opção de abrir, remover uma entrada ou limpar tudo.
 */
const HistoryModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchDebounceRef = useRef(null);

  const loadEntries = useCallback(async (query) => {
    if (!window.electronAPI) return;
    setLoading(true);
    try {
      const result = await window.electronAPI.listHistory(query);
      setEntries(result);
    } finally {
      setLoading(false);
    }
  }, []);

  // O modal não desmonta ao fechar, então recarrega (com busca zerada)
  // toda vez que é reaberto - evita mostrar uma lista desatualizada em
  // relação a navegações feitas enquanto ele estava escondido.
  useEffect(() => {
    if (visible) {
      setSearchText('');
      loadEntries('');
    }
  }, [visible, loadEntries]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => loadEntries(value), 200);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const handleOpenEntry = (url) => {
    if (window.electronAPI) {
      window.electronAPI.openInNewTab(url);
    }
    onClose();
  };

  const handleRemoveEntry = (id) => {
    window.electronAPI.removeHistoryEntry(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleClearHistory = () => {
    window.electronAPI.clearHistory();
    setEntries([]);
  };

  return (
    <Modal
        title={t('history.title')}
        open={visible}
        onCancel={onClose}
        width={640}
        footer={[
        <Popconfirm
          key="clear"
          title={t('history.clearConfirmTitle')}
          description={t('history.clearConfirmDescription')}
          okText={t('history.clearOk')}
          cancelText={t('history.cancel')}
          onConfirm={handleClearHistory}
          disabled={!entries || entries.length === 0}
        >
          <Button danger icon={<ClearOutlined />} disabled={!entries || entries.length === 0}>
            {t('history.clear')}
          </Button>
        </Popconfirm>,
        <Button key="close" type="primary" onClick={onClose}>
          {t('history.close')}
        </Button>
        ]}
      >
      <Input
        placeholder={t('history.searchPlaceholder')}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={handleSearchChange}
        allowClear
        style={{ marginBottom: 16 }}
      />

      {loading || entries === null ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Spin size="small" />
        </div>
      ) : entries.length === 0 ? (
        <Empty
          description={searchText ? t('history.noResults') : t('history.empty')}
          style={{ padding: '24px 0' }}
        />
      ) : (
        <List
          style={{ maxHeight: 400, overflowY: 'auto' }}
          dataSource={entries}
          renderItem={(entry) => (
            <List.Item
              key={entry.id}
              actions={[
                <Button
                  key="remove"
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEntry(entry.id);
                  }}
                />
              ]}
              style={{ cursor: 'pointer' }}
              onClick={() => handleOpenEntry(entry.url)}
            >
              <List.Item.Meta
                avatar={
                  entry.faviconUrl ? (
                    <Avatar src={entry.faviconUrl} size="small" />
                  ) : (
                    <Avatar icon={<GlobalOutlined />} size="small" />
                  )
                }
                title={<Text ellipsis>{entry.title}</Text>}
                description={
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                      {entry.url}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatVisitedAt(entry.visitedAt)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default HistoryModal;
