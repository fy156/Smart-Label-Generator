const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const archiver = require('archiver');

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

// 处理文件保存（支持 Buffer/Array）
ipcMain.handle('save-file', async (event, { data, fileName, filters, folderPath }) => {
  let filePath;
  
  // 清理文件名中的非法字符
  const safeFileName = fileName.replace(/[<>:"\/\\|?*]/g, '_');
  
  // 如果提供了 folderPath，直接拼接路径；否则显示保存对话框
  if (folderPath) {
    filePath = path.join(folderPath, safeFileName);
  } else {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: safeFileName,
      filters: filters || [{ name: 'All Files', extensions: ['*'] }]
    });
    if (result.canceled) return { success: false };
    filePath = result.filePath;
  }

  try {
    // 支持 Array/Uint8Array/ArrayBuffer
    const buffer = Buffer.from(data);
    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath: filePath };
  } catch (error) {
    console.error('保存文件失败:', error, '路径:', filePath);
    return { success: false, error: error.message, filePath: filePath };
  }
});

// 选择文件夹
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: '选择批量导出的保存文件夹'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, folderPath: result.filePaths[0] };
  }
  return { success: false };
});

// 打开文件夹（在文件管理器中显示）
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 处理文件打开（Excel导入）
ipcMain.handle('open-file', async (event, { filters }) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    try {
      // 在主进程中解析 Excel
      const workbook = XLSX.readFile(filePath);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      return { 
        success: true, 
        filePath: filePath,
        data: jsonData  // 直接返回解析后的 JSON 数据
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false };
});

// 处理 Excel 导出
ipcMain.handle('export-excel', async (event, { data, fileName, typeOptions }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: fileName,
    filters: [{ name: 'Excel 文件', extensions: ['xlsx'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      
      // 如果有类型选项，添加下拉列表到"类型"列（B列）
      if (typeOptions && typeOptions.length > 0) {
        // 去重并排序
        const uniqueTypes = [...new Set(typeOptions)].sort();
        
        // 创建数据验证范围（B2到B100）
        const dv = {
          sqref: 'B2:B100',
          type: 'list',
          formula1: uniqueTypes.join(','),
          showDropDown: true,
          allowBlank: true
        };
        
        // XLSX 需要特殊方式添加数据验证
        if (!ws['!dataValidation']) {
          ws['!dataValidation'] = [];
        }
        ws['!dataValidation'].push(dv);
      }
      
      XLSX.utils.book_append_sheet(wb, ws, '标签数据');
      XLSX.writeFile(wb, result.filePath);
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false };
});

// 创建 ZIP 压缩包（图片批量导出）
ipcMain.handle('create-zip', async (event, { files, folderPath, zipName }) => {
  const zipPath = path.join(folderPath, zipName);
  
  try {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 6 } }); // 标准压缩级别
    
    return new Promise((resolve, reject) => {
      // 监听完成事件
      output.on('close', () => {
        console.log(`[create-zip] ZIP 创建完成: ${zipPath}, 大小: ${archive.pointer()} bytes`);
        resolve({ 
          success: true, 
          filePath: zipPath, 
          size: archive.pointer(),
          count: files.length
        });
      });
      
      // 监听错误事件
      output.on('error', (err) => {
        console.error('[create-zip] 输出流错误:', err);
        reject({ success: false, error: err.message });
      });
      
      archive.on('error', (err) => {
        console.error('[create-zip] Archiver 错误:', err);
        reject({ success: false, error: err.message });
      });
      
      archive.on('warning', (err) => {
        console.warn('[create-zip] Archiver 警告:', err);
        if (err.code !== 'ENOENT') {
          reject({ success: false, error: err.message });
        }
      });

      // 连接 archiver 到输出流
      archive.pipe(output);
      
      // 添加文件到 ZIP
      console.log(`[create-zip] 开始添加 ${files.length} 个文件到 ZIP`);
      files.forEach((file, index) => {
        try {
          const buffer = Buffer.from(file.buffer);
          archive.append(buffer, { name: file.name });
          console.log(`[create-zip] 已添加文件 ${index + 1}/${files.length}: ${file.name}, 大小: ${buffer.length} bytes`);
        } catch (err) {
          console.error(`[create-zip] 添加文件失败 ${file.name}:`, err);
        }
      });
      
      // 完成归档
      console.log('[create-zip] 调用 finalize...');
      archive.finalize();
    });
  } catch (error) {
    console.error('[create-zip] 异常:', error);
    return { success: false, error: error.message };
  }
});
