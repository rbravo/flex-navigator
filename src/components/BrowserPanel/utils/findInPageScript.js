/**
 * Busca na página (Ctrl+F) implementada via DOM, injetada na webview com
 * `executeJavaScript`.
 *
 * `webContents.findInPage()` (a API nativa do Electron) se mostrou pouco
 * confiável nesta versão pra conteúdo de <webview>: testado tanto via
 * evento DOM na própria tag quanto via webContents.fromId() no processo
 * principal (a forma mais direta de chamar a API) - em ambos os casos o
 * evento 'found-in-page' nunca chega, mesmo com o webContents certo
 * identificado e `hasFindInPage` confirmando que o método existe. A mesma
 * chamada funciona perfeitamente no webContents da janela principal, então
 * é uma limitação de guest view específica dessa versão do Electron, não um
 * uso incorreto da API. Por isso a busca aqui é 100% independente disso:
 * percorre o DOM da própria página, envolve cada ocorrência num <mark> e
 * navega entre eles - a mesma técnica usada por extensões de "highlight
 * search" de navegador.
 */
const SETUP_SCRIPT = `
if (!window.__flexNavigatorFind) {
  window.__flexNavigatorFind = {
    marks: [],
    activeIndex: -1,
    clear: function () {
      this.marks.forEach(function (mark) {
        var parent = mark.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });
      this.marks = [];
      this.activeIndex = -1;
    },
    highlightActive: function () {
      this.marks.forEach(function (mark, i) {
        mark.style.backgroundColor = i === this.activeIndex ? '#ff9800' : '#ffd54f';
      }, this);
      var active = this.marks[this.activeIndex];
      if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    search: function (text) {
      this.clear();
      if (!text) return { matches: 0, activeMatchOrdinal: 0 };
      var escaped = text.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
      var regex = new RegExp(escaped, 'gi');
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          var tag = node.parentElement && node.parentElement.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK' || tag === 'TEXTAREA' || tag === 'INPUT') return NodeFilter.FILTER_REJECT;
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var textNodes = [];
      var n;
      while ((n = walker.nextNode())) textNodes.push(n);
      var self = this;
      textNodes.forEach(function (node) {
        var value = node.nodeValue;
        regex.lastIndex = 0;
        if (!regex.test(value)) return;
        regex.lastIndex = 0;
        var frag = document.createDocumentFragment();
        var lastIndex = 0;
        var match;
        while ((match = regex.exec(value))) {
          if (match.index > lastIndex) {
            frag.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
          }
          var mark = document.createElement('mark');
          mark.style.backgroundColor = '#ffd54f';
          mark.style.color = '#000';
          mark.textContent = match[0];
          frag.appendChild(mark);
          self.marks.push(mark);
          lastIndex = match.index + match[0].length;
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
        if (lastIndex < value.length) {
          frag.appendChild(document.createTextNode(value.slice(lastIndex)));
        }
        node.parentNode.replaceChild(frag, node);
      });
      if (this.marks.length > 0) {
        this.activeIndex = 0;
        this.highlightActive();
      }
      return { matches: this.marks.length, activeMatchOrdinal: this.marks.length ? 1 : 0 };
    },
    next: function () {
      if (!this.marks.length) return { matches: 0, activeMatchOrdinal: 0 };
      this.activeIndex = (this.activeIndex + 1) % this.marks.length;
      this.highlightActive();
      return { matches: this.marks.length, activeMatchOrdinal: this.activeIndex + 1 };
    },
    previous: function () {
      if (!this.marks.length) return { matches: 0, activeMatchOrdinal: 0 };
      this.activeIndex = (this.activeIndex - 1 + this.marks.length) % this.marks.length;
      this.highlightActive();
      return { matches: this.marks.length, activeMatchOrdinal: this.activeIndex + 1 };
    }
  };
}
`;

export const buildSearchScript = (text) =>
  `${SETUP_SCRIPT}\nwindow.__flexNavigatorFind.search(${JSON.stringify(text)})`;

export const buildNextScript = () => `${SETUP_SCRIPT}\nwindow.__flexNavigatorFind.next()`;

export const buildPreviousScript = () => `${SETUP_SCRIPT}\nwindow.__flexNavigatorFind.previous()`;

export const buildClearScript = () =>
  `${SETUP_SCRIPT}\nwindow.__flexNavigatorFind.clear(); ({ matches: 0, activeMatchOrdinal: 0 })`;
