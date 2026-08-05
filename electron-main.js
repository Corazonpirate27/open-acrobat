const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Adobe Acrobat Clone - Linux Edition',
    icon: path.join(__dirname, 'public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  // Load production build or dev server
  const devUrl = 'http://localhost:5173';
  win.loadURL(devUrl).catch(() => {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  });
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
