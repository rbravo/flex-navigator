import { useEffect } from 'react';

/**
 * Fecha um popover/dropdown quando o foco vai para uma <webview>.
 *
 * O conteúdo de uma <webview> roda em outro processo, então um clique lá
 * dentro nunca dispara mousedown/click no `document` do host - é exatamente
 * isso que o Popover do antd usa pra detectar "clicou fora" e fechar
 * sozinho. Sem isso, um popover aberto na barra de URL (auto-refresh,
 * atalhos, informações do site) fica aberto pra sempre assim que o usuário
 * clica na página carregada na aba.
 *
 * `focusin` no `document` NÃO dispara nesse caso - confirmado testando com
 * um clique real (via CDP) na webview, o evento nunca chega no host. O que
 * de fato acontece é o `window` do host perder o foco de verdade (a guest
 * view da webview roda como um widget de foco separado): um `blur` no
 * `window` dispara, e nesse momento `document.activeElement` já é o
 * elemento `<webview>`. É por aí que detectamos.
 */
const useCloseOnWebviewFocus = (open, onClose) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleWindowBlur = () => {
      if (document.activeElement && document.activeElement.tagName === 'WEBVIEW') {
        onClose();
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [open, onClose]);
};

export default useCloseOnWebviewFocus;
