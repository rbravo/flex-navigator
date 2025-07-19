# Contributing to Flex Navigator

Thank you for your interest in contributing to Flex Navigator! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/flex-navigator.git
   cd flex-navigator
   ```
3. **Install dependencies**:
   ```bash
   yarn install
   ```
4. **Start development**:
   ```bash
   yarn dev
   ```

## 🔧 Development Guidelines

### Code Style
- Follow existing code patterns and styling
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

### Testing
- Test your changes in both development (`yarn dev`) and production (`yarn dist`) modes
- Ensure the application works on your target platform
- Test context menu functionality and navigation features

### Commits
- Use clear and descriptive commit messages
- Start commit messages with a verb (Add, Fix, Update, etc.)
- Reference issues when applicable: `Fixes #123`

## 📝 Pull Request Process

1. **Create a feature branch** from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following the guidelines above
3. **Test thoroughly** to ensure nothing is broken
4. **Commit your changes**:
   ```bash
   git commit -m "Add your descriptive commit message"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Screenshots/GIFs if UI changes are involved
   - Reference to any related issues

## 🐛 Bug Reports

When reporting bugs, please include:
- **Operating System** and version
- **Node.js version** (`node --version`)
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Console logs** if there are any errors

## 💡 Feature Requests

For feature requests, please:
- Check if the feature already exists or is planned
- Explain the **use case** and **benefits**
- Provide **mockups or examples** if applicable
- Consider implementing it yourself and submitting a PR

## 🏗️ Project Structure

```
src/
├── components/
│   ├── BrowserPanel.js      # Main browser component
│   └── BrowserPanel.css     # Panel styles
├── App.js                   # Main application component
├── App.css                  # Global styles
└── index.js                 # Entry point
electron.js                  # Electron main process
package.json                 # Dependencies and scripts
electron-builder.json        # Build configuration
```

## 📦 Technologies Used

- **Electron 32.0.1 LTS** - Desktop application framework
- **React 19.1.0** - UI library
- **FlexLayout React** - Flexible layout system
- **Ant Design** - UI components
- **electron-builder** - Build and packaging

## 🤝 Community

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Provide constructive feedback

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Flex Navigator better! 🚀
