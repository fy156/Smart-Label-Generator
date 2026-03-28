const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    title: '智能标签生成器',
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // 加载应用
  const indexPath = path.join(__dirname, '../src/index.html');
  mainWindow.loadFile(indexPath);

  // 窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 应用就绪
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理文件保存
ipcMain.handle('save-file', async (event, { data, fileName, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: fileName,
    filters: filters || [{ name: 'All Files', extensions: ['*'] }]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, data);
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});
