import React, { useState, useEffect, useCallback } from 'react';
import { Popover, Progress, Typography, Space, Button, Empty, Tooltip, Badge } from 'antd';
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  CloseCircleOutlined,
  FolderOpenOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useCloseOnWebviewFocus from '../../../hooks/useCloseOnWebviewFocus';
import { formatBytes } from '../../../utils/formatBytes';

const { Text } = Typography;

const upsertDownload = (list, download) => {
  const index = list.findIndex((d) => d.id === download.id);
  if (index === -1) return [download, ...list];
  const next = [...list];
  next[index] = download;
  return next;
};

/**
 * Popover de downloads: mostra progresso dos downloads em andamento e a
 * lista de downloads recentes desta sessão do app (não persiste em disco),
 * com controles de pausar/retomar/cancelar/abrir. Abre a partir do ícone na
 * barra de URL, ao lado do botão de Configurações.
 */
const DownloadsPopover = ({ children }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [downloads, setDownloads] = useState([]);

  const stateLabels = {
    progressing: t('downloads.state.progressing'),
    paused: t('downloads.state.paused'),
    completed: t('downloads.state.completed'),
    cancelled: t('downloads.state.cancelled'),
    interrupted: t('downloads.state.interrupted')
  };

  useCloseOnWebviewFocus(open, () => setOpen(false));

  const loadDownloads = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.listDownloads();
    setDownloads(result);
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return undefined;

    loadDownloads();

    const unsubscribers = [
      window.electronAPI.onDownloadStarted((download) => setDownloads((prev) => upsertDownload(prev, download))),
      window.electronAPI.onDownloadUpdated((download) => setDownloads((prev) => upsertDownload(prev, download))),
      window.electronAPI.onDownloadDone((download) => setDownloads((prev) => upsertDownload(prev, download)))
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [loadDownloads]);

  const hasActiveDownload = downloads.some((d) => d.state === 'progressing');

  const renderActions = (download) => {
    if (download.state === 'progressing') {
      return (
        <Space size="small">
          <Tooltip title={t('downloads.pause')}>
            <Button size="small" type="text" icon={<PauseCircleOutlined />} onClick={() => window.electronAPI.pauseDownload(download.id)} />
          </Tooltip>
          <Tooltip title={t('downloads.cancel')}>
            <Button size="small" type="text" danger icon={<CloseCircleOutlined />} onClick={() => window.electronAPI.cancelDownload(download.id)} />
          </Tooltip>
        </Space>
      );
    }
    if (download.state === 'paused') {
      return (
        <Space size="small">
          <Tooltip title={t('downloads.resume')}>
            <Button size="small" type="text" icon={<PlayCircleOutlined />} onClick={() => window.electronAPI.resumeDownload(download.id)} disabled={!download.canResume} />
          </Tooltip>
          <Tooltip title={t('downloads.cancel')}>
            <Button size="small" type="text" danger icon={<CloseCircleOutlined />} onClick={() => window.electronAPI.cancelDownload(download.id)} />
          </Tooltip>
        </Space>
      );
    }
    if (download.state === 'completed') {
      return (
        <Space size="small">
          <Tooltip title={t('downloads.openFile')}>
            <Button size="small" type="text" icon={<FileDoneOutlined />} onClick={() => window.electronAPI.openDownloadFile(download.id)} />
          </Tooltip>
          <Tooltip title={t('downloads.showInFolder')}>
            <Button size="small" type="text" icon={<FolderOpenOutlined />} onClick={() => window.electronAPI.showDownloadInFolder(download.id)} />
          </Tooltip>
        </Space>
      );
    }
    return (
      <Tooltip title={stateLabels[download.state] || download.state}>
        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      </Tooltip>
    );
  };

  const content = (
    <div style={{ width: '320px', backgroundColor: 'var(--nav-panel)', maxHeight: 360, overflowY: 'auto' }}>
      {downloads.length === 0 ? (
        <Empty description={t('downloads.empty')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {downloads.map((download) => (
            <div key={download.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text style={{ color: 'var(--nav-text)', fontSize: 13 }} ellipsis={{ tooltip: download.filename }}>
                    {download.filename}
                  </Text>
                  <div style={{ fontSize: 11, color: '#a0a0a0' }}>
                    {download.state === 'progressing' || download.state === 'paused'
                      ? t('downloads.of', {
                          received: formatBytes(download.receivedBytes),
                          total: download.totalBytes ? formatBytes(download.totalBytes) : '?'
                        })
                      : stateLabels[download.state] || download.state}
                  </div>
                </div>
                {renderActions(download)}
              </div>
              {(download.state === 'progressing' || download.state === 'paused') && (
                <Progress
                  percent={download.totalBytes ? Math.round((download.receivedBytes / download.totalBytes) * 100) : 0}
                  size="small"
                  showInfo={false}
                  status={download.state === 'paused' ? 'normal' : 'active'}
                />
              )}
            </div>
          ))}
        </Space>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={<Text style={{ color: 'var(--nav-text)' }}>{t('downloads.title')}</Text>}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      overlayStyle={{ backgroundColor: 'var(--nav-panel)' }}
      overlayInnerStyle={{
        backgroundColor: 'var(--nav-panel)',
        border: '1px solid var(--nav-border)',
        borderRadius: '6px'
      }}
    >
      <Badge dot={hasActiveDownload} color="#007acc" offset={[-2, 2]}>
        {children}
      </Badge>
    </Popover>
  );
};

export default DownloadsPopover;
