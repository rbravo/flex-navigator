const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');

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
      title: 'Atualização Disponível',
      message: `Uma nova versão (${info.version}) está disponível!`,
      detail: `Versão atual: ${require('../../../package.json').version}\nNova versão: ${info.version}\n\nDeseja baixar e instalar automaticamente?`,
      buttons: ['Sim, baixar agora', 'Não, talvez depois'],
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
      title: 'Atualização Baixada',
      message: 'A atualização foi baixada com sucesso!',
      detail: `A nova versão (${info.version}) foi baixada e está pronta para ser instalada.\n\nO aplicativo será reiniciado para aplicar a atualização.`,
      buttons: ['Reiniciar Agora', 'Reiniciar Depois'],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  }

  showErrorDialog(error) {
    const errorMsg = `Ocorreu um erro ao verificar atualizações:\n\n${error.message}\n\nDetalhes técnicos:\n${error.stack || 'Não disponível'}`;
    dialog.showErrorBox('Erro na Atualização', errorMsg);
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
