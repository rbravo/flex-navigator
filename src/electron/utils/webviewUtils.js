/**
 * Função para executar comandos na webview ativa
 */
function executeOnActiveWebview(mainWindow, command) {
  if (!mainWindow || !mainWindow.webContents) {
    console.log('Janela principal não disponível');
    return;
  }

  // Execute script to find active webview and run command
  mainWindow.webContents.executeJavaScript(`
    (function() {
      // Find all webviews
      const webviews = document.querySelectorAll('webview');
      let activeWebview = null;

      // Strategy 1: Find webview in active/focused tab
      const activeTab = document.querySelector('.flexlayout__tab_button--selected');
      if (activeTab) {
        const tabContent = activeTab.closest('.flexlayout__tabset').querySelector('.flexlayout__tab');
        if (tabContent) {
          activeWebview = tabContent.querySelector('webview');
        }
      }

      // Strategy 2: Find focused webview
      if (!activeWebview) {
        for (let webview of webviews) {
          if (document.activeElement === webview || webview.contains(document.activeElement)) {
            activeWebview = webview;
            break;
          }
        }
      }

      // Strategy 3: Find visible webview with largest area
      if (!activeWebview) {
        let largestArea = 0;
        for (let webview of webviews) {
          const rect = webview.getBoundingClientRect();
          const area = rect.width * rect.height;
          if (area > largestArea && rect.width > 0 && rect.height > 0) {
            largestArea = area;
            activeWebview = webview;
          }
        }
      }

      if (activeWebview) {
        console.log('Executando comando na webview ativa:', '${command}');
        console.log('URL da webview:', activeWebview.src);
        
        try {
          // Simple eval for webview commands
          const result = eval('activeWebview.' + '${command}');
          console.log('Comando executado com sucesso');
          return { success: true, url: activeWebview.src, command: '${command}' };
        } catch (error) {
          console.error('Erro ao executar comando na webview:', error);
          return { success: false, error: error.message };
        }
      } else {
        console.log('Nenhuma webview ativa encontrada para executar: ${command}');
        return { success: false, error: 'Nenhuma webview ativa encontrada' };
      }
    })();
  `).then(result => {
    if (result && result.success) {
      console.log('✅ Comando executado na webview:', result.command);
    } else {
      console.log('❌ Falha ao executar comando:', result ? result.error : 'Resultado indefinido');
    }
  }).catch(error => {
    console.error('Erro ao executar script na webview ativa:', error);
  });
}

/**
 * Função para executar comandos de zoom na webview ativa
 */
function executeZoomCommand(mainWindow, action) {
  if (!mainWindow || !mainWindow.webContents) {
    console.log('Janela principal não disponível');
    return;
  }

  // Execute script to find active webview and handle zoom
  mainWindow.webContents.executeJavaScript(`
    (function() {
      // Find all webviews
      const webviews = document.querySelectorAll('webview');
      let activeWebview = null;

      // Strategy 1: Find webview in active/focused tab
      const activeTab = document.querySelector('.flexlayout__tab_button--selected');
      if (activeTab) {
        const tabContent = activeTab.closest('.flexlayout__tabset').querySelector('.flexlayout__tab');
        if (tabContent) {
          activeWebview = tabContent.querySelector('webview');
        }
      }

      // Strategy 2: Find focused webview
      if (!activeWebview) {
        for (let webview of webviews) {
          if (document.activeElement === webview || webview.contains(document.activeElement)) {
            activeWebview = webview;
            break;
          }
        }
      }

      // Strategy 3: Find visible webview with largest area
      if (!activeWebview) {
        let largestArea = 0;
        for (let webview of webviews) {
          const rect = webview.getBoundingClientRect();
          const area = rect.width * rect.height;
          if (area > largestArea && rect.width > 0 && rect.height > 0) {
            largestArea = area;
            activeWebview = webview;
          }
        }
      }

      if (activeWebview) {
        console.log('Aplicando zoom na webview ativa:', activeWebview.src);
        
        try {
          // Use a simple zoom approach with stored zoom levels
          if (!activeWebview._currentZoom) {
            activeWebview._currentZoom = 1.0; // Default zoom
          }

          // Handle different zoom actions
          if ('${action}' === 'increase') {
            activeWebview._currentZoom = Math.min(5.0, activeWebview._currentZoom * 1.2); // Max 500%
            activeWebview.setZoomFactor(activeWebview._currentZoom);
            console.log('Zoom aumentado para:', (activeWebview._currentZoom * 100).toFixed(0) + '%');
          } else if ('${action}' === 'decrease') {
            activeWebview._currentZoom = Math.max(0.25, activeWebview._currentZoom / 1.2); // Min 25%
            activeWebview.setZoomFactor(activeWebview._currentZoom);
            console.log('Zoom diminuído para:', (activeWebview._currentZoom * 100).toFixed(0) + '%');
          } else if ('${action}' === 'reset') {
            activeWebview._currentZoom = 1.0;
            activeWebview.setZoomFactor(1.0);
            console.log('Zoom resetado para: 100%');
          }
          
          return { 
            success: true, 
            url: activeWebview.src, 
            action: '${action}',
            zoom: (activeWebview._currentZoom * 100).toFixed(0) + '%'
          };
        } catch (error) {
          console.error('Erro ao executar zoom na webview:', error);
          return { success: false, error: error.message };
        }
      } else {
        console.log('Nenhuma webview ativa encontrada para zoom');
        return { success: false, error: 'Nenhuma webview ativa encontrada' };
      }
    })();
  `).then(result => {
    if (result && result.success) {
      console.log('✅ Zoom executado na webview:', result.action, 'Novo zoom:', result.zoom);
    } else {
      console.log('❌ Falha ao executar zoom:', result ? result.error : 'Resultado indefinido');
    }
  }).catch(error => {
    console.error('Erro ao executar script de zoom na webview ativa:', error);
  });
}

module.exports = {
  executeOnActiveWebview,
  executeZoomCommand
};
