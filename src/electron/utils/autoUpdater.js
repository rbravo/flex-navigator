const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const { t } = require('../i18n');

class AutoUpdaterManager {
  constructor() {
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    console.log('🔄 Configurando auto-updater...');

    try {
      // Configurar repositório GitHub para updates
      const feedConfig = {
        provider: 'github',
        owner: 'rbravo',
        repo: 'flex-navigator',
        private: false
      };
      
      console.log('📡 Configurando feed URL:', feedConfig);
      autoUpdater.setFeedURL(feedConfig);
      
      // Configurar autoUpdater
      autoUpdater.autoDownload = false; // Não baixar automaticamente
      autoUpdater.autoInstallOnAppQuit = false; // Não instalar automaticamente
      
      console.log('⚙️ AutoUpdater configurado - autoDownload:', autoUpdater.autoDownload);
      
    } catch (error) {
      console.error('❌ Erro ao configurar autoUpdater:', error);
      this.sendToRenderer('update-error', `Erro de configuração: ${error.message}`);
    }

    // Event listeners para auto-updater
    autoUpdater.on('checking-for-update', () => {
      console.log('🔍 Verificando por atualizações...');
      this.sendToRenderer('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('✅ Atualização disponível:', info);
      this.sendToRenderer('update-available', info);
      this.showUpdateAvailableDialog(info);
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('❌ Nenhuma atualização disponível:', info);
      this.sendToRenderer('update-not-available', info);
    });

    autoUpdater.on('error', (err) => {
      console.log('❌ Erro no auto-updater:', err);
      console.log('❌ Detalhes do erro:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Enviar erro mais detalhado para o renderer
      const errorMessage = err.message || 'Erro desconhecido no auto-updater';
      this.sendToRenderer('update-error', errorMessage);
      
      // Mostrar diálogo apenas se não for erro de rede comum
      if (!err.message.includes('net::')) {
        this.showErrorDialog(err);
      }
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Velocidade de download: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Baixado ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      console.log(log_message);
      this.sendToRenderer('update-download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('✅ Atualização baixada:', info);
      this.sendToRenderer('update-downloaded', info);
      this.showUpdateDownloadedDialog(info);
    });
  }

  sendToRenderer(channel, data = null) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      if (window && window.webContents) {
        window.webContents.send(channel, data);
      }
    });
  }

  async showUpdateAvailableDialog(info) {
    // Verificar se o auto-download está habilitado
    const { isAutoDownloadEnabled } = require('../../utils/userSettings');
    
    const result = await dialog.showMessageBox({
      type: 'info',
      title: t('updates.dialog.availableTitle'),
      message: t('updates.dialog.availableMessage', { version: info.version }),
      detail: t('updates.dialog.availableDetail', {
        currentVersion: require('../../../package.json').version,
        newVersion: info.version
      }),
      buttons: [t('updates.dialog.downloadNow'), t('updates.dialog.downloadLater')],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  }

  async showUpdateDownloadedDialog(info) {
    const result = await dialog.showMessageBox({
      type: 'info',
      title: t('updates.dialog.downloadedTitle'),
      message: t('updates.dialog.downloadedMessage'),
      detail: t('updates.dialog.downloadedDetail', { version: info.version }),
      buttons: [t('updates.dialog.restartNow'), t('updates.dialog.restartLater')],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  }

  showErrorDialog(error) {
    const errorMsg = t('updates.dialog.errorMessage', {
      message: error.message,
      stack: error.stack || t('updates.dialog.errorUnavailable')
    });
    dialog.showErrorBox(t('updates.dialog.errorTitle'), errorMsg);
  }

  async checkForUpdates() {
    console.log('🔄 Verificando por atualizações manualmente...');
    try {
      console.log('📡 Iniciando verificação manual...');
      const result = await autoUpdater.checkForUpdatesAndNotify();
      console.log('✅ Verificação manual concluída:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro na verificação manual:', error);
      this.sendToRenderer('update-error', `Erro na verificação: ${error.message}`);
      throw error;
    }
  }

  async checkForUpdatesAndNotify() {
    console.log('🔄 Verificando por atualizações automaticamente...');
    try {
      console.log('📡 Iniciando verificação automática...');
      const result = await autoUpdater.checkForUpdatesAndNotify();
      console.log('✅ Verificação automática concluída:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro na verificação automática:', error);
      this.sendToRenderer('update-error', `Erro na verificação: ${error.message}`);
      // Não lançar erro para verificação automática
      return null;
    }
  }
}

module.exports = { AutoUpdaterManager };
