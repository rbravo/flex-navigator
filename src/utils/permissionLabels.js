/**
 * Rótulos traduzidos das permissões rastreadas por site - usado tanto no
 * popover de informações do site (ícone de globo) quanto na aba de
 * permissões das Configurações. Recebem a função `t` de useTranslation()
 * porque estes utilitários não são componentes React.
 */
export const getPermissionLabels = (t) => ({
  media: t('permissions.labels.media'),
  geolocation: t('permissions.labels.geolocation'),
  notifications: t('permissions.labels.notifications'),
  midiSysex: t('permissions.labels.midiSysex'),
  'clipboard-read': t('permissions.labels.clipboard-read'),
  // Não é uma permissão nativa do Electron (não existe um pedido do
  // Chromium pra isso) - por isso "Perguntar sempre" aqui não abre um
  // prompt de verdade, apenas mantém o comportamento padrão de bloquear.
  popups: t('permissions.labels.popups')
});

// null = nunca perguntado (ou decisão esquecida) - o site pode perguntar de
// novo normalmente. true/false = decisão já tomada, lembrada pra esse site.
export const decisionToOption = (granted) => (granted === null ? 'ask' : granted ? 'allow' : 'block');
export const optionToDecision = (option) => (option === 'ask' ? null : option === 'allow');

export const getPermissionDecisionOptions = (t) => [
  { value: 'ask', label: t('permissions.decisions.ask') },
  { value: 'allow', label: t('permissions.decisions.allow') },
  { value: 'block', label: t('permissions.decisions.block') }
];
