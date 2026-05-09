const { app, BrowserWindow } = require('electron');
const path = require('path');
const server = require('./server.js'); // Assuming we'll modify server.js to export the express app

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'ApliArte SketchyBar',
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, 'public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the local Express server
  mainWindow.loadURL(`http://localhost:${process.env.PORT || 2999}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
