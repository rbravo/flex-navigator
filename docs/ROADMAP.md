# Roadmap: Flex Navigator rumo a um navegador mais completo e seguro

Este arquivo é o checklist vivo do que falta para o Flex Navigator amadurecer
como navegador de propósito geral. Marque os itens (`[x]`) conforme forem
implementados e testados de verdade (não só "parece funcionar"). Cada item
tem uma linha de contexto explicando o porquê.

## Segurança

### ✅ Concluído

- [x] **Isolar o shell do app do Node.js** — janela principal migrada para
      `nodeIntegration: false` + `contextIsolation: true`, com um preload
      (`src/electron/preload.js`) expondo só uma API específica via
      `contextBridge` (`window.electronAPI`). Antes, um XSS no React do app
      teria acesso completo ao Node; agora não tem.
- [x] **Prompt de permissões** — pedidos de câmera/mic, geolocalização,
      notificações, MIDI e leitura de área de transferência feitos por sites
      abertos numa aba agora passam por um modal (antd) perguntando ao
      usuário, em vez do comportamento padrão do Electron. Implementado em
      `setupPermissionHandler` (`src/electron/utils/webContentsSetup.js`) +
      `PermissionRequestManager` (`src/components/PermissionRequest`).
      Qualquer outra permissão (hid, usb, serial, window-management...) é
      negada por padrão. Decisão é lembrada por origem enquanto o app está
      aberto, mas não persiste em disco ainda (reiniciar volta a perguntar).
      Testado de ponta a ponta: webview real pedindo `geolocation`, evento
      chegando certo no renderer, e a concessão desbloqueando de fato a
      chamada do Chromium (`getCurrentPosition` resolvendo em vez de travar).

- [x] **`sandbox: true` na `<webview>`** — adicionado ao `webpreferences` da
      `<webview>` (`WebContent.js`). Testado de ponta a ponta com uma webview
      real: página ainda carrega e renderiza normalmente (`readyState`,
      título, DOM), os métodos do elemento host (`getURL`, `getTitle`,
      `canGoBack`, `isCurrentlyAudible`) continuam funcionando (são a base do
      polling de título/URL/áudio em `tabActions.js`), o prompt de permissão
      continua disparando e sendo respeitado, e não apareceu nenhuma exceção
      não tratada dentro da webview sandboxed. Sem regressão encontrada.

- [x] **Restringir navegação da webview durante toda a sessão (+ revisão do
      `setWindowOpenHandler`)** — adicionados `will-navigate` e
      `will-redirect` em `webContentsSetup.js`, permitindo só
      `http:`/`https:`/`about:` durante toda a vida da webview, mais o mesmo
      filtro dentro do `setWindowOpenHandler` (pop-ups negados que viravam
      `loadURL` não passavam por `will-navigate`, já que é uma chamada do
      processo principal, não da própria página). Testado com o vetor de
      ataque real (a própria página rodando `location.href = 'file://...'`
      via JS): fica bloqueado e a webview permanece na página original;
      navegação normal `https://` continua funcionando depois. Uma tentativa
      inicial de testar isso via `Page.navigate` do CDP deu falso positivo de
      bug — essa chamada é "vinda do processo de automação/DevTools", não da
      página, então também não passa por `will-navigate` (mesma razão de
      `loadURL` do processo principal não passar) e não representa o que um
      site conseguiria fazer sozinho.

