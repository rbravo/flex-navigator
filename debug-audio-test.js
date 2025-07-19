/**
 * Script de teste para depuração da detecção de áudio
 * Execute este script no DevTools do navegador para testar a funcionalidade
 */

console.log('=== TESTE DE DETECÇÃO DE ÁUDIO ===');

// Verificar se estamos no Electron
const isElectron = window.require !== undefined;
console.log('Ambiente Electron:', isElectron);

if (isElectron) {
  const { ipcRenderer } = window.require('electron');
  
  // Listar todas as webviews
  const webviews = document.querySelectorAll('webview[data-tab-id]');
  console.log(`Encontradas ${webviews.length} webviews:`);
  
  webviews.forEach((webview, index) => {
    const tabId = webview.getAttribute('data-tab-id');
    const src = webview.src;
    
    console.log(`Webview ${index + 1}:`);
    console.log(`  Tab ID: ${tabId}`);
    console.log(`  URL: ${src}`);
    
    // Verificar se tem métodos de áudio disponíveis
    console.log(`  isAudioMuted: ${typeof webview.isAudioMuted}`);
    console.log(`  setAudioMuted: ${typeof webview.setAudioMuted}`);
    console.log(`  isCurrentlyAudible: ${typeof webview.isCurrentlyAudible}`);
    
    // Testar detecção de áudio se disponível
    if (webview.isCurrentlyAudible) {
      try {
        const isAudible = webview.isCurrentlyAudible();
        console.log(`  Estado atual de áudio: ${isAudible}`);
      } catch (error) {
        console.log(`  Erro ao verificar áudio: ${error.message}`);
      }
    }
    
    // Verificar listeners ativos
    console.log(`  Has listener flag: ${webview.hasListener}`);
    
    console.log('---');
  });
  
  // Função para testar envio IPC
  window.testAudioIPC = (tabId) => {
    console.log(`Testando IPC para tab ${tabId}...`);
    ipcRenderer.send('check-webview-audio-state', { tabId });
  };
  
  // Função para testar toggle mute
  window.testToggleMute = (tabId, muted) => {
    console.log(`Testando toggle mute para tab ${tabId}: ${muted}...`);
    ipcRenderer.send('toggle-webview-mute', { tabId, muted });
  };
  
  console.log('Funções de teste disponíveis:');
  console.log('- testAudioIPC(tabId) - testa verificação de estado de áudio');
  console.log('- testToggleMute(tabId, true/false) - testa toggle de mute');
  
} else {
  console.log('Este teste só funciona no ambiente Electron');
}

// Função para monitorar mudanças no modelo FlexLayout
window.debugFlexLayoutModel = () => {
  const flexLayoutElement = document.querySelector('.flexlayout__layout');
  if (flexLayoutElement && window.flexLayoutModel) {
    console.log('Modelo FlexLayout encontrado');
    
    // Função para listar todas as tabs
    const listAllTabs = () => {
      const tabs = [];
      
      const collectTabs = (node) => {
        if (node.getType && node.getType() === 'tab') {
          const config = node.getConfig ? node.getConfig() : {};
          tabs.push({
            id: node.getId(),
            name: node.getName(),
            component: node.getComponent(),
            isPlayingAudio: config.isPlayingAudio || false,
            muted: config.muted || false
          });
        }
        
        if (node.getChildren) {
          node.getChildren().forEach(collectTabs);
        }
      };
      
      window.flexLayoutModel.visitNodes(collectTabs);
      return tabs;
    };
    
    window.listTabs = listAllTabs;
    console.log('Função listTabs() disponível para listar todas as tabs');
    
    const tabs = listAllTabs();
    console.log('Tags atuais:', tabs);
    
  } else {
    console.log('Modelo FlexLayout não encontrado');
  }
};

console.log('Execute debugFlexLayoutModel() para analisar o modelo FlexLayout');
