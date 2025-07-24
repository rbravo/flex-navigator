import React from 'react';
import { notification, Progress, Button, Space } from 'antd';
import { DownloadOutlined, ReloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './UpdateNotifications.css';

export class UpdateNotificationManager {
  static instance = null;

  static getInstance() {
    if (!UpdateNotificationManager.instance) {
      UpdateNotificationManager.instance = new UpdateNotificationManager();
    }
    return UpdateNotificationManager.instance;
  }

  constructor() {
    this.activeNotifications = new Map();
    this.configureNotifications();
  }

  configureNotifications() {
    // Configurar notificações globalmente
    notification.config({
      placement: 'topRight',
      duration: 4.5,
      getContainer: () => document.body,
      top: 24,
      rtl: false,
    });
    
    // Adicionar estilos CSS para garantir que as notificações apareçam por cima
    const style = document.createElement('style');
    style.textContent = `
      .ant-notification {
        z-index: 99999 !important;
        position: fixed !important;
      }
      .ant-notification-notice {
        z-index: 99999 !important;
        box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('📢 Sistema de notificações configurado com z-index alto');
  }

  // Método para testar notificações manualmente
  testNotification() {
    console.log('🧪 Executando teste de notificação...');
    
    // Teste 1: Notificação básica
    try {
      notification.success({
        message: 'Teste de Notificação',
        description: 'Sistema de notificações funcionando corretamente!',
        duration: 3,
      });
      console.log('✅ Teste 1: Notificação básica criada');
    } catch (error) {
      console.error('❌ Erro no teste 1:', error);
    }
    
    // Teste 2: Notificação com configurações completas
    setTimeout(() => {
      try {
        notification.info({
          key: 'test-complete',
          message: 'Teste Completo',
          description: 'Notificação com todas as configurações aplicadas',
          duration: 4,
          placement: 'topRight',
          style: {
            zIndex: 99999,
            position: 'fixed'
          },
          className: 'test-notification'
        });
        console.log('✅ Teste 2: Notificação completa criada');
      } catch (error) {
        console.error('❌ Erro no teste 2:', error);
      }
    }, 1000);
    
    // Teste 3: Verificar elementos no DOM
    setTimeout(() => {
      const notifications = document.querySelectorAll('.ant-notification-notice');
      console.log('🔍 Notificações encontradas no DOM:', notifications.length);
      
      notifications.forEach((notification, index) => {
        const styles = window.getComputedStyle(notification);
        console.log(`📊 Notificação ${index}:`, {
          zIndex: styles.zIndex,
          position: styles.position,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          top: styles.top,
          right: styles.right
        });
      });
      
      if (notifications.length === 0) {
        console.warn('⚠️ Nenhuma notificação encontrada no DOM!');
        // Fallback: mostrar alert
        alert('Teste de notificação: As notificações não estão aparecendo no DOM. Verifique o console para mais detalhes.');
      }
    }, 2000);
    
    return true;
  }

  showCheckingNotification() {
    this.closeNotification('checking');
    
    console.log('📢 Tentando mostrar notificação: Verificando atualizações');
    
    try {
      notification.info({
        key: 'checking',
        message: 'Verificando Atualizações',
        description: 'Procurando por novas versões...',
        icon: <ReloadOutlined spin />,
        duration: 3,
        placement: 'topRight'
      });

      this.activeNotifications.set('checking', true);
      console.log('✅ Notificação de verificação criada');
    } catch (error) {
      console.error('❌ Erro ao criar notificação de verificação:', error);
    }
  }

  showUpdateAvailable(version, onDownload) {
    this.closeNotification('checking');
    this.closeNotification('available');

    notification.info({
      key: 'available',
      message: 'Atualização Disponível',
      description: (
        <div>
          <p>Nova versão {version} disponível!</p>
          <Space>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={onDownload}
              size="small"
            >
              Baixar
            </Button>
          </Space>
        </div>
      ),
      duration: 0,
      icon: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
    });

    this.activeNotifications.set('available', true);
  }

  showDownloadProgress(progress) {
    this.closeNotification('available');
    
    const percent = Math.round(progress.percent);
    
    notification.open({
      key: 'progress',
      message: 'Baixando Atualização',
      description: (
        <div>
          <Progress 
            percent={percent} 
            size="small" 
            status="active"
          />
          <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
            {this.formatBytes(progress.transferred)} / {this.formatBytes(progress.total)}
          </div>
        </div>
      ),
      duration: 0,
      icon: <DownloadOutlined />
    });

    this.activeNotifications.set('progress', true);
  }

  showUpdateDownloaded(version, onInstall) {
    this.closeNotification('progress');
    this.closeNotification('downloaded');

    notification.success({
      key: 'downloaded',
      message: 'Atualização Baixada',
      description: (
        <div>
          <p>Versão {version} pronta para instalar!</p>
          <Space>
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={onInstall}
              size="small"
            >
              Instalar e Reiniciar
            </Button>
          </Space>
        </div>
      ),
      duration: 0,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    });

    this.activeNotifications.set('downloaded', true);
  }

  showUpdateNotAvailable() {
    this.closeNotification('checking');
    
    console.log('📢 Tentando mostrar notificação: Nenhuma atualização disponível');
    
    // Verificar se o container existe e está visível
    const container = document.body;
    console.log('📦 Container para notificações:', container, 'Visível:', container.style.display !== 'none');
    
    try {
      const notificationConfig = {
        key: 'not-available',
        message: 'Nenhuma Atualização',
        description: 'Você já está usando a versão mais recente.',
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        placement: 'topRight',
        style: {
          zIndex: 99999,
          position: 'fixed'
        }
      };
      
      console.log('📋 Configuração da notificação:', notificationConfig);
      
      notification.info(notificationConfig);
      
      console.log('✅ Notificação criada com sucesso');
      
      // Verificar se a notificação apareceu no DOM
      setTimeout(() => {
        const notificationElements = document.querySelectorAll('.ant-notification-notice');
        console.log('🔍 Notificações no DOM:', notificationElements.length, notificationElements);
        
        notificationElements.forEach((el, index) => {
          const styles = window.getComputedStyle(el);
          console.log(`📊 Notificação ${index} - z-index: ${styles.zIndex}, position: ${styles.position}, display: ${styles.display}`);
        });
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      // Fallback: usar alert como último recurso
      alert('Nenhuma atualização disponível. Você já está usando a versão mais recente.');
    }
  }

  showUpdateError(error) {
    this.closeAllNotifications();
    
    console.log('📢 Tentando mostrar notificação de erro:', error);
    
    try {
      notification.error({
        key: 'error',
        message: 'Erro na Atualização',
        description: `Falha ao verificar atualizações: ${error}`,
        duration: 5,
        icon: <ExclamationCircleOutlined />,
        placement: 'topRight'
      });
      
      console.log('✅ Notificação de erro criada');
    } catch (notificationError) {
      console.error('❌ Erro ao criar notificação de erro:', notificationError);
      // Fallback: usar alert
      alert(`Erro na atualização: ${error}`);
    }
  }

  closeNotification(key) {
    if (this.activeNotifications.has(key)) {
      notification.destroy(key);
      this.activeNotifications.delete(key);
    }
  }

  closeAllNotifications() {
    this.activeNotifications.forEach((_, key) => {
      notification.destroy(key);
    });
    this.activeNotifications.clear();
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

export const updateNotificationManager = UpdateNotificationManager.getInstance();
