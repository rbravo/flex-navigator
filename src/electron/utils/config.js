const { app } = require('electron');

/**
 * Detecção mais confiável do modo de desenvolvimento
 */
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * Função para imprimir informações de debug
 */
function printDebugInfo() {
  console.log('🔍 Debug info:');
  console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('isDev:', isDev);
}

module.exports = {
  isDev,
  printDebugInfo
};
