import React, { useState } from 'react';
import { Button, Input, Space, Tooltip, Dropdown, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  StopOutlined,
  GlobalOutlined,
  SendOutlined,
  ClockCircleOutlined,
  ControlOutlined,
  SettingOutlined,
  AppstoreAddOutlined,
  ControlFilled,
  DownloadOutlined,
  PlusOutlined,
  MinusOutlined,
  SearchOutlined,
  MoreOutlined,
  ZoomInOutlined,
  HistoryOutlined,
  MobileOutlined,
  LayoutOutlined,
  SaveOutlined,
  ClearOutlined,
  FolderOpenOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import AutoRefreshSettings from './AutoRefreshSettings';
import ShortcutsSettings from './ShortcutsSettings';
import SiteInfoPopover from './SiteInfoPopover';
import DownloadsPopover from './DownloadsPopover';
import DimensionsPopover from './DimensionsPopover';
import useCloseOnWebviewFocus from '../../../hooks/useCloseOnWebviewFocus';

/**
 * Barra de controles de navegação
 */
const ControlsBar = ({
  canGoBack,
  canGoForward,
  isLoading,
  url,
  setUrl,
  currentUrl,
  onBack,
  onForward,
  onRefresh,
  onUrlSubmit,
  urlInputRef,
  // Props para auto-refresh
  isAutoRefreshEnabled,
  refreshInterval,
  timeRemaining,
  onToggleAutoRefresh,
  onIntervalChange,
  // Props para shortcuts
  isShortcutsEnabled = true,
  shortcutModifiers = 'Ctrl+Shift',
  onToggleShortcuts,
  onShortcutModifiersChange,
  showShortcutsOverlay = true,
  onToggleShortcutsOverlay,
  // Props para zoom e busca na página
  zoomFactor = 1,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenFind,
  // Props para dimensões da webview (emulação de tela de celular/tablet)
  deviceDimensions,
  onApplyDeviceDimensions,
  onResetDeviceDimensions
}) => {
  const { Text } = Typography;
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedPanels, setSavedPanels] = useState([]);
  useCloseOnWebviewFocus(menuOpen, () => setMenuOpen(false));

  // Busca a lista de painéis salvos sempre que o dropdown abre - a mesma
  // ideia do menu nativo antigo, que recarregava a lista a cada clique, só
  // que agora direto do renderer (sem precisar reconstruir um Menu nativo).
  const handleMenuOpenChange = (open) => {
    setMenuOpen(open);
    if (open && window.electronAPI) {
      window.electronAPI.loadSessions().then((result) => {
        if (result.success) setSavedPanels(result.sessions);
      });
    }
  };

  const panelsMenuItems = [
    {
      key: 'panels-save',
      icon: <SaveOutlined />,
      label: t('session.menu.saveCurrent'),
      onClick: () => {
        setMenuOpen(false);
        window.dispatchEvent(new CustomEvent('show-save-session-dialog'));
      }
    },
    {
      key: 'panels-clear',
      icon: <ClearOutlined />,
      label: t('session.menu.clearCurrent'),
      onClick: () => {
        setMenuOpen(false);
        window.dispatchEvent(new CustomEvent('show-clear-session-dialog'));
      }
    },
    { type: 'divider' },
    ...(savedPanels.length === 0
      ? [{ key: 'panels-empty', label: t('session.menu.empty'), disabled: true }]
      : savedPanels.map((panel) => ({
          key: `panel-${panel.id}`,
          icon: <FolderOpenOutlined />,
          label: panel.name,
          children: [
            {
              key: `panel-${panel.id}-open-here`,
              label: t('session.menu.openHere'),
              onClick: () => {
                setMenuOpen(false);
                window.dispatchEvent(
                  new CustomEvent('panels-load-session', { detail: { sessionId: panel.id } })
                );
              }
            },
            {
              key: `panel-${panel.id}-open-new`,
              label: t('session.menu.openNewWindow'),
              onClick: () => {
                setMenuOpen(false);
                window.electronAPI?.openSessionInNewWindow(panel.id);
              }
            },
            { type: 'divider' },
            {
              key: `panel-${panel.id}-delete`,
              icon: <DeleteOutlined />,
              danger: true,
              label: t('session.menu.delete'),
              onClick: () => {
                setMenuOpen(false);
                window.dispatchEvent(
                  new CustomEvent('confirm-delete-session', {
                    detail: { sessionId: panel.id, sessionName: panel.name }
                  })
                );
              }
            }
          ]
        })))
  ];

  const borderlessButtonStyle = {
    borderColor: 'var(--nav-border)',
    backgroundColor: 'var(--nav-panel)',
    border: '1px solid transparent'
  }

  // Formatar o tempo restante para exibição
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  return (
    <div className="controls-bar">
      <Space size="small">
        <Tooltip title={t('controlsBar.back')} placement={'bottom'}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            size="small"
            disabled={!canGoBack}
            onClick={onBack}
            style={{
              color: canGoBack ? 'var(--nav-text)' : '#666666',
              ...borderlessButtonStyle,
              marginLeft: -2
            }}
          />
        </Tooltip>

        <Tooltip title={t('controlsBar.forward')} placement={'bottom'}>
          <Button
            type="text"
            icon={<RightOutlined />}
            size="small"
            disabled={!canGoForward}
            onClick={onForward}
            style={{
              color: canGoForward ? 'var(--nav-text)' : '#666666',
              ...borderlessButtonStyle
            }}
          />
        </Tooltip>

        <Tooltip title={isLoading ? t('controlsBar.stopLoading') : t('controlsBar.refresh')} placement={'bottom'}>
          <Button
            type="text"
            icon={isLoading ? <StopOutlined /> : <ReloadOutlined />}
            size="small"
            onClick={onRefresh}
            style={{
              color: isLoading ? '#ff6b6b' : 'var(--nav-text)',
              ...borderlessButtonStyle
            }}
          />
        </Tooltip>
      </Space>

      <form className="url-form" onSubmit={onUrlSubmit}>
        <div className="url-input-container">
          <Input
            ref={urlInputRef}
            placeholder={t('controlsBar.urlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            prefix={
              isLoading ?
                <ReloadOutlined spin style={{ color: '#007acc' }} /> :
                <SiteInfoPopover currentUrl={currentUrl}>
                  <Tooltip title={t('controlsBar.siteInfo')} placement={'bottom'}>
                    <span style={{ cursor: 'pointer', display: 'inline-flex' }}>
                      <ControlFilled className="control-filled"
                        style={{ color: '#999999', fontSize: 18, marginRight: 2, marginLeft: -4 }} />
                    </span>
                  </Tooltip>
                </SiteInfoPopover>
            }
            suffix={
              !isLoading && (
                <Button
                  type="default"
                  className='buttonSend'
                  icon={<SendOutlined />}
                  size="small"
                  htmlType="submit"
                  style={{
                    // backgroundColor: '#007acc',
                    // borderColor: '#007acc',
                    borderWidth: 0,
                    height: '24px',
                    minWidth: '28px',
                    marginRight: '-5px'
                  }}
                />
              )
            }
            style={{
              backgroundColor: 'var(--nav-hover)',
              borderWidth: 0,
              color: 'var(--nav-text)'
            }}
            onPressEnter={onUrlSubmit}
          />
        </div>
      </form>

      {/* Seção de Extensions */}
      <div className="extensions-section">
        <Space size="small">

          <DimensionsPopover
            activeDimensions={deviceDimensions}
            onApply={onApplyDeviceDimensions}
            onReset={onResetDeviceDimensions}
          >
            <Tooltip title={t('controlsBar.dimensions')} placement={'bottom'}>
              <Button
                type="text"
                icon={<MobileOutlined />}
                size="small"
                style={{
                  color: deviceDimensions ? 'var(--nav-accent)' : 'var(--nav-text)',
                  borderColor: 'var(--nav-border)',
                  backgroundColor: 'var(--nav-panel)',
                  border: '1px solid transparent'
                }}
              />
            </Tooltip>
          </DimensionsPopover>

          <DownloadsPopover>
            <Tooltip title={t('controlsBar.downloads')} placement={'bottom'}>
              <Button
                type="text"
                icon={<DownloadOutlined />}
                size="small"
                style={{
                  color: 'var(--nav-text)',
                  borderColor: 'var(--nav-border)',
                  backgroundColor: 'var(--nav-panel)',
                  border: '1px solid transparent'
                }}
              />
            </Tooltip>
          </DownloadsPopover>

          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            open={menuOpen}
            onOpenChange={handleMenuOpenChange}
            menu={{
              items: [
                {
                  key: 'zoom',
                  icon: <ZoomInOutlined />,
                  label: (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}
                    >
                      <Text
                        style={{ flex: 1, textAlign: 'left', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        {t('controlsBar.zoom')}
                      </Text>
                      <Button
                        size="small"
                        type="text"
                        icon={<MinusOutlined />}
                        onClick={(e) => { e.stopPropagation(); onZoomOut?.(); }}
                      />
                      <Text
                        style={{ width: 44, textAlign: 'center', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); onZoomReset?.(); }}
                      >
                        {Math.round(zoomFactor * 100)}%
                      </Text>
                      <Button
                        size="small"
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={(e) => { e.stopPropagation(); onZoomIn?.(); }}
                      />
                    </div>
                  )
                },
                { type: 'divider' },
                {
                  key: 'find',
                  icon: <SearchOutlined />,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span>{t('controlsBar.findInPage')}</span>
                      <span style={{ opacity: 0.5 }}>Ctrl+F</span>
                    </div>
                  ),
                  onClick: () => { setMenuOpen(false); onOpenFind?.(); }
                },
                {
                  key: 'history',
                  icon: <HistoryOutlined />,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span>{t('controlsBar.history')}</span>
                      <span style={{ opacity: 0.5 }}>Ctrl+H</span>
                    </div>
                  ),
                  onClick: () => {
                    setMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('show-history-dialog'));
                  }
                },
                { type: 'divider' },
                {
                  key: 'autorefresh',
                  icon: <ClockCircleOutlined style={{ color: isAutoRefreshEnabled ? '#007acc' : undefined }} />,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span>{t('controlsBar.autoRefresh')}</span>
                      {isAutoRefreshEnabled && (
                        <span style={{ opacity: 0.6, fontSize: 12 }}>
                          {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : t('controlsBar.autoRefreshActive')}
                        </span>
                      )}
                    </div>
                  ),
                  children: [
                    {
                      key: 'autorefresh-panel',
                      className: 'flexnav-menu-item-no-hover',
                      label: (
                        <div onClick={(e) => e.stopPropagation()}>
                          <AutoRefreshSettings
                            isAutoRefreshEnabled={isAutoRefreshEnabled}
                            refreshInterval={refreshInterval}
                            onToggleAutoRefresh={onToggleAutoRefresh}
                            onIntervalChange={onIntervalChange}
                          />
                        </div>
                      )
                    }
                  ]
                },
                {
                  key: 'shortcuts',
                  icon: <AppstoreAddOutlined style={{ color: isShortcutsEnabled ? '#007acc' : undefined }} />,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span>{t('controlsBar.shortcuts')}</span>
                      {isShortcutsEnabled && <span style={{ opacity: 0.6, fontSize: 12 }}>{shortcutModifiers}</span>}
                    </div>
                  ),
                  children: [
                    {
                      key: 'shortcuts-panel',
                      className: 'flexnav-menu-item-no-hover',
                      label: (
                        <div onClick={(e) => e.stopPropagation()}>
                          <ShortcutsSettings
                            isShortcutsEnabled={isShortcutsEnabled}
                            shortcutModifiers={shortcutModifiers}
                            onToggleShortcuts={onToggleShortcuts}
                            onModifiersChange={onShortcutModifiersChange}
                            showOverlay={showShortcutsOverlay}
                            onToggleShowOverlay={onToggleShortcutsOverlay}
                          />
                        </div>
                      )
                    }
                  ]
                },
                {
                  key: 'panels',
                  icon: <LayoutOutlined />,
                  label: t('controlsBar.panels'),
                  children: panelsMenuItems
                },
                { type: 'divider' },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: t('controlsBar.settings'),
                  onClick: () => {
                    setMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('show-settings-dialog'));
                  }
                }
              ]
            }}
          >
            <Tooltip title={t('controlsBar.menu')} placement={'bottom'}>
              <Button
                type="text"
                icon={<MoreOutlined />}
                size="small"
                style={{
                  color: 'var(--nav-text)',
                  borderColor: 'var(--nav-border)',
                  backgroundColor: 'var(--nav-panel)',
                  border: '1px solid transparent'
                }}
              />
            </Tooltip>
          </Dropdown>

        </Space>
      </div>
    </div>
  );
};

export default ControlsBar;