- [x] **Persistir decisões de permissão entre sessões** — as decisões agora
      são salvas em `permissions.json` (`app.getPath('userData')`) via
      `PermissionManager` (`src/electron/utils/PermissionManager.js`),
      substituindo o `Map` em memória; sobrevivem a reiniciar o app. Ganhou
      também uma tela de gerenciamento: aba "Permissões" no modal de
      Configurações (`PermissionsSettingsTab.js`), listando todo site com
      alguma decisão e deixando permitir/bloquear/redefinir cada permissão ou
      "esquecer" o site inteiro - mudanças aplicadas na hora, sem precisar do
      botão "Salvar" geral do modal. Testado de ponta a ponta: decisão feita
      via `setSitePermission` aparece no arquivo em disco, aparece em
      `listSitePermissions()`, aparece de fato renderizada na aba da UI real
      do modal de Configurações, e `removeSitePermissions()` limpa tanto do
      arquivo quanto da lista.

      **Bug encontrado e corrigido depois, via teste manual do usuário:**
      conceder uma permissão de verdade (fluxo real: site pede → nosso modal
      pergunta → clique em "Permitir") não aparecia na aba Permissões. Causa:
      o `Tabs` do antd não propaga updates de forma confiável pra dentro de
      uma aba que não está ativa no momento - ela fica "presa" com o que
      tinha na última vez que esteve ativa, mesmo o componente recebendo
      props novas. Corrigido forçando a aba a remontar por completo a cada
      abertura do modal (`key={openCount}` em `SettingsModal.js`, incrementado
      toda vez que `visible` vira `true`), em vez de depender de um `useEffect`
      reagindo a um prop `visible` dentro da aba. Testado de ponta a ponta
      com o fluxo 100% real (clique de verdade em "Permitir", não chamada
      direta da API): duas permissões concedidas via clique real aparecem
      certas na primeira abertura, e uma terceira concedida enquanto o modal
      estava fechado aparece corretamente ao reabrir.

- [x] **Gerenciar downloads explicitamente** — `will-download` capturado em
      `session.fromPartition('persist:webview')`
      (`src/electron/utils/downloadManager.js`). Cada download mostra o
      diálogo nativo "Salvar como" (`item.setSaveDialogOptions`, sugerindo a
      pasta Downloads com resolução de conflito de nome - `arquivo (1).pdf`
      - como ponto de partida; o Electron mostra o diálogo sozinho e cancela
      o download automaticamente se o usuário fechar sem escolher local).
      Decisão tomada com o usuário: sempre perguntar, sem opção de desligar -
      mais simples que a alternativa (toggle em Configurações) e foi o que
      ele pediu depois de sentir falta do diálogo clássico. Junto com isso já
      saiu a UI (item que estava em "Completude", movido pra cá por terem
      sido feitos juntos): popover de Downloads (`DownloadsPopover.js`) com
      progresso, pausar/retomar/cancelar e abrir/mostrar na pasta, botão na
      barra de URL antes de Configurações. Lista só em memória (não persiste
      entre reinícios, igual às decisões de permissão eram antes de serem
      persistidas). Testado de ponta a ponta: download real disparado dentro
      da webview (Blob + `<a download>`, sem depender de rede externa) grava
      no disco com conteúdo correto, aparece em `listDownloads()`, cancelar
      um download grande em andamento realmente para a gravação
      (`receivedBytes: 0`) sem deixar arquivo pra trás, e o diálogo "Salvar
      como" de verdade aparece e completa o download com o caminho escolhido
      (testado com automação real do diálogo nativo do Windows via
      PowerShell/SendKeys, já que ele não é acessível pelo DevTools/CDP).

      **Investigação à parte:** usuário reportou que no site
      thinkbroadband.com/download um link de teste (5MB, `http://`) "virava"
      navegação em vez de baixar. Reproduzi fielmente a estrutura da página
      (link simples sem atributo `download`, com/sem `Content-Disposition`,
      até um redirect entre origens) num servidor local e tudo funcionou
      perfeitamente - então não era um bug geral do mecanismo de download.
      Confirmado depois (via `curl` de uma rede diferente da minha, e via
      teste direto de navegação para a mesma URL) que o servidor de teste do
      thinkbroadband estava com um problema de rede/instabilidade própria
      (conexão fechando sem resposta) - não relacionado ao Flex Navigator.
      Usuário confirmou que outro site de teste de download funcionou
      normalmente.

