import React, { useState, useEffect } from 'react';
import { Popover, Switch, Select, Space, Typography, Divider, Button } from 'antd';
import { ControlOutlined, SettingOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

/**
 * Popover para configurar atalhos de navegação
 */
const ShortcutsConfigPopover = ({
  children,
  isShortcutsEnabled = true,
  shortcutModifiers = 'Ctrl+Shift',
  onToggleShortcuts,
  onModifiersChange,
  showOverlay = true,
  onToggleShowOverlay
}) => {
  const [localEnabled, setLocalEnabled] = useState(isShortcutsEnabled);
  const [localModifiers, setLocalModifiers] = useState(shortcutModifiers);
  const [localShowOverlay, setLocalShowOverlay] = useState(showOverlay);

  useEffect(() => {
    setLocalEnabled(isShortcutsEnabled);
  }, [isShortcutsEnabled]);

  useEffect(() => {
    setLocalModifiers(shortcutModifiers);
  }, [shortcutModifiers]);

  useEffect(() => {
    setLocalShowOverlay(showOverlay);
  }, [showOverlay]);

  const handleToggleChange = (checked) => {
    setLocalEnabled(checked);
    onToggleShortcuts?.(checked);
  };

  const handleModifiersChange = (value) => {
    setLocalModifiers(value);
    onModifiersChange?.(value);
  };

  const handleShowOverlayChange = (checked) => {
    setLocalShowOverlay(checked);
    onToggleShowOverlay?.(checked);
  };

  const modifierOptions = [
    { value: 'Ctrl+Shift', label: 'Ctrl + Shift' },
    { value: 'Ctrl+Alt', label: 'Ctrl + Alt' },
    { value: 'Alt+Shift', label: 'Alt + Shift' },
    { value: 'Ctrl+Meta', label: 'Ctrl + Win/Cmd' }
  ];

  const shortcuts = [
    { keys: `${localModifiers}+V`, action: 'Dividir verticalmente' },
    { keys: `${localModifiers}+H`, action: 'Dividir horizontalmente' },
    { keys: `${localModifiers}+W`, action: 'Fechar painel' },
    { keys: `${localModifiers}+←/→`, action: 'Navegar entre painéis' },
    { keys: `${localModifiers}+↑/↓`, action: 'Primeiro/Último painel' },
    { keys: `${localModifiers}+Enter`, action: 'Focar no painel' }
  ];

  const content = (
    <div style={{
      width: '320px',
      backgroundColor: '#2d2d30',
      border: 'none'
    }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Toggle principal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#cccccc' }}>Ativar atalhos de navegação</Text>
          <Switch
            checked={localEnabled}
            onChange={handleToggleChange}
            style={{
              backgroundColor: localEnabled ? '#007acc' : '#434343'
            }}
          />
        </div>

        <Divider style={{ margin: '0px 0', backgroundColor: '#3e3e42' }} />

        {/* Configuração das teclas modificadoras */}
        <div style={{ opacity: localEnabled ? 1 : 0.5 }}>
          <Text style={{ color: '#cccccc', fontSize: '14px' }}>
            Teclas modificadoras
          </Text>

          <div style={{ marginTop: '8px' }}>
            <Select
              value={localModifiers}
              onChange={handleModifiersChange}
              disabled={!localEnabled}
              style={{ width: '100%' }}
              styles={{
                popup: {
                  root: {
                    backgroundColor: '#383838',
                    border: '1px solid #3e3e42'
                  }
                }
              }}
            >
              {modifierOptions.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                  style={{
                    backgroundColor: '#383838',
                    color: '#cccccc'
                  }}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <Text style={{ color: '#666666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Mantenha as teclas pressionadas para ativar o modo
          </Text>
        </div>

        <Divider style={{ margin: '0px 0', backgroundColor: '#3e3e42' }} />

        {/* Lista de atalhos */}
        <div style={{ opacity: localEnabled ? 1 : 0.3 }}>
          <Text style={{ color: '#cccccc', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Atalhos disponíveis:
          </Text>

          <div style={{
            //maxHeight: '180px', overflowY: 'auto'
          }}>
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: index < shortcuts.length - 1 ? '1px solid #3e3e42' : 'none'
                }}
              >
                <Text style={{ color: '#999999', fontSize: '11px', flex: 1 }}>
                  {shortcut.action}
                </Text>
                <div style={{
                  backgroundColor: '#383838',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  //border: '1px solid #3e3e42'
                }}>
                  <Text style={{ color: '#999999', fontSize: '10px', fontFamily: 'monospace' }}>
                    {shortcut.keys}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info sobre funcionamento */}
        <div style={{
          backgroundColor: '#383838',
          padding: '8px',
          borderRadius: '4px',
          marginTop: '8px'
        }}>
          <Text style={{ color: '#999999', fontSize: '11px' }}>
            {localShowOverlay
              ? '💡 Mantenha as teclas modificadoras pressionadas para ver o overlay com os atalhos disponíveis'
              : '💡 Os atalhos continuam funcionando normalmente, só o overlay foi desativado'}
          </Text>
        </div>

        {/* Toggle do overlay de atalhos */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: localEnabled ? 1 : 0.5
        }}>
          <div>
            <Text style={{ color: '#cccccc' }}>Mostrar overlay ao usar os atalhos</Text>
            <Text style={{ color: '#666666', fontSize: '11px', display: 'block' }}>
              Desative se você já souber os atalhos de cor
            </Text>
          </div>
          <Switch
            checked={localShowOverlay}
            onChange={handleShowOverlayChange}
            disabled={!localEnabled}
            style={{
              backgroundColor: localShowOverlay ? '#007acc' : '#434343'
            }}
          />
        </div>
        
      </Space>
    </div>
  );

  const title = (
    <Space>
      <ControlOutlined style={{ color: '#007acc' }} />
      <Text style={{ color: '#cccccc' }}>Configurar Atalhos</Text>
    </Space>
  );

  return (
    <Popover
      content={content}
      title={title}
      trigger="click"
      placement="bottomRight"
      overlayStyle={{
        backgroundColor: '#2d2d30',
      }}
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

export default ShortcutsConfigPopover;
