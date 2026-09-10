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
  'clipboard-read': 'Área de transferência'
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
