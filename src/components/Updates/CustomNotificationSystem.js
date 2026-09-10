import React, { createContext, useContext, useState, useEffect } from 'react';
import './CustomNotifications.css';

// Context para gerenciar notificações
const NotificationContext = createContext();

// Hook para usar notificações
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

// Componente de notificação individual
const NotificationItem = ({ notification, onClose }) => {
  const { id, type, title, message, duration, actions } = notification;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'download':
        return '📥';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`custom-notification custom-notification-${type}`}>
      <div className="custom-notification-header">
        <span className="custom-notification-icon">{getIcon()}</span>
        <span className="custom-notification-title">{title}</span>
        <button 
          className="custom-notification-close"
          onClick={() => onClose(id)}
        >
          ×
        </button>
      </div>
      
      {message && (
        <div className="custom-notification-content">
          {typeof message === 'string' ? (
            <p>{message}</p>
          ) : (
            message
          )}
        </div>
      )}
      
      {actions && actions.length > 0 && (
        <div className="custom-notification-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`custom-notification-btn ${action.type || 'default'}`}
              onClick={() => {
                action.onClick?.();
                if (action.closeOnClick !== false) {
                  onClose(id);
                }
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Provider de notificações
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (config) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type: config.type || 'info',
      title: config.title || config.message || 'Notificação',
      message: config.description || config.content,
      duration: config.duration || 4500,
      actions: config.actions || []
    };

    setNotifications(prev => [...prev, notification]);
    
    //console.log('🔔 Notificação customizada criada:', notification);
    
    return id;
  };

  const closeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    //console.log('🔕 Notificação removida:', id);
  };

  // Atualiza o conteúdo de uma notificação já exibida, em vez de criar outra
  // (usado pelo progresso de download, que dispara muitas vezes por segundo)
  const updateNotification = (id, config) => {
    setNotifications(prev => prev.map(n => (
      n.id === id
        ? { ...n, message: config.description ?? config.content ?? n.message }
        : n
    )));
  };

  const closeAllNotifications = () => {
    setNotifications([]);
    //console.log('🔕 Todas as notificações removidas');
  };

  // Métodos de conveniência
  const success = (config) => showNotification({ ...config, type: 'success' });
  const error = (config) => showNotification({ ...config, type: 'error' });
  const warning = (config) => showNotification({ ...config, type: 'warning' });
  const info = (config) => showNotification({ ...config, type: 'info' });
  const download = (config) => showNotification({ ...config, type: 'download' });

  const contextValue = {
    notifications,
    showNotification,
    updateNotification,
    closeNotification,
    closeAllNotifications,
    success,
    error,
    warning,
    info,
    download
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Container de notificações */}
      <div className="custom-notifications-container">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={closeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Classe singleton para compatibilidade com código existente
export class CustomNotificationManager {
  static instance = null;
  static notificationAPI = null;

  static getInstance() {
    if (!CustomNotificationManager.instance) {
      CustomNotificationManager.instance = new CustomNotificationManager();
    }
    return CustomNotificationManager.instance;
  }

  static setNotificationAPI(api) {
    CustomNotificationManager.notificationAPI = api;
  }

  constructor() {
    this.activeNotifications = new Map();
  }

  // Método para testar notificações
  testNotification() {
    console.log('🧪 Executando teste do sistema customizado...');
    
    if (!CustomNotificationManager.notificationAPI) {
      console.error('❌ API de notificação não configurada');
      alert('Sistema de notificação não configurado. Verifique se o NotificationProvider está ativo.');
      return false;
    }

    const api = CustomNotificationManager.notificationAPI;
    
    // Teste 1: Notificação básica
    try {
      api.success({
        title: 'Teste Básico',
        description: 'Sistema de notificações customizado funcionando!',
        duration: 3000
      });
      console.log('✅ Teste 1: Notificação básica criada');
    } catch (error) {
      console.error('❌ Erro no teste 1:', error);
    }
    
    // Teste 2: Notificação com ações
    setTimeout(() => {
      try {
        api.info({
          title: 'Teste com Ações',
          description: 'Notificação com botões interativos',
          duration: 0, // Não fecha automaticamente
          actions: [
            {
              label: 'Entendi',
              type: 'primary',
              onClick: () => console.log('Botão "Entendi" clicado'),
              closeOnClick: true
            },
            {
              label: 'Cancelar',
              type: 'default',
              onClick: () => console.log('Botão "Cancelar" clicado'),
              closeOnClick: true
            }
          ]
        });
        console.log('✅ Teste 2: Notificação com ações criada');
      } catch (error) {
        console.error('❌ Erro no teste 2:', error);
      }
    }, 1000);
    
    // Teste 3: Verificar elementos no DOM
    setTimeout(() => {
      const notifications = document.querySelectorAll('.custom-notification');
      console.log('🔍 Notificações customizadas encontradas no DOM:', notifications.length);
      
      if (notifications.length > 0) {
        console.log('✅ Sistema de notificação customizado funcionando perfeitamente!');
        
        // Teste 4: Notificação de sucesso
        api.download({
          title: 'Teste de Download',
          description: 'Simulando notificação de download de atualização',
          duration: 4000
        });
      } else {
        console.warn('⚠️ Nenhuma notificação customizada encontrada!');
      }
    }, 2000);
    
    return true;
  }

  // Métodos para compatibilidade com código existente
  showCheckingNotification() {
    if (!CustomNotificationManager.notificationAPI) return null;
    
    console.log('📢 Mostrando: Verificando atualizações');
    
    const id = CustomNotificationManager.notificationAPI.info({
      title: 'Verificando Atualizações',
      description: 'Procurando por novas versões disponíveis...',
      duration: 0 // Não fecha automaticamente
    });
    
    this.activeNotifications.set('checking', id);
    return id;
  }

  showDownloadingNotification() {
    this.closeNotification('checking');
    
    if (!CustomNotificationManager.notificationAPI) return null;
    
    console.log('📢 Mostrando: Baixando atualização');
    
    const id = CustomNotificationManager.notificationAPI.download({
      title: 'Baixando Atualização',
      description: 'Download em andamento...',
      duration: 0
    });
    
    this.activeNotifications.set('downloading', id);
    return id;
  }

  showReadyToInstallNotification() {
    this.closeNotification('downloading');
    
    if (!CustomNotificationManager.notificationAPI) return null;
    
    console.log('📢 Mostrando: Pronto para instalar');
    
    const id = CustomNotificationManager.notificationAPI.success({
      title: 'Atualização Pronta',
      description: 'Nova versão baixada e pronta para instalação',
      duration: 0,
      actions: [
        {
          label: 'Instalar Agora',
          type: 'primary',
          onClick: () => {
            console.log('🔄 Reiniciando para instalar atualização...');
            // Aqui seria chamado o método para reiniciar e instalar
            if (window.electronAPI?.restartApp) {
              window.electronAPI.restartApp();
            }
          }
        },
        {
          label: 'Mais Tarde',
          type: 'default',
          closeOnClick: true
        }
      ]
    });
    
    this.activeNotifications.set('ready', id);
    return id;
  }

  showErrorNotification(error) {
    this.closeAllNotifications();
    
    if (!CustomNotificationManager.notificationAPI) return null;
    
    //console.log('📢 Mostrando erro:', error);
    
    const id = CustomNotificationManager.notificationAPI.error({
      title: 'Erro na Atualização',
      description: `Não foi possível verificar atualizações: ${error}`,
      duration: 6000,
      actions: [
        {
          label: 'Tentar Novamente',
          type: 'primary',
          onClick: () => {
            console.log('🔄 Tentando verificar atualizações novamente...');
            // Aqui seria chamado o método para tentar novamente
            if (window.electronAPI?.checkForUpdates) {
              window.electronAPI.checkForUpdates();
            }
          }
        }
      ]
    });
    
    return id;
  }

  showUpdateAvailable(version, downloadCallback) {
    this.closeNotification('checking');
    
    if (!CustomNotificationManager.notificationAPI) return null;
    
    console.log('📢 Mostrando: Atualização disponível', version);
    
    const id = CustomNotificationManager.notificationAPI.success({
      title: 'Atualização Disponível',
      description: `Nova versão ${version} está disponível para download`,
      duration: 0,
      actions: [
        {
          label: 'Baixar Agora',
          type: 'primary',
          onClick: () => {
            console.log('📥 Iniciando download da atualização...');
            downloadCallback?.();
          },
          closeOnClick: true
        },
        {
          label: 'Mais Tarde',
          type: 'default',
          closeOnClick: true
        }
      ]
    });
    
    this.activeNotifications.set('available', id);
    return id;
  }

  showDownloadProgress(progress) {
    if (!CustomNotificationManager.notificationAPI) return null;

    const progressPercent = Math.round(progress?.percent || 0);
    const transferredMB = Math.round((progress?.transferred || 0) / 1024 / 1024);
    const totalMB = Math.round((progress?.total || 0) / 1024 / 1024);
    const description = `Progresso: ${progressPercent}% (${transferredMB}MB / ${totalMB}MB)`;

    // Já existe uma notificação de download em andamento: só atualizar o
    // texto dela, em vez de empilhar uma nova a cada tick de progresso
    const existingId = this.activeNotifications.get('downloading');
    if (existingId) {
      CustomNotificationManager.notificationAPI.updateNotification(existingId, { description });
      return existingId;
    }

    this.closeNotification('available');

    const id = CustomNotificationManager.notificationAPI.download({
      title: 'Baixando Atualização',
      description,
      duration: 0
    });

    this.activeNotifications.set('downloading', id);
    return id;
  }

  showNoUpdateAvailable() {
    this.closeAllNotifications();
    
    if (!CustomNotificationManager.notificationAPI) return null;
    
    console.log('📢 Mostrando: Nenhuma atualização disponível');
    
    const id = CustomNotificationManager.notificationAPI.info({
      title: 'Nenhuma Atualização',
      description: 'Você já está usando a versão mais recente',
      duration: 4000
    });
    
    return id;
  }

  closeNotification(key) {
    if (this.activeNotifications.has(key)) {
      const id = this.activeNotifications.get(key);
      if (CustomNotificationManager.notificationAPI) {
        CustomNotificationManager.notificationAPI.closeNotification(id);
      }
      this.activeNotifications.delete(key);
    }
  }

  closeAllNotifications() {
    if (CustomNotificationManager.notificationAPI) {
      CustomNotificationManager.notificationAPI.closeAllNotifications();
    }
    this.activeNotifications.clear();
  }
}

export default CustomNotificationManager;