- [x] **CSP para o shell do app** — `Content-Security-Policy` aplicado via
      `session.defaultSession.webRequest.onHeadersReceived`
      (`src/electron/utils/csp.js`), só em produção (`isDev` pula - o
      webpack-dev-server precisa de `eval`/inline pro HMR, e um build de dev
      nunca chega ao usuário). Política: `default-src 'self'` com
      `script-src 'self'` estrito (sem `unsafe-inline`/`unsafe-eval`),
      `style-src` com `unsafe-inline` (necessário pro antd, que injeta
      `<style>` em runtime - CSS sozinho é risco bem menor que script),
      `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`. Não afeta
      a `<webview>` (sessão separada).

      Duas coisas só apareceram testando contra um build de produção real
      (não dava pra confiar só em teoria aqui):
      1. Confirmei antes de implementar, com um teste isolado, que
         `webRequest.onHeadersReceived` realmente aplica o header em cargas
         `file://` nesta versão do Electron (não é garantido em toda versão)
         - testado forçando um script inline a ser bloqueado de verdade.
      2. O `public/index.html` tinha um `<script>` inline próprio (mensagem
         "Loading Flex-Navigator...") que um `script-src` estrito bloquearia
         em produção - movido pra `public/loading.js` como arquivo externo.
         Também precisou de `INLINE_RUNTIME_CHUNK=false` (`.env.production`)
         pra impedir o Create React App de inlinar o chunk de runtime do
         webpack, que do contrário também violaria o `script-src`.

      Testado de ponta a ponta contra o build de produção real (não só em
      dev): app carrega e renderiza normalmente, estilos do antd aplicados
      corretamente, `window.electronAPI` intacto, webview continua
      navegando pra páginas reais sem nenhuma restrição, e zero violações de
      CSP no console.

### 🔜 Próximos passos

- [ ] **Confirmar assinatura de código nos instaladores** — verificar se o
      `electron-builder` está configurado para assinar o build de
      Windows/macOS. Um updater (`electron-updater`) rodando sem assinatura
      é superfície de ataque (supply chain) num navegador que se atualiza
      sozinho.

## Completude como navegador

### ✅ Concluído

- [x] **Popover de informações do site** — o ícone na barra de URL agora
      abre um popover (`SiteInfoPopover.js`) mostrando o estado da conexão
      (cadeado/aviso HTTPS, emissor e validade do certificado - reaproveita a
      captura de certificado do `setupSiteInfoHandlers`) e a lista de
      permissões do site atual, com opção de mudar cada uma na hora. Testado
      de ponta a ponta com certificado real capturado de um site https.
      De quebra, corrigido um bug de UX descoberto durante o teste manual:
      esse popover (e os outros dois já existentes, auto-refresh e atalhos)
      ficava aberto para sempre se o usuário clicasse na `<webview>` -
      cliques lá dentro rodam em outro processo e nunca disparam
      mousedown/click no `document` do host, que é como o Popover do antd
      detecta "clicou fora". A correção usa `window.addEventListener('blur')`
      checando `document.activeElement.tagName === 'WEBVIEW'`
      (`useCloseOnWebviewFocus.js`) - confirmado com um clique real via CDP
      que `focusin` no document NÃO dispara nesse caso, mas `window blur` sim.

