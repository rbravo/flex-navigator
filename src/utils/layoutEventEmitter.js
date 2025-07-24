/**
 * Sistema de eventos para notificar mudanças na configuração dos tabsets
 */

class LayoutEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Erro no listener do evento:', event, error);
        }
      });
    }
  }
}

// Instância global do emitter
export const layoutEventEmitter = new LayoutEventEmitter();

// Eventos disponíveis
export const LAYOUT_EVENTS = {
  NAVIGATION_BAR_TOGGLED: 'navigationBarToggled',
  TABSET_CONFIG_CHANGED: 'tabsetConfigChanged'
};
