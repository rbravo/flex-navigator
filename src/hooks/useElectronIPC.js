import { useEffect } from 'react';
import { addNewTabToFirstTabset } from '../utils/layoutActions';

/**
 * Hook customizado para gerenciar eventos do Electron IPC
 */
const useElectronIPC = (model) => {
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');

        // Listener para abrir link em nova aba (vindo do context menu)
        const handleAddNewTab = (event, data) => {
          console.log('Recebido evento para adicionar nova aba:', data);
          addNewTabToFirstTabset(model, data);
        };

        // Listener para comandos do context menu
        const handleOpenInNewTab = (event, url) => {
          handleAddNewTab(event, { url });
        };

        // Registrar listeners
        ipcRenderer.on('add-new-tab', handleAddNewTab);
        ipcRenderer.on('open-in-new-tab', handleOpenInNewTab);

        // Cleanup ao desmontar o componente
        return () => {
          ipcRenderer.removeListener('add-new-tab', handleAddNewTab);
          ipcRenderer.removeListener('open-in-new-tab', handleOpenInNewTab);
        };
      } catch (error) {
        console.log('Erro ao configurar IPC listeners:', error);
      }
    }
  }, [model]);
};

export default useElectronIPC;
