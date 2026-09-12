/**
 * Rótulos em português das permissões rastreadas por site - usado tanto no
 * popover de informações do site (ícone de globo) quanto na aba de
 * permissões das Configurações.
 */
export const PERMISSION_LABELS = {
  media: 'Câmera e microfone',
  geolocation: 'Localização',
  notifications: 'Notificações',
  midiSysex: 'Dispositivos MIDI',
  'clipboard-read': 'Área de transferência',
  // Não é uma permissão nativa do Electron (não existe um pedido do
  // Chromium pra isso) - por isso "Perguntar sempre" aqui não abre um
  // prompt de verdade, apenas mantém o comportamento padrão de bloquear.
  popups: 'Pop-ups'
};

// null = nunca perguntado (ou decisão esquecida) - o site pode perguntar de
// novo normalmente. true/false = decisão já tomada, lembrada pra esse site.
export const decisionToOption = (granted) => (granted === null ? 'ask' : granted ? 'allow' : 'block');
export const optionToDecision = (option) => (option === 'ask' ? null : option === 'allow');

export const PERMISSION_DECISION_OPTIONS = [
  { value: 'ask', label: 'Perguntar sempre' },
  { value: 'allow', label: 'Permitir' },
  { value: 'block', label: 'Bloquear' }
];