- [x] **Menu de zoom + buscar na página** — o botão de Configurações virou
      um `Dropdown` (`ControlsBar.js`) com três seções: Zoom, Buscar na
      página e Configurações (mantém o comportamento antigo).
      - **Zoom por site**: `+`/`-`/redefinir na dropdown, mais os atalhos
        Ctrl+/Ctrl-/Ctrl+0 (mesmo caminho de relay dos outros atalhos de
        navegador - `navigationShortcuts.js` + `useElectronIPC.js`). Nível
        salvo por origem no localStorage (`zoomLevels.js`) e reaplicado
        automaticamente ao navegar pra essa origem de novo, em qualquer aba.
        Aplicado de verdade via `webview.setZoomFactor()`.
      - **Buscar na página (Ctrl+F)**: barra de busca própria
        (`FindInPageBar.js`) com contador "N/total" e navegação
        anterior/próximo.

      **Desvio de rota importante:** a implementação original usava a API
      nativa `webContents.findInPage()`, como o item original deste roadmap
      sugeria. Ela nunca funcionou pra conteúdo de `<webview>` nesta versão
      do Electron - testado exaustivamente: (1) evento DOM `found-in-page` na
      própria tag, nunca dispara; (2) via `webContents.fromId()` no processo
      principal (a chamada mais direta possível), o webContents é encontrado
      corretamente (`hasFindInPage: true`, URL certa, não destruído) mas
      `findInPage()` ainda assim nunca retorna resultado; (3) prova decisiva:
      a *mesma* chamada, no webContents da própria janela principal (fora de
      uma webview), funciona perfeitamente. Conclusão: é uma limitação de
      guest view desta versão do Electron, não erro de uso da API. Solução
      final: busca 100% via DOM, injetada na webview com
      `executeJavaScript` (`findInPageScript.js`) - percorre o texto da
      página com `TreeWalker`, envolve cada ocorrência num `<mark>` e navega
      entre eles, sem depender da API nativa quebrada.

      Testado de ponta a ponta com a UI real: abrir a dropdown, clicar em
      "Buscar na página", digitar um termo com 50 ocorrências garantidas →
      contador mostra "1/50" corretamente, 50 `<mark>` de verdade no DOM da
      página; clicar em "próximo" avança pra "2/50"; fechar a barra remove
      todos os `<mark>` (volta a 0). Zoom testado de ponta a ponta também:
      clicar `+` duas vezes na dropdown aplica 120% de verdade
      (`webview.getZoomFactor() === 1.2`) e persiste no localStorage
      corretamente por origem (`{"www.google.com":1.2}`).

- [x] **Histórico de navegação** — lista pesquisável de URLs visitadas, com
      opção de limpar. Cada visita em qualquer webview/aba é gravada no
      processo principal (`HistoryManager.js`, disco em
      `userData/history.json`, limite de 5000 entradas) - centralizado ali
      porque é o único lugar que enxerga toda webview de qualquer
      aba/painel, sem duplicar a lógica em cada `BrowserPanel`. Escuta
      `did-navigate` (grava a entrada), `page-title-updated` e
      `page-favicon-updated` (completam a mesma entrada depois, via um id
      guardado em closure - título e favicon chegam em eventos separados,
      alguns instantes depois da navegação em si). UI: `HistoryModal.js`,
      acessível pelo item "Histórico" (Ctrl+H) na mesma dropdown de
      Zoom/Buscar/Configurações do `ControlsBar.js`, com busca com debounce,
      abrir em nova aba, remover uma entrada ou limpar tudo (com
      confirmação). Ctrl+H segue o mesmo caminho de relay dos outros
      atalhos de navegador (`navigationShortcuts.js` + `useElectronIPC.js`),
      necessário porque o accelerator nativo do Menu do Electron não
      dispara de forma confiável com uma `<webview>` focada.

      Testado de ponta a ponta com a UI real: carregar a página inicial já
      grava 1 entrada; navegar a webview pra uma segunda URL adiciona uma
      nova entrada no topo da lista; buscar por um termo filtra
      corretamente (e um termo que não bate em nada retorna vazio);
      remover uma entrada específica a tira da lista sem afetar as demais;
      abrir "Histórico" pela dropdown mostra o modal de verdade; o botão
      "Limpar histórico" (com Popconfirm) esvazia a lista e mostra o estado
      vazio do antd; o atalho Ctrl+H (com o foco fora da webview) também
      abre o modal.
- [ ] **Favoritos/bookmarks** — salvar, organizar e abrir favoritos rápido.
- [ ] **Modo privado/anônimo** — aba com partition temporária (não
      `persist:webview`), sem histórico nem cookies persistidos.
- [ ] **Bloqueio de pop-ups configurável** — hoje todo pop-up vira navegação
      na mesma aba; decidir se isso deve ser configurável por site.
- [ ] **Importar/exportar favoritos e histórico** — interoperabilidade com
      outros navegadores (formato HTML de bookmarks é o padrão de facto).

## Como priorizar

Ordem sugerida dentro de "Segurança": CSP do shell → assinatura de código.
São itens independentes, então dá pra pular a ordem se algo for mais
urgente.

(O item de revisar o `setWindowOpenHandler` já foi resolvido junto com a
restrição de navegação acima, já que os dois usam o mesmo filtro de
protocolo.)
