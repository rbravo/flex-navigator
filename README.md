# Flex Navigator

Um navegador flexível e personalizável construído com Electron e React, utilizando FlexLayout para organização de janelas em layouts customizáveis.

## 🚀 Características

- **Layout Flexível**: Use FlexLayout React para organizar múltiplas instâncias do navegador em qualquer configuração
- **Navegação Real**: Cada painel suporta navegação web completa com controles de voltar/avançar/atualizar
- **Tabs Dinâmicas**: Adicione quantas tabs quiser em cada painel
- **Interface Focada**: Controles de navegação aparecem apenas quando o painel está focado
- **Multiplataforma**: Funciona no Windows, macOS e Linux através do Electron
- **Tema Escuro**: Interface moderna com tema escuro

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd flex-navigator
```

2. Instale as dependências:
```bash
npm install
```

## 🎮 Uso

### Desenvolvimento

Para executar em modo de desenvolvimento:

```bash
# Inicie o React (terminal 1)
npm start

# Em outro terminal, inicie o Electron (terminal 2)
npx electron .
```

Ou use o comando combinado:
```bash
npm run dev
```

### Produção

Para fazer build da aplicação:

```bash
npm run build
npm run dist
```

## 🎯 Funcionalidades

### Navegação
- **Barra de URL**: Digite URLs ou termos de busca
- **Controles**: Botões de voltar, avançar e atualizar
- **Detecção Automática**: URLs são automaticamente formatadas
- **Busca Integrada**: Termos sem protocolo são direcionados para o Google

### Layout
- **Painéis Redimensionáveis**: Arraste as bordas para redimensionar
- **Tabs Múltiplas**: Cada painel pode ter múltiplas tabs
- **Foco Visual**: Painéis focados mostram borda azul e controles
- **Organização Livre**: Organize painéis horizontalmente, verticalmente ou em grid

### Controles Rápidos
- **Botão "+Nova Tab"**: Adiciona nova tab no painel
- **Botões Preset**: Acesso rápido a Google, GitHub, YouTube, Stack Overflow
- **Atalhos de Teclado**: Suporte a atalhos para navegação

## 🏗️ Arquitetura

```
src/
├── components/
│   ├── BrowserPanel.js      # Componente principal do navegador
│   ├── BrowserPanel.css     # Estilos do painel
│   ├── TabActions.js        # Componente de ações rápidas
│   └── TabActions.css       # Estilos das ações
├── App.js                   # Componente principal da aplicação
├── App.css                  # Estilos globais
└── index.js                 # Ponto de entrada
main.js                      # Processo principal do Electron
```

## 🔧 Como Usar

1. **Execute o projeto**: `npm start` para React + `npx electron .` para Electron
2. **Foque um painel**: Clique em qualquer painel para ver os controles
3. **Adicione tabs**: Use o botão "+" ou os botões de preset
4. **Redimensione**: Arraste as bordas entre painéis
5. **Navegue**: Use a barra de URL ou botões de navegação

## 🚦 Status do Projeto

### ✅ Implementado
- [x] Layout flexível com FlexLayout React
- [x] Painéis de navegador com foco/desfoco
- [x] Controles de navegação (voltar, avançar, atualizar)
- [x] Adição dinâmica de tabs
- [x] Interface com tema escuro
- [x] Botões de acesso rápido
- [x] Detecção de ambiente (Electron/Browser)
- [x] Menu de aplicação

### 🔄 Planejado
- [ ] Favoritos/Bookmarks
- [ ] Histórico de navegação
- [ ] Salvamento de layout
- [ ] Configurações de usuário

## 📞 Suporte

Para problemas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando React, Electron e FlexLayout**

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
