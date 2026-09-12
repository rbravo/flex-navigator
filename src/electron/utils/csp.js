const { session } = require('electron');
const { isDev } = require('./config');

// Defesa em profundidade pro shell do próprio app (a janela principal - não
// afeta as <webview>, que rodam numa sessão separada e já são isoladas por
// outros meios). Mesmo sem Node exposto no renderer, um XSS aqui ainda
// poderia roubar dados da UI, chamar window.electronAPI livremente ou
// carregar recursos de fora - um CSP restringe bastante o que esse XSS
// conseguiria fazer.
//
// style-src precisa de 'unsafe-inline' porque o antd injeta <style> em
// runtime (cssinjs) - dá pra evoluir isso com nonce (StyleProvider do antd
// suporta), mas não é o mesmo nível de risco que scripts inline (CSS
// sozinho raramente vira execução de código). script-src fica estrito de
// propósito: por isso a produção usa INLINE_RUNTIME_CHUNK=false (.env.production)
// pra tirar o chunk de runtime que o Create React App inlina por padrão -
// sem isso o próprio bundle da produção quebraria com um script-src estrito.
//
// Não restringimos frame-src de propósito: a <webview> não é um <iframe> e,
// por segurança, preferimos não arriscar CSP do embedder afetando algo que
// não deveria (confirmado que carregamento funciona normalmente com essa
// política, mas testar frame-src especificamente não valia o risco).
const PRODUCTION_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join('; ');

/**
 * Aplica o CSP só em produção (build empacotado, carregado via file://) - em
 * desenvolvimento o webpack-dev-server precisa de eval/inline pro HMR
 * funcionar, e um build de dev nunca é o que chega no usuário final.
 */
function setupContentSecurityPolicy() {
  if (isDev) return;

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [PRODUCTION_CSP]
      }
    });
  });
}

module.exports = { setupContentSecurityPolicy };
