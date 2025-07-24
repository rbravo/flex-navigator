import { useEffect, useRef } from 'react';
import { useAutoUpdater } from '../../hooks/useAutoUpdater';
import CustomNotificationManager from './CustomNotificationSystem';

export const UpdateManager = () => {
  const { 
    updateInfo, 
    downloadUpdate, 
    installUpdate 
  } = useAutoUpdater();
  
  // Refs para rastrear estados anteriores e evitar notificações duplicadas
  const lastStateRef = useRef({});
  const hasShownNoUpdateRef = useRef(false);

  useEffect(() => {
    console.log('🎨 UpdateManager: Estado atual:', updateInfo);
    
    const manager = CustomNotificationManager.getInstance();
    const lastState = lastStateRef.current;
    
    // Só agir se o estado realmente mudou
    const hasStateChanged = (
      lastState.checking !== updateInfo.checking ||
      lastState.available !== updateInfo.available ||
      lastState.downloaded !== updateInfo.downloaded ||
      lastState.error !== updateInfo.error ||
      lastState.progress !== updateInfo.progress
    );
    
    // Gerenciar notificações baseado no estado do update
    if (updateInfo.checking && !lastState.checking) {
      console.log('🎨 UpdateManager: Iniciando verificação');
      manager.showCheckingNotification();
      hasShownNoUpdateRef.current = false;
    } else if (updateInfo.available && !updateInfo.downloaded && !lastState.available) {
      console.log('🎨 UpdateManager: Atualização disponível');
      manager.showUpdateAvailable(updateInfo.version, downloadUpdate);
      hasShownNoUpdateRef.current = false;
    } else if (updateInfo.progress && updateInfo.progress !== lastState.progress) {
      console.log('🎨 UpdateManager: Progresso do download');
      manager.showDownloadProgress(updateInfo.progress);
    } else if (updateInfo.downloaded && !lastState.downloaded) {
      console.log('🎨 UpdateManager: Download concluído');
      manager.showReadyToInstallNotification();
    } else if (updateInfo.error && updateInfo.error !== lastState.error) {
      console.log('🎨 UpdateManager: Erro na atualização');
      manager.showErrorNotification(updateInfo.error);
      hasShownNoUpdateRef.current = false;
    } else if (
      // Mostrar "nenhuma atualização" quando:
      // 1. Parou de verificar (checking mudou de true para false)
      // 2. Não há atualização disponível
      // 3. Não há erro
      // 4. Ainda não mostrou essa notificação
      lastState.checking === true && 
      updateInfo.checking === false && 
      !updateInfo.available && 
      !updateInfo.error && 
      !hasShownNoUpdateRef.current
    ) {
      console.log('🎨 UpdateManager: Nenhuma atualização disponível (verificação concluída)');
      manager.showNoUpdateAvailable();
      hasShownNoUpdateRef.current = true;
    }
    
    // Atualizar estado anterior
    lastStateRef.current = {
      checking: updateInfo.checking,
      available: updateInfo.available,
      downloaded: updateInfo.downloaded,
      error: updateInfo.error,
      progress: updateInfo.progress
    };
  }, [updateInfo, downloadUpdate, installUpdate]);

  // Este componente não renderiza nada visualmente
  // Ele apenas gerencia as notificações de update
  return null;
};

export default UpdateManager;
