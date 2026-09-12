/**
 * Persiste o nível de zoom por origem (hostname) no localStorage - como no
 * Chrome, cada site lembra seu próprio zoom entre navegações/reinícios.
 */
const STORAGE_KEY = 'flex-navigator-zoom-levels';

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.1;
export const ZOOM_DEFAULT = 1;

const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Erro ao carregar níveis de zoom:', error);
    return {};
  }
};

export const getZoomForOrigin = (hostname) => {
  if (!hostname) return ZOOM_DEFAULT;
  const levels = loadAll();
  return typeof levels[hostname] === 'number' ? levels[hostname] : ZOOM_DEFAULT;
};

export const saveZoomForOrigin = (hostname, factor) => {
  if (!hostname) return;
  const levels = loadAll();
  // Não vale a pena guardar o valor padrão - economiza espaço e permite
  // "esquecer" o zoom customizado só resetando pra 100%.
  if (factor === ZOOM_DEFAULT) {
    delete levels[hostname];
  } else {
    levels[hostname] = factor;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch (error) {
    console.error('Erro ao salvar nível de zoom:', error);
  }
};

export const clampZoom = (factor) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(factor * 100) / 100));
