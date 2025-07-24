# Auto-Update Documentation

## Configuração do Auto-Update

O Flex Navigator agora possui funcionalidade de auto-update integrada usando o `electron-updater`. Esta funcionalidade permite que o aplicativo se atualize automaticamente quando novas versões são disponibilizadas no GitHub.

## Como Funciona

### 1. Verificação Automática
- O aplicativo verifica por atualizações automaticamente 3 segundos após inicializar
- As verificações são feitas consultando as releases do repositório GitHub

### 2. Verificação Manual
- Os usuários podem verificar manualmente por atualizações através do menu: **Ajuda > Verificar Atualizações**

### 3. Processo de Atualização
1. **Verificação**: O app verifica se há uma nova versão disponível
2. **Notificação**: Se encontrada, exibe um diálogo perguntando se o usuário deseja baixar
3. **Download**: Se aceito, o download da atualização é iniciado em background
4. **Instalação**: Após o download, solicita permissão para reiniciar e instalar

## Configurações

### electron-builder.json
```json
{
  "publish": {
    "provider": "github",
    "owner": "rbravo",
    "repo": "flex-navigator",
    "private": false
  }
}
```

### Repositório GitHub
- O repositório deve estar configurado para publicar releases
- As releases devem incluir os arquivos de instalação (.exe, .dmg, .AppImage)

## Comandos de Build e Publicação

### Para publicar uma nova versão:
```bash
# 1. Incrementar versão no package.json
npm version patch  # ou minor, major

# 2. Build e publicar
npm run distpub
```

### Para build local sem publicar:
```bash
npm run dist
```

## Variáveis de Ambiente Necessárias

Para publicar releases, você precisa configurar:

```bash
# GitHub Personal Access Token com permissões de repo
GH_TOKEN=your_github_token
```

## Logs e Debug

O auto-updater gera logs detalhados no console:
- 🔍 Verificando por atualizações
- ✅ Atualização disponível
- ❌ Nenhuma atualização disponível
- ⬬ Progresso do download
- ✅ Atualização baixada

## Estrutura de Arquivos

```
src/electron/utils/
  └── autoUpdater.js    # Gerenciador de auto-update
electron.js             # Configuração principal
electron-builder.json   # Configurações de build
```

## Segurança

- As atualizações são verificadas usando assinatura digital
- Apenas releases oficiais do repositório GitHub são aceitas
- O usuário sempre tem controle sobre quando instalar as atualizações

## Troubleshooting

### Erro "No published versions on GitHub"
- Certifique-se de que há releases publicadas no GitHub
- Verifique se o repositório e owner estão corretos na configuração

### Erro de permissão durante instalação
- No Windows, pode ser necessário executar como administrador
- No macOS, certifique-se de que o app está assinado

### Updates não aparecem
- Verifique se a versão local é diferente da versão no GitHub
- Confirme que o GitHub token tem as permissões corretas

## Como Testar o Auto-Update

### 1. Preparação para Teste
```bash
# Build do projeto
npm run build

# Build do Electron (sem publicar)
npm run dist
```

### 2. Simulando uma Nova Versão
1. Incremente a versão no `package.json`
2. Crie uma release no GitHub com a nova versão
3. Execute o app antigo - ele deve detectar a nova versão

### 3. Testando em Desenvolvimento
- O auto-update é desabilitado em modo desenvolvimento
- Use `npm run electron` para testar a interface
- Para testar updates reais, use o build de produção

### 4. Interface de Usuário
- **Menu**: Ajuda > Verificar Atualizações
- **Configurações**: Pode habilitar/desabilitar auto-update
- **Notificações**: Aparecem no canto da tela durante o processo

## Implementação Técnica

### Componentes Principais
- `AutoUpdaterManager`: Lógica principal do auto-update
- `UpdateManager`: Componente React que gerencia UI
- `UpdateNotificationManager`: Gerencia notificações visuais
- `useAutoUpdater`: Hook para integração com React

### Fluxo de Dados
1. Electron detecta update disponível
2. Envia evento IPC para o renderer
3. React atualiza estado e mostra notificação
4. Usuário interage através da UI
5. Comandos retornam para Electron via IPC
