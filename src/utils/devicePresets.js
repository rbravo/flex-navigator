/**
 * Dimensões conhecidas de celulares/tablets pra testar responsividade de
 * sites (ver DimensionsPopover.js) - larguras/alturas em CSS px (viewport),
 * não pixels físicos do aparelho.
 */
export const BUILTIN_DEVICE_PRESETS = [
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, category: 'phone' },
  { id: 'iphone-13-14', name: 'iPhone 13 / 14', width: 390, height: 844, category: 'phone' },
  { id: 'iphone-15-16', name: 'iPhone 15 / 16', width: 393, height: 852, category: 'phone' },
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', width: 440, height: 956, category: 'phone' },
  { id: 'galaxy-s20', name: 'Galaxy S20', width: 360, height: 800, category: 'phone' },
  { id: 'galaxy-s23', name: 'Galaxy S23', width: 393, height: 851, category: 'phone' },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, category: 'phone' },
  { id: 'ipad-mini', name: 'iPad Mini', width: 768, height: 1024, category: 'tablet' },
  { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180, category: 'tablet' },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet' },
  { id: 'ipad-pro-12-9', name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet' },
  { id: 'galaxy-tab-s8', name: 'Galaxy Tab S8', width: 800, height: 1280, category: 'tablet' }
];

export const DEVICE_CATEGORY_LABELS = {
  phone: 'Celulares',
  tablet: 'Tablets',
  custom: 'Personalizados'
};

const STORAGE_KEY = 'flex-navigator-custom-devices';

export const loadCustomDevices = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Erro ao carregar dimensões personalizadas:', error);
    return [];
  }
};

const persistCustomDevices = (devices) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch (error) {
    console.error('Erro ao salvar dimensões personalizadas:', error);
  }
};

export const addCustomDevice = (name, width, height) => {
  const devices = loadCustomDevices();
  const device = { id: `custom-${Date.now()}`, name, width, height, category: 'custom' };
  devices.push(device);
  persistCustomDevices(devices);
  return device;
};

export const removeCustomDevice = (id) => {
  persistCustomDevices(loadCustomDevices().filter((device) => device.id !== id));
};

// Builtins primeiro, personalizados depois - usado tanto pelo popover de
// dimensões (ControlsBar) quanto pela aba de Configurações que os gerencia.
export const getAllDevicePresets = () => [...BUILTIN_DEVICE_PRESETS, ...loadCustomDevices()];
