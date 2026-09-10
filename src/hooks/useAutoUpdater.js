import { useState, useEffect } from 'react';

export const useAutoUpdater = () => {
  const [updateInfo, setUpdateInfo] = useState({
    checking: false,
    available: false,
    downloaded: false,
    error: null,
    progress: null,
    version: null,
    isManualCheck: false
  });

  const api = typeof window.electronAPI !== 'undefined' ? window.electronAPI : null;

  useEffect(() => {
    if (!api) return;

    // Listeners para eventos do auto-updater
    const handleUpdateChecking = () => {
      setUpdateInfo(prev => ({
        ...prev,
        checking: true,
        error: null,
        isManualCheck: true // Assumir que verificações são manuais
      }));
    };

    const handleUpdateAvailable = (info) => {
      setUpdateInfo(prev => ({
        ...prev,
        checking: false,
        available: true,
        version: info.version,
        // Resetar isManualCheck após processar
        isManualCheck: false
      }));
    };

    const handleUpdateNotAvailable = () => {
      setUpdateInfo(prev => ({
        ...prev,
        checking: false,
        available: false,
        // Resetar isManualCheck após processar
        isManualCheck: false
      }));
    };

    const handleUpdateError = (error) => {
      setUpdateInfo(prev => ({
        ...prev,
        checking: false,
        error: error,
        // Resetar isManualCheck após processar
        isManualCheck: false
      }));
    };

    const handleDownloadProgress = (progress) => {
      setUpdateInfo(prev => ({
        ...prev,
        progress: progress
      }));
    };

    const handleUpdateDownloaded = (info) => {
      setUpdateInfo(prev => ({
        ...prev,
        downloaded: true,
        progress: null,
        version: info.version
      }));
    };

    // Registrar listeners
    const unsubscribers = [
      api.onUpdateChecking(handleUpdateChecking),
      api.onUpdateAvailable(handleUpdateAvailable),
      api.onUpdateNotAvailable(handleUpdateNotAvailable),
      api.onUpdateError(handleUpdateError),
      api.onUpdateDownloadProgress(handleDownloadProgress),
      api.onUpdateDownloaded(handleUpdateDownloaded)
    ];

    // Cleanup
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [api]);

  const checkForUpdates = async () => {
    if (!api) {
      console.error('electronAPI não disponível');
      return;
    }

    try {
      console.log('🎯 React: Solicitando verificação de updates...');
      const response = await api.checkForUpdates();
      console.log('🎯 React: Resposta recebida:', response);

      if (!response.success) {
        console.error('🎯 React: Erro na verificação:', response.error);
        setUpdateInfo(prev => ({
          ...prev,
          checking: false,
          error: response.error
        }));
      }

      return response;
    } catch (error) {
      console.error('🎯 React: Erro ao verificar atualizações:', error);
      setUpdateInfo(prev => ({
        ...prev,
        checking: false,
        error: error.message
      }));
    }
  };

  const downloadUpdate = () => {
    if (!api) return;
    api.downloadUpdate();
  };

  const installUpdate = () => {
    if (!api) return;
    api.installUpdate();
  };

  const getAppVersion = async () => {
    if (!api) return null;
    try {
      return await api.getAppVersion();
    } catch (error) {
      console.error('Erro ao obter versão:', error);
      return null;
    }
  };

  return {
    updateInfo,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    getAppVersion
  };
};
