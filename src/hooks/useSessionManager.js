import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar sessões do FlexLayout
 */
const useSessionManager = (model, loadConfiguration) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se está no Electron
  const isElectron = typeof window.electronAPI !== 'undefined';

  // Carregar sessões do armazenamento
  const loadSessions = useCallback(async () => {
    if (!isElectron) return;

    setIsLoading(true);
    try {
      const result = await window.electronAPI.loadSessions();

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

      // Função para adicionar índices originais às tabs se não existirem
      const addOriginalIndexes = (node) => {
        if (node.type === 'tabset' && node.children) {
          node.children.forEach((tab, index) => {
            if (!tab.config) tab.config = {};
            if (tab.config.originalIndex === undefined) {
              tab.config.originalIndex = index;
            }
          });
        }

        if (node.children) {
          node.children.forEach(child => addOriginalIndexes(child));
        }
      };

      // Criar cópia e adicionar índices
      const configToSave = JSON.parse(JSON.stringify(layoutConfig));
      addOriginalIndexes(configToSave.layout);

      const result = await window.electronAPI.saveSession(sessionName, configToSave);

      if (result.success) {
        console.log('✅ Sessão salva com sucesso:', result.session);
        await loadSessions(); // Recarregar lista de sessões

        // Atualizar menu da aplicação
        window.electronAPI.updateSessionsMenu();

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
      const result = await window.electronAPI.loadSession(sessionId);

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
      const result = await window.electronAPI.deleteSession(sessionId);

      if (result.success) {
        await loadSessions(); // Recarregar lista de sessões

        // Atualizar menu da aplicação
        window.electronAPI.updateSessionsMenu();

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

    // Listener para carregar sessão na janela atual
    const handleLoadSessionInCurrentWindow = async (sessionId) => {
      await loadSession(sessionId, true);
    };

    // Listener para mostrar dialog de salvar sessão
    const handleShowSaveSessionDialog = () => {
      // Este evento será capturado pelo componente que gerencia o modal
      window.dispatchEvent(new CustomEvent('show-save-session-dialog'));
    };

    // Listener para confirmar deleção de sessão
    const handleConfirmDeleteSession = (sessionId, sessionName) => {
      // Este evento será capturado pelo componente que gerencia o modal
      window.dispatchEvent(new CustomEvent('confirm-delete-session', {
        detail: { sessionId, sessionName }
      }));
    };

    // Listener para carregar configuração de sessão em nova janela
    const handleLoadSessionConfig = async (layoutConfig) => {
      if (loadConfiguration && layoutConfig) {
        try {
          loadConfiguration(layoutConfig);
        } catch (error) {
          console.error('Erro ao carregar configuração de sessão:', error);
        }
      }
    };

    const unsubscribers = [
      window.electronAPI.onLoadSessionInCurrentWindow(handleLoadSessionInCurrentWindow),
      window.electronAPI.onShowSaveSessionDialog(handleShowSaveSessionDialog),
      window.electronAPI.onConfirmDeleteSession(handleConfirmDeleteSession),
      window.electronAPI.onLoadSessionConfig(handleLoadSessionConfig)
    ];

    // Cleanup
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
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
