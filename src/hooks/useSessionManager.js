import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar sessões do FlexLayout
 */
const useSessionManager = (model, loadConfiguration) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se está no Electron
  const isElectron = window.require !== undefined;

  // Carregar sessões do armazenamento
  const loadSessions = useCallback(async () => {
    if (!isElectron) return;
    
    setIsLoading(true);
    try {
      const electron = window.require('electron');
      const result = await electron.ipcRenderer.invoke('load-sessions');
      
      if (result.success) {
        console.log('✅ Sessões carregadas:', result.sessions.length);
        setSessions(result.sessions);
      } else {
        console.error('❌ Erro ao carregar sessões:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sessões:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isElectron]);

  // Salvar sessão atual
  const saveSession = useCallback(async (sessionName) => {
    if (!isElectron || !model) return;
    
    console.log('💾 Salvando sessão:', sessionName);
    try {
      const layoutConfig = model.toJson();
      const electron = window.require('electron');
      const result = await electron.ipcRenderer.invoke('save-session', {
        sessionName,
        layoutConfig
      });
      
      if (result.success) {
        console.log('✅ Sessão salva com sucesso:', result.session);
        await loadSessions(); // Recarregar lista de sessões
        
        // Atualizar menu da aplicação
        electron.ipcRenderer.send('update-sessions-menu');
        
        return { success: true, session: result.session };
      } else {
        console.error('❌ Erro ao salvar sessão:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      return { success: false, error: error.message };
    }
  }, [isElectron, model, loadSessions]);

  // Carregar sessão específica
  const loadSession = useCallback(async (sessionId, replaceCurrentLayout = true) => {
    if (!isElectron || !model || !loadConfiguration) return;
    
    try {
      const electron = window.require('electron');
      const result = await electron.ipcRenderer.invoke('load-session', sessionId);
      
      if (result.success && result.session) {
        if (replaceCurrentLayout) {
          // Usar a função loadConfiguration do hook
          const success = loadConfiguration(result.session.config);
          
          if (!success) {
            return { success: false, error: 'Erro ao aplicar configuração da sessão' };
          }
        }
        
        return { success: true, session: result.session };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      return { success: false, error: error.message };
    }
  }, [isElectron, model, loadConfiguration]);

  // Deletar sessão
  const deleteSession = useCallback(async (sessionId) => {
    if (!isElectron) return;
    
    try {
      const electron = window.require('electron');
      const result = await electron.ipcRenderer.invoke('delete-session', sessionId);
      
      if (result.success) {
        await loadSessions(); // Recarregar lista de sessões
        
        // Atualizar menu da aplicação
        electron.ipcRenderer.send('update-sessions-menu');
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      return { success: false, error: error.message };
    }
  }, [isElectron, loadSessions]);

  // Configurar listeners do IPC
  useEffect(() => {
    if (!isElectron) return;
    
    const electron = window.require('electron');
    
    // Listener para carregar sessão na janela atual
    const handleLoadSessionInCurrentWindow = async (event, sessionId) => {
      await loadSession(sessionId, true);
    };
    
    // Listener para mostrar dialog de salvar sessão
    const handleShowSaveSessionDialog = () => {
      // Este evento será capturado pelo componente que gerencia o modal
      window.dispatchEvent(new CustomEvent('show-save-session-dialog'));
    };
    
    // Listener para confirmar deleção de sessão
    const handleConfirmDeleteSession = (event, sessionId, sessionName) => {
      // Este evento será capturado pelo componente que gerencia o modal
      window.dispatchEvent(new CustomEvent('confirm-delete-session', {
        detail: { sessionId, sessionName }
      }));
    };
    
    // Listener para carregar configuração de sessão em nova janela
    const handleLoadSessionConfig = async (event, layoutConfig) => {
      if (loadConfiguration && layoutConfig) {
        try {
          loadConfiguration(layoutConfig);
        } catch (error) {
          console.error('Erro ao carregar configuração de sessão:', error);
        }
      }
    };
    
    electron.ipcRenderer.on('load-session-in-current-window', handleLoadSessionInCurrentWindow);
    electron.ipcRenderer.on('show-save-session-dialog', handleShowSaveSessionDialog);
    electron.ipcRenderer.on('confirm-delete-session', handleConfirmDeleteSession);
    electron.ipcRenderer.on('load-session-config', handleLoadSessionConfig);
    
    // Cleanup
    return () => {
      electron.ipcRenderer.removeListener('load-session-in-current-window', handleLoadSessionInCurrentWindow);
      electron.ipcRenderer.removeListener('show-save-session-dialog', handleShowSaveSessionDialog);
      electron.ipcRenderer.removeListener('confirm-delete-session', handleConfirmDeleteSession);
      electron.ipcRenderer.removeListener('load-session-config', handleLoadSessionConfig);
    };
  }, [isElectron, loadSession, model, loadConfiguration]);

  // Carregar sessões na inicialização
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    isLoading,
    saveSession,
    loadSession,
    deleteSession,
    loadSessions
  };
};

export default useSessionManager;
