# Flex Navigator

*🌐 A flexible and customizable web browser built with Electron and React*

### 🚀 Features

- **🔄 Flexible Layout**: Use FlexLayout React to organize multiple browser instances in any configuration
- **🌐 Real Web Navigation**: Each panel supports complete web navigation with back/forward/refresh controls
- **📑 Dynamic Tabs**: Add as many tabs as you want in each panel
- **🎯 Context Menu**: Right-click for navigation controls, link opening, and developer tools
- **🖥️ Cross-Platform**: Works on Windows, macOS and Linux through Electron
- **🌙 Dark Theme**: Modern interface with dark theme
- **📦 Portable Build**: Generate standalone executable files for easy sharing

### 📋 Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### 🛠️ Installation

1. **Clone the repository:**
```bash
git clone https://github.com/rbravo/flex-navigator.git
cd flex-navigator
```

2. **Install dependencies:**
```bash
npm install
```

### 🎮 Usage

#### Development Mode

To run the application in development mode:
```bash
npm run dev
```

This command automatically starts both the React development server and Electron application.

#### Production Build

To build the application for distribution:
```bash
npm run dist
```

This generates distributable files:
- **Windows**: `dist/Flex Navigator Setup 1.0.0.exe` (installer) and `dist/Flex Navigator 1.0.0.exe` (portable)
- **macOS**: `dist/Flex Navigator-1.0.0.dmg`
- **Linux**: `dist/Flex Navigator-1.0.0.AppImage`

### 🎯 Key Features

#### 🌐 Advanced Navigation
- **Smart URL Bar**: Automatically detects URLs and search terms
- **Navigation Controls**: Persistent back, forward, and refresh buttons
- **Integrated Search**: Non-URL terms are automatically searched on Google
- **Context Menus**: Right-click for advanced navigation options and DevTools
- **Keyboard Shortcuts**: Full support for standard browser shortcuts

#### 📱 Flexible Layout System
- **Resizable Panels**: Drag panel borders to customize layout
- **Multiple Tabs**: Each panel supports unlimited tabs
- **Visual Focus Indicator**: Active panels highlighted with blue borders
- **Free Organization**: Arrange panels horizontally, vertically, or in complex grids
- **Persistent Layout**: Your layout configuration is automatically saved

#### ⚡ Quick Access Controls
- **New Tab Button**: Instantly add tabs to any panel
- **Preset Shortcuts**: One-click access to Google, GitHub, YouTube, Stack Overflow
- **Panel Management**: Easy creation and deletion of browser panels
- **Webview Integration**: Full web browsing capabilities in each panel

### 🏗️ Project Architecture

Flex Navigator follows a clean, modular architecture that separates concerns and promotes maintainability:

```
src/
├── components/                # Reusable UI components
│   ├── BrowserPanel/         # Main browser functionality
│   │   ├── index.js          # Main browser component (orchestrates all functionality)
│   │   ├── BrowserPanel.css  # Component-specific styles
│   │   ├── ControlsBar.js    # Navigation controls (back, forward, refresh, URL bar)
│   │   ├── WebContent.js     # Webview management and tab handling
│   │   └── LoadingBar.js     # Loading progress indicator
│   └── utils/                # Shared utilities and helpers
│       ├── theme.js          # Dark theme configuration for Ant Design
│       └── urlUtils.js       # URL validation and processing utilities
├── electron/                 # Electron main process modules
│   ├── window/               # Window creation and management
│   ├── menu/                 # Application menu system
│   ├── ipc/                  # Inter-process communication handlers
│   └── utils/                # Electron-specific utilities
├── App.js                    # Root React component with FlexLayout setup
├── App.css                   # Global application styles
└── index.js                  # React application entry point
electron.js                   # Electron main process entry point
```

#### 🔧 Architecture Benefits
- **Modular Design**: Each component has a single responsibility
- **Easy Maintenance**: Changes are isolated to specific modules
- **Scalable Structure**: Easy to add new features without affecting existing code
- **Clear Separation**: UI components separate from business logic and Electron processes

### 🔧 Development

#### Quick Start
1. **Clone and install**: `git clone <repo-url>` → `npm install`
2. **Start development**: `npm run dev`
3. **Build for production**: `npm run dist`

#### Development Scripts
- `npm start` - Start React development server only
- `npm run dev` - Start both React and Electron in development mode
- `npm run build` - Build React app for production
- `npm run dist` - Create distributable Electron packages
- `npm test` - Run test suite

#### Project Structure Guidelines
- Keep components small and focused on a single responsibility
- Use the `utils/` folder for shared helper functions
- Electron modules should be organized by functionality (window, menu, ipc)
- Follow React hooks patterns for state management

### 📦 Tech Stack

#### Core Technologies
- **[Electron 32.0.1 LTS](https://electronjs.org/)** - Cross-platform desktop application framework
- **[React 19.1.0](https://react.dev/)** - Modern UI library with hooks and components
- **[FlexLayout React 0.8.17](https://github.com/caplin/FlexLayout)** - Advanced docking layout manager
- **[Ant Design 5.26.4](https://ant.design/)** - Enterprise-class UI design language and components

#### Build & Development Tools
- **[electron-builder](https://www.electron.build/)** - Complete solution to package and build Electron apps
- **[concurrently](https://github.com/open-cli-tools/concurrently)** - Run multiple commands concurrently
- **[Create React App](https://create-react-app.dev/)** - Set up modern web app by running one command

#### Key Dependencies
- **webview-tag** - Secure, sandboxed web content rendering
- **ipcRenderer/ipcMain** - Safe communication between processes
- **CSS Modules** - Scoped styling system

### 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding guidelines
4. **Test thoroughly**: Ensure your changes work as expected
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes clearly

#### Development Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test your changes on multiple operating systems if possible
- Update documentation if you add new features

### 🚀 Roadmap

#### Planned Features
- **Session Management**: Save and restore browser sessions
- **Themes**: Light theme and custom theme support
- **Extensions**: Basic plugin system for additional functionality
- **History**: Browse through navigation history
- **Downloads**: Built-in download manager

#### Version History
- **v1.0.0**: Initial release with core browsing functionality
- **v1.1.0** (Planned): Bookmarks and session management
- **v1.2.0** (Planned): Themes and customization options

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed with ❤️ using React, Electron and FlexLayout**
