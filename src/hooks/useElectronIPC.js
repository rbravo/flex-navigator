import { useEffect } from 'react';
import {
  addNewTabToFirstTabset,
  addNewTabToSameTabset,
  createNewTab,
  splitPanelHorizontal,
  splitPanelVertical,
  findAllTabsets,
  cycleTabInTabset
} from '../utils/layoutActions';
import { updateTabAudioState, startAudioStateMonitoring, closeTab, markTabForUrlBarFocus } from '../utils/tabActions';

/**
 * Retorna o id do tabset "atual": o ativo no FlexLayout ou, na ausência de
 * um ativo, o primeiro disponível
 */
const getCurrentTabsetId = (model) => {
  const activeTabset = model.getActiveTabset && model.getActiveTabset();
  if (activeTabset) return activeTabset.getId();

  const tabsets = findAllTabsets(model);
  return tabsets.length > 0 ? tabsets[0].getId() : null;
};

/**
 * Retorna o id da tab selecionada do tabset "atual" (mesmo critério de
 * getCurrentTabsetId: o ativo no FlexLayout ou, na ausência de um ativo -
 * por exemplo quando o usuário nunca clicou diretamente em um tabset, só
 * usou teclado/webview -, o primeiro disponível)
 */
const getActiveTabId = (model) => {
  const tabsetId = getCurrentTabsetId(model);
  if (!tabsetId) return null;

  const tabset = model.getNodeById(tabsetId);
  const selectedNode = tabset && tabset.getSelectedNode();
  return selectedNode ? selectedNode.getId() : null;
};

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
          
          if (data.sourceTabId) {
            // Se temos o ID da tab source, adicionar no mesmo tabset
            console.log('Adicionando nova aba no mesmo tabset da tab:', data.sourceTabId);
            addNewTabToSameTabset(model, data.sourceTabId, data);
          } else {
            // Fallback para o primeiro tabset
            console.log('SourceTabId não fornecido, usando primeiro tabset como fallback');
            addNewTabToFirstTabset(model, data);
          }
        };

        // Listener para comandos do context menu
        const handleOpenInNewTab = (event, url) => {
          handleAddNewTab(event, { url });
        };

        // Listeners para novos eventos dos modais
        const handleShowClearSessionDialog = () => {
          console.log('🔔 IPC: Evento show-clear-session-dialog recebido');
          window.dispatchEvent(new CustomEvent('show-clear-session-dialog'));
        };

        const handleShowSettingsDialog = () => {
          window.dispatchEvent(new CustomEvent('show-settings-dialog'));
        };

        const handleOpenUrl = (event, url) => {
          window.dispatchEvent(new CustomEvent('open-url', { detail: url }));
        };

        // Listener para teste de notificações
        const handleTestNotifications = () => {
          console.log('🧪 Teste de notificações solicitado via IPC');
          window.dispatchEvent(new CustomEvent('test-notifications'));
        };

        // Listeners para os comandos do menu "Arquivo": nova aba e divisão
        // de painel, sempre agindo sobre o tabset atualmente ativo
        const handleMenuNewTab = () => {
          const tabsetId = getCurrentTabsetId(model);
          if (tabsetId) {
            const newTab = createNewTab(model, tabsetId);
            if (newTab) markTabForUrlBarFocus(newTab.getId());
          }
        };

        const handleMenuSplitHorizontal = () => {
          const tabsetId = getCurrentTabsetId(model);
          if (tabsetId) splitPanelHorizontal(model, tabsetId);
        };

        const handleMenuSplitVertical = () => {
          const tabsetId = getCurrentTabsetId(model);
          if (tabsetId) splitPanelVertical(model, tabsetId);
        };

        const handleMenuCloseTab = () => {
          const tabId = getActiveTabId(model);
          if (tabId) closeTab(model, tabId);
        };

        // Foca a barra de URL da aba ativa (Ctrl+L, como no Chrome). O
        // próprio BrowserPanel da aba ativa escuta esse evento e decide se
        // deve focar seu input (ignora se não for a aba ativa)
        const handleMenuFocusUrlBar = () => {
          const tabId = getActiveTabId(model);
          if (tabId) {
            window.dispatchEvent(new CustomEvent('focus-url-bar', { detail: { tabId } }));
          }
        };

        // Ctrl+Tab / Ctrl+Shift+Tab: navega entre as abas do painel (tabset)
        // ativo, com wraparound - como no Chrome. Trocar de painel continua
        // sendo o atalho de navegação entre painéis já existente.
        const handleCycleTab = (direction) => {
          const tabsetId = getCurrentTabsetId(model);
          if (tabsetId) cycleTabInTabset(model, tabsetId, direction);
        };

        // Listener para teclas de atalho de navegação capturadas dentro de
        // uma webview (o keydown do host não dispara nesse caso, então o
        // processo principal repassa o evento via before-input-event)
        const handleWebviewNavigationKeyEvent = (event, data) => {
          window.dispatchEvent(new CustomEvent('webview-navigation-key-event', { detail: data }));
        };

        // Atalhos de navegador (Ctrl+T/W/L) quando o foco NÃO está numa
        // webview (nesse caso o processo principal repassa via
        // before-input-event + IPC 'menu-*', tratado pelos handlers acima).
        // Um accelerator de Menu do Electron não é usado para isso porque
        // ele para de disparar de forma confiável assim que qualquer
        // <webview> já ganhou foco de teclado ao menos uma vez.
        const handleBrowserShortcutKeyDown = (e) => {
          if (e.repeat) return;

          // Ctrl+Tab / Ctrl+Shift+Tab: aceita Shift para escolher a direção,
          // então precisa ser verificado antes do gate "só Ctrl" abaixo.
          // Ignora de propósito o modo de navegação entre painéis (que por
          // padrão também usa Ctrl+Shift) - Tab nunca deve abrir aquele
          // overlay, só ciclar as abas do painel ativo.
          if (e.key === 'Tab' && (e.ctrlKey || e.metaKey) && !e.altKey) {
            e.preventDefault();
            handleCycleTab(e.shiftKey ? -1 : 1);
            return;
          }

          const isPlainCmdOrCtrl = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey;
          if (!isPlainCmdOrCtrl) return;

          switch (e.key.toLowerCase()) {
            case 't':
              e.preventDefault();
              handleMenuNewTab();
              break;
            case 'w':
              e.preventDefault();
              handleMenuCloseTab();
              break;
            case 'l':
              e.preventDefault();
              handleMenuFocusUrlBar();
              break;
            default:
              break;
          }
        };
        document.addEventListener('keydown', handleBrowserShortcutKeyDown, true);

        // Listener para atualizações de estado de áudio
        const handleAudioStateUpdate = (event, data) => {
          //console.log('Recebido update de áudio:', data);
          if (data.tabId) {
            if (typeof data.isAudible === 'boolean') {
              updateTabAudioState(model, data.tabId, data.isAudible);
            } else {
              console.warn('Resultado de áudio inválido para tab', data.tabId, ':', data);
            }
          }
        };

        // Ctrl+Tab / Ctrl+Shift+Tab repassado pelo processo principal quando
        // o foco está numa webview (mesmo caminho do menu-new-tab/etc.)
        const handleCycleTabEvent = (event, { direction }) => {
          handleCycleTab(direction);
        };

        // Registrar listeners
        ipcRenderer.on('add-new-tab', handleAddNewTab);
        ipcRenderer.on('open-in-new-tab', handleOpenInNewTab);
        ipcRenderer.on('audio-state-update', handleAudioStateUpdate);
        ipcRenderer.on('show-clear-session-dialog', handleShowClearSessionDialog);
        ipcRenderer.on('show-settings-dialog', handleShowSettingsDialog);
        ipcRenderer.on('open-url', handleOpenUrl);
        ipcRenderer.on('test-notifications', handleTestNotifications);
        ipcRenderer.on('navigation-webview-key-event', handleWebviewNavigationKeyEvent);
        ipcRenderer.on('menu-new-tab', handleMenuNewTab);
        ipcRenderer.on('menu-split-horizontal', handleMenuSplitHorizontal);
        ipcRenderer.on('menu-split-vertical', handleMenuSplitVertical);
        ipcRenderer.on('menu-close-tab', handleMenuCloseTab);
        ipcRenderer.on('menu-focus-url-bar', handleMenuFocusUrlBar);
        ipcRenderer.on('cycle-tab', handleCycleTabEvent);

        // Iniciar monitoramento de áudio
        const stopAudioMonitoring = startAudioStateMonitoring(model);

        // Cleanup ao desmontar o componente
        return () => {
          ipcRenderer.removeListener('add-new-tab', handleAddNewTab);
          ipcRenderer.removeListener('open-in-new-tab', handleOpenInNewTab);
          ipcRenderer.removeListener('audio-state-update', handleAudioStateUpdate);
          ipcRenderer.removeListener('show-clear-session-dialog', handleShowClearSessionDialog);
          ipcRenderer.removeListener('show-settings-dialog', handleShowSettingsDialog);
          ipcRenderer.removeListener('open-url', handleOpenUrl);
          ipcRenderer.removeListener('test-notifications', handleTestNotifications);
          ipcRenderer.removeListener('navigation-webview-key-event', handleWebviewNavigationKeyEvent);
          ipcRenderer.removeListener('menu-new-tab', handleMenuNewTab);
          ipcRenderer.removeListener('menu-split-horizontal', handleMenuSplitHorizontal);
          ipcRenderer.removeListener('menu-split-vertical', handleMenuSplitVertical);
          ipcRenderer.removeListener('menu-close-tab', handleMenuCloseTab);
          ipcRenderer.removeListener('menu-focus-url-bar', handleMenuFocusUrlBar);
          ipcRenderer.removeListener('cycle-tab', handleCycleTabEvent);
          document.removeEventListener('keydown', handleBrowserShortcutKeyDown, true);

          // Parar monitoramento de áudio
          if (stopAudioMonitoring) {
            stopAudioMonitoring();
          }
        };
      } catch (error) {
        console.log('Erro ao configurar IPC listeners:', error);
      }
    }
  }, [model]);
};

export default useElectronIPC;
