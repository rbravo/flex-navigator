# Flex Navigator

*🌐 A flexible and customizable web browser built with Electron and React*

[**English**](#english) | [**Português**](#português)

---

## English

### 🚀 Features

- **🔄 Flexible Layout**: Use FlexLayout React to organize multiple browser instances in any configuration
- **🌐 Real Web Navigation**: Each panel supports complete web navigation with back/forward/refresh controls
- **📑 Dynamic Tabs**: Add as many tabs as you want in each panel
- **🎯 Context Menu**: Right-click for navigation controls, link opening, and developer tools
- **🖥️ Cross-Platform**: Works on Windows, macOS and Linux through Electron
- **🌙 Dark Theme**: Modern interface with dark theme
- **📦 Portable Build**: Generate standalone executable files for easy sharing

### 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/rbravo/flex-navigator.git
cd flex-navigator
```

2. Install dependencies:
```bash
yarn install
```

### 🎮 Usage

#### Development

To run in development mode:
```bash
yarn dev
```

This command automatically starts both React development server and Electron.

#### Production Build

To build the application for distribution:
```bash
yarn dist
```

This generates:
- `dist/Flex Navigator 1.0.0.exe` - Portable executable
- `dist/Flex Navigator Setup 1.0.0.exe` - Installer

### 🎯 Features

#### Navigation
- **URL Bar**: Type URLs or search terms
- **Controls**: Always-visible back, forward and refresh buttons
- **Auto-Detection**: URLs are automatically formatted
- **Integrated Search**: Terms without protocol are directed to Google
- **Context Menu**: Right-click for navigation options and DevTools

#### Layout
- **Resizable Panels**: Drag borders to resize
- **Multiple Tabs**: Each panel can have multiple tabs
- **Visual Focus**: Focused panels show blue border
- **Free Organization**: Organize panels horizontally, vertically or in grid

#### Quick Controls
- **"New Tab" Button**: Adds new tab to panel
- **Preset Buttons**: Quick access to Google, GitHub, YouTube, Stack Overflow
- **Keyboard Shortcuts**: Full support for navigation shortcuts

### 🏗️ Architecture

```
src/
├── components/
│   ├── BrowserPanel.js      # Main browser component
│   └── BrowserPanel.css     # Panel styles
├── App.js                   # Main application component
├── App.css                  # Global styles
└── index.js                 # Entry point
electron.js                  # Electron main process
```

### 🔧 Development

1. **Clone and install**: `git clone` + `yarn install`
2. **Run development**: `yarn dev`
3. **Build for production**: `yarn dist`

### 📦 Technologies

- **Electron 32.0.1 LTS** - Desktop application framework
- **React 19.1.0** - UI library
- **FlexLayout React** - Flexible layout system
- **Ant Design** - UI components
- **electron-builder** - Build and packaging

### 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Português

### 🚀 Características

- **🔄 Layout Flexível**: Use FlexLayout React para organizar múltiplas instâncias do navegador em qualquer configuração
- **🌐 Navegação Web Real**: Cada painel suporta navegação web completa com controles de voltar/avançar/atualizar
- **📑 Tabs Dinâmicas**: Adicione quantas tabs quiser em cada painel
- **🎯 Menu Contextual**: Clique direito para controles de navegação, abertura de links e ferramentas de desenvolvimento
- **🖥️ Multiplataforma**: Funciona no Windows, macOS e Linux através do Electron
- **🌙 Tema Escuro**: Interface moderna com tema escuro
- **📦 Build Portável**: Gere executáveis independentes para fácil compartilhamento

### 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

### 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/rbravo/flex-navigator.git
cd flex-navigator
```

2. Instale as dependências:
```bash
yarn install
```

### 🎮 Uso

#### Desenvolvimento

Para executar em modo de desenvolvimento:
```bash
yarn dev
```

Este comando inicia automaticamente tanto o servidor de desenvolvimento React quanto o Electron.

#### Build de Produção

Para fazer build da aplicação para distribuição:
```bash
yarn dist
```

Isso gera:
- `dist/Flex Navigator 1.0.0.exe` - Executável portável
- `dist/Flex Navigator Setup 1.0.0.exe` - Instalador

### 🎯 Funcionalidades

#### Navegação
- **Barra de URL**: Digite URLs ou termos de busca
- **Controles**: Botões sempre visíveis de voltar, avançar e atualizar
- **Detecção Automática**: URLs são automaticamente formatadas
- **Busca Integrada**: Termos sem protocolo são direcionados para o Google
- **Menu Contextual**: Clique direito para opções de navegação e DevTools

#### Layout
- **Painéis Redimensionáveis**: Arraste as bordas para redimensionar
- **Tabs Múltiplas**: Cada painel pode ter múltiplas tabs
- **Foco Visual**: Painéis focados mostram borda azul
- **Organização Livre**: Organize painéis horizontalmente, verticalmente ou em grid

#### Controles Rápidos
- **Botão "Nova Tab"**: Adiciona nova tab no painel
- **Botões Preset**: Acesso rápido a Google, GitHub, YouTube, Stack Overflow
- **Atalhos de Teclado**: Suporte completo a atalhos para navegação

### 🏗️ Arquitetura

```
src/
├── components/
│   ├── BrowserPanel.js      # Componente principal do navegador
│   └── BrowserPanel.css     # Estilos do painel
├── App.js                   # Componente principal da aplicação
├── App.css                  # Estilos globais
└── index.js                 # Ponto de entrada
electron.js                  # Processo principal do Electron
```

### 🔧 Desenvolvimento

1. **Clone e instale**: `git clone` + `yarn install`
2. **Execute desenvolvimento**: `yarn dev`
3. **Build para produção**: `yarn dist`

### 📦 Tecnologias

- **Electron 32.0.1 LTS** - Framework para aplicações desktop
- **React 19.1.0** - Biblioteca de UI
- **FlexLayout React** - Sistema de layout flexível
- **Ant Design** - Componentes de UI
- **electron-builder** - Build e empacotamento

### 🤝 Contribuindo

1. Faça um Fork do repositório
2. Crie sua branch de feature (`git checkout -b feature/funcionalidade-incrivel`)
3. Commit suas mudanças (`git commit -m 'Adiciona funcionalidade incrível'`)
4. Push para a branch (`git push origin feature/funcionalidade-incrivel`)
5. Abra um Pull Request

### 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ usando React, Electron e FlexLayout**
