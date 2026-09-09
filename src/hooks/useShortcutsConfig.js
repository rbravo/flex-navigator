import { useState, useEffect, useCallback } from 'react';
import { layoutEventEmitter, LAYOUT_EVENTS } from '../utils/layoutEventEmitter';

const STORAGE_KEY = 'shortcuts-config';

/**
 * Hook para gerenciar configurações de shortcuts de navegação.
 *
 * É usado tanto pelo popover de configuração (um por painel) quanto pelo
 * usePanelNavigation (uma única instância global). Como cada chamada do hook
 * tem seu próprio estado React, as mudanças são propagadas entre instâncias
 * via layoutEventEmitter, para que alterar o atalho em um painel reflita
 * imediatamente no comportamento global e nos demais popovers.
 */
const useShortcutsConfig = () => {
  const [isShortcutsEnabled, setIsShortcutsEnabled] = useState(true);
  const [shortcutModifiers, setShortcutModifiers] = useState('Ctrl+Shift');

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setIsShortcutsEnabled(config.enabled ?? true);
        setShortcutModifiers(config.modifiers ?? 'Ctrl+Shift');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de shortcuts:', error);
    }
  }, []);

  // Manter esta instância em sincronia com mudanças feitas em outra
  useEffect(() => {
    const handleConfigChanged = (config) => {
      setIsShortcutsEnabled(config.enabled);
      setShortcutModifiers(config.modifiers);
    };

    layoutEventEmitter.on(LAYOUT_EVENTS.SHORTCUTS_CONFIG_CHANGED, handleConfigChanged);
    return () => {
      layoutEventEmitter.off(LAYOUT_EVENTS.SHORTCUTS_CONFIG_CHANGED, handleConfigChanged);
    };
  }, []);

  // Salvar configurações no localStorage e notificar outras instâncias do hook
  const saveConfig = useCallback((enabled, modifiers) => {
    try {
      const config = { enabled, modifiers, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      layoutEventEmitter.emit(LAYOUT_EVENTS.SHORTCUTS_CONFIG_CHANGED, config);
    } catch (error) {
      console.error('Erro ao salvar configurações de shortcuts:', error);
    }
  }, []);

  const toggleShortcuts = useCallback((enabled) => {
    setIsShortcutsEnabled(enabled);
    saveConfig(enabled, shortcutModifiers);
  }, [shortcutModifiers, saveConfig]);

  const updateModifiers = useCallback((modifiers) => {
    setShortcutModifiers(modifiers);
    saveConfig(isShortcutsEnabled, modifiers);
  }, [isShortcutsEnabled, saveConfig]);

  return {
    isShortcutsEnabled,
    shortcutModifiers,
    toggleShortcuts,
    updateModifiers
  };
};

export default useShortcutsConfig;
