// Teclas modificadoras que, sozinhas, apenas sinalizam o estado do atalho
// (usadas para manter o overlay sincronizado, sem interferir na digitação)
const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta']);

// Teclas de ação usadas pelos atalhos de navegação entre painéis
const ACTION_KEYS = new Set([
  'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown',
  'Enter', 'Escape', 'v', 'V', 'h', 'H', 'w', 'W'
]);

// Pares de modificadores oferecidos em ShortcutsConfigPopover
const MODIFIER_PAIRS = [
  (input) => input.control && input.shift,
  (input) => input.control && input.alt,
  (input) => input.alt && input.shift,
  (input) => input.control && input.meta
];

const isReservedModifierComboHeld = (input) =>
  MODIFIER_PAIRS.some((matches) => matches(input));

// Atalhos de navegador padrão (Ctrl/Cmd + tecla, sem outro modificador) que
// também precisam funcionar com o foco dentro de uma webview, pelo mesmo
// motivo dos atalhos de painel acima: o accelerator do Menu do Electron não
// dispara de forma confiável assim que qualquer <webview> ganha foco de
// teclado, então repassamos esses eventos pelo mesmo caminho já comprovado.
const BROWSER_SHORTCUT_CHANNELS = {
  t: 'menu-new-tab',
  w: 'menu-close-tab',
  l: 'menu-focus-url-bar'
};

const isPlainCmdOrCtrlHeld = (input) =>
  (input.control || input.meta) && !input.shift && !input.alt;

const toKeyEventPayload = (input) => ({
  type: input.type,
  key: input.key,
  ctrlKey: input.control,
  shiftKey: input.shift,
  altKey: input.alt,
  metaKey: input.meta
});

/**
 * Intercepta o teclado de uma webview no processo principal.
 *
 * Quando o foco está dentro de uma <webview>, os keydown/keyup do host não
 * chegam até o React (a webview roda seu próprio processo de renderização).
 * `before-input-event` é disparado no processo principal antes do evento
 * alcançar a página da webview, então repassamos para a janela principal os
 * eventos relevantes para os atalhos de navegação entre painéis, e bloqueamos
 * (preventDefault) apenas as combinações que de fato acionam uma ação.
 */
function attachShortcutInterception(contents, mainWindow) {
  contents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' && input.type !== 'keyUp') return;
    if (!mainWindow || mainWindow.isDestroyed()) return;

    // Repasse "silencioso" das teclas modificadoras: mantém o overlay em
    // sincronia com o estado real do teclado, sem afetar a digitação normal.
    if (MODIFIER_KEYS.has(input.key)) {
      mainWindow.webContents.send('navigation-webview-key-event', toKeyEventPayload(input));
      return;
    }

    // Ctrl+Tab / Ctrl+Shift+Tab: cicla as abas do painel ativo. Verificado
    // antes do bloco de ACTION_KEYS de propósito - Tab nunca deve acionar o
    // modo de navegação entre painéis, mesmo que os modificadores coincidam
    // com o combo configurado (por padrão Ctrl+Shift).
    if (input.type === 'keyDown' && !input.isAutoRepeat && input.key === 'Tab' && (input.control || input.meta) && !input.alt) {
      event.preventDefault();
      mainWindow.webContents.send('cycle-tab', { direction: input.shift ? -1 : 1 });
      return;
    }

    // Ações reais (setas, v/h/w, enter, esc) só são interceptadas quando
    // combinadas com um dos pares de modificadores suportados pela UI.
    if (input.type === 'keyDown' && ACTION_KEYS.has(input.key) && isReservedModifierComboHeld(input)) {
      event.preventDefault();
      mainWindow.webContents.send('navigation-webview-key-event', toKeyEventPayload(input));
      return;
    }

    // Atalhos de navegador (Ctrl+T/W/L) - ignora auto-repeat para não abrir
    // uma dúzia de abas se a tecla ficar segurada.
    if (input.type === 'keyDown' && !input.isAutoRepeat && isPlainCmdOrCtrlHeld(input)) {
      const channel = BROWSER_SHORTCUT_CHANNELS[input.key.toLowerCase()];
      if (channel) {
        event.preventDefault();
        mainWindow.webContents.send(channel);
      }
    }
  });
}

module.exports = {
  attachShortcutInterception
};
