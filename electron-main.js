import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Disable Electron default native menu to prevent intercepting web app keydown shortcuts (Ctrl+O, Ctrl+S, etc.)
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: 'Open Acrobat - Linux Edition',
    icon: path.join(__dirname, 'public/favicon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
    backgroundColor: '#121216',
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
