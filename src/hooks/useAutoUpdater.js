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

  const [ipcRenderer, setIpcRenderer] = useState(null);

  useEffect(() => {
    // Verificar se estamos no ambiente Electron
    if (window.require) {
      try {
        const { ipcRenderer: electronIpc } = window.require('electron');
        setIpcRenderer(electronIpc);
      } catch (error) {
        console.error('Erro ao acessar ipcRenderer:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!ipcRenderer) return;

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
    ipcRenderer.on('update-checking', handleUpdateChecking);
    ipcRenderer.on('update-available', handleUpdateAvailable);
    ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
    ipcRenderer.on('update-error', handleUpdateError);
    ipcRenderer.on('update-download-progress', handleDownloadProgress);
    ipcRenderer.on('update-downloaded', handleUpdateDownloaded);

    // Cleanup
    return () => {
      ipcRenderer.removeListener('update-checking', handleUpdateChecking);
      ipcRenderer.removeListener('update-available', handleUpdateAvailable);
      ipcRenderer.removeListener('update-not-available', handleUpdateNotAvailable);
      ipcRenderer.removeListener('update-error', handleUpdateError);
      ipcRenderer.removeListener('update-download-progress', handleDownloadProgress);
      ipcRenderer.removeListener('update-downloaded', handleUpdateDownloaded);
    };
  }, [ipcRenderer]);

  const checkForUpdates = async () => {
    if (!ipcRenderer) {
      console.error('ipcRenderer não disponível');
      return;
    }
    
    try {
      console.log('🎯 React: Solicitando verificação de updates...');
      const response = await ipcRenderer.invoke('check-for-updates');
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
    if (!ipcRenderer) return;
    ipcRenderer.send('download-update');
  };

  const installUpdate = () => {
    if (!ipcRenderer) return;
    ipcRenderer.send('install-update');
  };

  const getAppVersion = async () => {
    if (!ipcRenderer) return null;
    try {
      return await ipcRenderer.invoke('get-app-version');
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
