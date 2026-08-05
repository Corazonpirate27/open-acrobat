import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: 'Open Acrobat - Linux Edition',
    icon: path.join(__dirname, 'public/favicon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false, // Allows webContents executeJavaScript direct integration
      sandbox: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#121216',
  });

  // Intercept all keyboard shortcuts at native Electron window level on Fedora Linux
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      const isControl = input.control || input.meta;
      const key = (input.key || '').toLowerCase();

      let action = null;
      if (isControl && key === 'o') action = 'open';
      else if (isControl && key === 's') action = 'save';
      else if (isControl && key === 'p') action = 'print';
      else if (isControl && (key === '=' || key === '+')) action = 'zoom-in';
      else if (isControl && key === '-') action = 'zoom-out';
      else if (isControl && key === '0') action = 'zoom-reset';
      else if (isControl && key === 'z') action = 'undo';
      else if (!isControl && key === 'h') action = 'hand';
      else if (!isControl && key === 'v') action = 'select';
      else if (!isControl && key === 't') action = 'text';
      else if (!isControl && key === 'p') action = 'draw';
      else if (!isControl && key === 's') action = 'stamp';
      else if (!isControl && key === 'm') action = 'merge';
      else if (!isControl && key === 'w') action = 'watermark';
      else if (!isControl && (key === '?' || key === '/')) action = 'shortcuts';
      else if (!isControl && key === 'escape') action = 'escape';
      else if (!isControl && (key === 'delete' || key === 'backspace')) action = 'delete';

      if (action) {
        win.webContents.executeJavaScript(`window.triggerAcrobatShortcut && window.triggerAcrobatShortcut("${action}")`);
      }
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173').catch(() => {
      win.loadFile(path.join(__dirname, 'dist/index.html'));
    });
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
