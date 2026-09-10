const { spawn } = require('child_process');
const electronPath = require('electron');

const { ELECTRON_RUN_AS_NODE, ...electronEnvironment } = process.env;
const electronProcess = spawn(electronPath, ['.'], {
  cwd: process.cwd(),
  env: electronEnvironment,
  stdio: 'inherit'
});

electronProcess.on('error', (error) => {
  console.error('Failed to start Electron:', error);
  process.exit(1);
});

electronProcess.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
