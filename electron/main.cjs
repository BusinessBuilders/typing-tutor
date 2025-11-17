const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { initializeDatabase, query, execute, closeDatabase } = require('./database.cjs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const isDevelopment = process.env.NODE_ENV === 'development';

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    show: false, // Don't show until ready
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // Load the app
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appUrl = isDevelopment ? 'http://localhost:3000' : 'file://';
    if (!url.startsWith(appUrl)) {
      event.preventDefault();
    }
  });

  // Prevent opening new windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });
}

// App lifecycle events
app.whenReady().then(() => {
  // Initialize database
  try {
    initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Disable web view creation
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    event.preventDefault();
  });
});

// IPC Handlers (for future use with preload script)
ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

// Database IPC Handlers
ipcMain.handle('db:query', async (event, sql, params) => {
  try {
    return query(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
});

ipcMain.handle('db:execute', async (event, sql, params) => {
  try {
    return execute(sql, params);
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
});

// Handle app before quit
app.on('before-quit', () => {
  // Close database connection
  closeDatabase();
});
