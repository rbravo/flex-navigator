import React, { useState, useEffect } from 'react';
import { Switch, Select, Space, Typography, Divider } from 'antd';

const { Text } = Typography;
const { Option } = Select;

/**
 * Conteúdo de configuração de atalhos de navegação - vive dentro do menu
 * unificado da barra de URL (ver ControlsBar.js), não é mais um Popover
 * próprio.
 */
const ShortcutsSettings = ({
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

  return (
    <div style={{ width: '320px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Toggle principal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'var(--nav-text)' }}>Ativar atalhos de navegação</Text>
          <Switch
            checked={localEnabled}
            onChange={handleToggleChange}
            style={{
              backgroundColor: localEnabled ? '#007acc' : '#434343'
            }}
          />
        </div>

        <Divider style={{ margin: '0px 0', backgroundColor: 'var(--nav-border)' }} />

        {/* Configuração das teclas modificadoras */}
        <div style={{ opacity: localEnabled ? 1 : 0.5 }}>
          <Text style={{ color: 'var(--nav-text)', fontSize: '14px' }}>
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
                    backgroundColor: 'var(--nav-hover)',
                    border: '1px solid var(--nav-border)'
                  }
                }
              }}
            >
              {modifierOptions.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                  style={{
                    backgroundColor: 'var(--nav-hover)',
                    color: 'var(--nav-text)'
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

        <Divider style={{ margin: '0px 0', backgroundColor: 'var(--nav-border)' }} />

        {/* Lista de atalhos */}
        <div style={{ opacity: localEnabled ? 1 : 0.3 }}>
          <Text style={{ color: 'var(--nav-text)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Atalhos disponíveis:
          </Text>

          <div>
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: index < shortcuts.length - 1 ? '1px solid var(--nav-border)' : 'none'
                }}
              >
                <Text style={{ color: '#999999', fontSize: '11px', flex: 1 }}>
                  {shortcut.action}
                </Text>
                <div style={{
                  backgroundColor: 'var(--nav-hover)',
                  padding: '2px 6px',
                  borderRadius: '3px'
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
          backgroundColor: 'var(--nav-hover)',
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
            <Text style={{ color: 'var(--nav-text)' }}>Mostrar overlay ao usar os atalhos</Text>
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
};

export default ShortcutsSettings;
