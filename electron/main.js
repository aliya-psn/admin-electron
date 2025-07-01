import {
  app,
  BrowserWindow,
  ipcMain,
  session,
  screen,
  clipboard,
  dialog,
  shell,
  nativeImage,
  Notification
} from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import mysql from 'mysql2';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// 创建 MySQL 连接池
const mysqlPool = mysql.createPool({
  host: '192.168.179.129',
  user: 'root',
  password: 'Swhysc@123456@',
  database: 'cov-test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createWindow() {
  // 获取主屏幕的尺寸
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  // 设置窗口大小为屏幕的 80%
  const windowWidth = Math.floor(screenWidth * 0.9);
  const windowHeight = Math.floor(screenHeight * 0.9);

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    // frame: false, // 隐藏窗口边框
    // 设置窗口最小尺寸为屏幕的 50%
    minWidth: Math.floor(screenWidth * 0.5),
    minHeight: Math.floor(screenHeight * 0.5),
    // 窗口居中显示
    center: true,
    // 设置窗口图标
    icon: path.join(__dirname, '../build/icon.png'),
    // 设置窗口标题
    title: 'Swhy-FE',
    // 窗口样式设置
    show: true, // 先隐藏窗口，等加载完成后再显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载应用
  if (isDev) {
    // 开发模式下，使用 webpack-dev-server 启动应用
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // 打包应用
    const indexPath = path.join(__dirname, '../dist/index.html');

    // 检查文件是否存在
    try {
      await fs.promises.access(indexPath);
      await mainWindow.loadFile(indexPath);
    } catch (error) {
      console.error('Failed to load index file:', error);
      // 尝试加载备用路径
      const altPath = path.join(__dirname, 'dist/index.html');
      try {
        await fs.promises.access(altPath);
        await mainWindow.loadFile(altPath);
      } catch (altError) {
        console.error('Failed to load from alternative path:', altError);
        // 显示错误页面
        mainWindow.loadURL(
          `data:text/html,<html><body><h1>应用加载失败</h1><p>错误: ${error.message}</p><p>路径: ${indexPath}</p></body></html>`
        );
      }
    }
  }

  // 添加页面加载事件监听
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', { errorCode, errorDescription, validatedURL });
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
    // mainWindow.webContents.openDevTools(); // 打开开发者工具
  });

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    console.log('ready-to-show');
    mainWindow.show();
  });
}

// 处理开发工具开关
ipcMain.on('toggle-devtools', (event, shouldOpen) => {
  if (shouldOpen) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.closeDevTools();
  }
});

// 文件操作相关的 IPC 处理器
ipcMain.handle('file-operations', async (event, operation, ...args) => {
  try {
    switch (operation) {
      case 'read': {
        const data = await fs.promises.readFile(args[0], args[1] || 'utf8');
        return { success: true, data };
      }
      case 'write': {
        await fs.promises.writeFile(args[0], args[1], args[2] || 'utf8');
        return { success: true };
      }
      case 'exists': {
        await fs.promises.access(args[0]);
        return { success: true, exists: true };
      }
      case 'mkdir': {
        await fs.promises.mkdir(args[0], { recursive: true });
        return { success: true };
      }
      case 'readdir': {
        const files = await fs.promises.readdir(args[0]);
        return { success: true, files };
      }
      case 'stat': {
        const stats = await fs.promises.stat(args[0]);
        return { success: true, stats };
      }
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 系统信息相关的 IPC 处理器
ipcMain.handle('system-info', async (event, operation, ..._args) => {
  try {
    switch (operation) {
      case 'get-all': {
        return {
          success: true,
          data: {
            platform: os.platform(),
            arch: os.arch(),
            version: os.version(),
            release: os.release(),
            hostname: os.hostname(),
            homedir: os.homedir(),
            tmpdir: os.tmpdir(),
            cpus: os.cpus(),
            totalmem: os.totalmem(),
            freemem: os.freemem(),
            uptime: os.uptime(),
            networkInterfaces: os.networkInterfaces(),
            userInfo: os.userInfo(),
            loadavg: os.loadavg(),
            type: os.type(),
            machine: os.machine(),
            endianness: os.endianness()
          }
        };
      }
      case 'get-memory': {
        return {
          success: true,
          data: {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem(),
            percentage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2)
          }
        };
      }
      case 'get-cpu': {
        return {
          success: true,
          data: {
            cpus: os.cpus(),
            loadavg: os.loadavg()
          }
        };
      }
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 剪贴板操作
ipcMain.handle('clipboard-operations', async (event, operation, ...args) => {
  try {
    switch (operation) {
      case 'read-text': {
        return { success: true, data: clipboard.readText() };
      }
      case 'write-text': {
        clipboard.writeText(args[0]);
        return { success: true };
      }
      case 'read-html': {
        return { success: true, data: clipboard.readHTML() };
      }
      case 'write-html': {
        clipboard.writeHTML(args[0]);
        return { success: true };
      }
      case 'read-image': {
        const image = clipboard.readImage();
        return { success: true, data: image.toDataURL() };
      }
      case 'write-image': {
        const image = nativeImage.createFromDataURL(args[0]);
        clipboard.writeImage(image);
        return { success: true };
      }
      case 'clear': {
        clipboard.clear();
        return { success: true };
      }
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 对话框操作
ipcMain.handle('dialog-operations', async (event, operation, ...args) => {
  try {
    switch (operation) {
      case 'open-file': {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: ['openFile'],
          filters: args[0] || [
            { name: '所有文件', extensions: ['*'] },
            { name: '文本文件', extensions: ['txt', 'md', 'json'] },
            { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
          ]
        });
        return { success: !result.canceled, data: result.filePaths };
      }
      case 'save-file': {
        const result = await dialog.showSaveDialog(mainWindow, {
          filters: args[0] || [
            { name: '所有文件', extensions: ['*'] },
            { name: '文本文件', extensions: ['txt'] },
            { name: 'JSON 文件', extensions: ['json'] }
          ]
        });
        return { success: !result.canceled, data: result.filePath };
      }
      case 'open-directory': {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: ['openDirectory']
        });
        return { success: !result.canceled, data: result.filePaths };
      }
      case 'message-box': {
        const result = await dialog.showMessageBox(mainWindow, {
          type: args[0] || 'info',
          title: args[1] || '提示',
          message: args[2] || '消息内容',
          detail: args[3] || '',
          buttons: args[4] || ['确定', '取消'],
          defaultId: args[5] || 0,
          cancelId: args[6] || 1
        });
        return { success: true, data: { response: result.response, checkboxChecked: result.checkboxChecked } };
      }
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 系统通知
ipcMain.handle('notification-operations', async (event, operation, ...args) => {
  try {
    switch (operation) {
      case 'show': {
        if (Notification.isSupported()) {
          const notification = new Notification({
            title: args[0] || '通知',
            body: args[1] || '通知内容',
            icon: args[2] || undefined,
            silent: args[3] || false,
            timeoutType: args[4] || 'default'
          });

          notification.on('click', () => {
            event.sender.send('notification-clicked', args[5] || 'default');
          });

          notification.on('close', () => {
            event.sender.send('notification-closed', args[5] || 'default');
          });

          notification.show();
          return { success: true };
        } else {
          return { success: false, error: '系统不支持通知' };
        }
      }
      case 'is-supported': {
        return { success: true, data: Notification.isSupported() };
      }
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 外部应用操作
ipcMain.handle('external-operations', async (event, operation, ...args) => {
  try {
    switch (operation) {
      case 'open-external': {
        await shell.openExternal(args[0]);
        return { success: true };
      }
      case 'open-path': {
        await shell.openPath(args[0]);
        return { success: true };
      }
      case 'show-item-in-folder': {
        shell.showItemInFolder(args[0]);
        return { success: true };
      }
      case 'beep': {
        shell.beep();
        return { success: true };
      }
      case 'write-shortcut-link': {
        const result = await shell.writeShortcutLink(args[0], args[1]);
        return { success: true, data: result };
      }
      case 'read-shortcut-link': {
        const result = await shell.readShortcutLink(args[0]);
        return { success: true, data: result };
      }
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 窗口操作
ipcMain.handle('window-operations', async (event, operation, ...args) => {
  try {
    switch (operation) {
      case 'minimize': {
        mainWindow.minimize();
        return { success: true };
      }
      case 'maximize': {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        return { success: true };
      }
      case 'close': {
        mainWindow.close();
        return { success: true };
      }
      case 'set-size': {
        mainWindow.setSize(args[0], args[1]);
        return { success: true };
      }
      case 'set-position': {
        mainWindow.setPosition(args[0], args[1]);
        return { success: true };
      }
      case 'center': {
        mainWindow.center();
        return { success: true };
      }
      case 'set-title': {
        mainWindow.setTitle(args[0]);
        return { success: true };
      }
      case 'get-bounds': {
        const bounds = mainWindow.getBounds();
        return { success: true, data: bounds };
      }
      case 'set-bounds': {
        mainWindow.setBounds(args[0]);
        return { success: true };
      }
      case 'get-screen-size': {
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
        return { success: true, data: { width: screenWidth, height: screenHeight } };
      }
      case 'restore-default-size': {
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
        const windowWidth = Math.floor(screenWidth * 0.9);
        const windowHeight = Math.floor(screenHeight * 0.9);
        mainWindow.setSize(windowWidth, windowHeight);
        mainWindow.center();
        return { success: true, data: { width: windowWidth, height: windowHeight } };
      }
      default:
        return { success: false, error: '未知操作' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 暴露 mysql-query 接口
ipcMain.handle('mysql-query', async (event, sql, params) => {
  return new Promise((resolve, reject) => {
    mysqlPool.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
});

// 支持执行 cmd 命令并返回结果
ipcMain.handle('exec-cmd', async (event, command) => {
  return new Promise(resolve => {
    exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout,
        stderr: stderr,
        error: error ? error.message : null
      });
    });
  });
});

/** 存储到 cookie 相关 */
const cookieUrl = 'http://localhost';
// 设置 Cookie
ipcMain.handle('set-cookie', async (event, { name, value }) => {
  await session.defaultSession.cookies.set({
    url: cookieUrl,
    name,
    value,
    path: '/'
  });
  return true;
});

// 获取 Cookie
ipcMain.handle('get-cookie', async (event, name) => {
  const cookies = await session.defaultSession.cookies.get({ name, url: cookieUrl });
  return cookies.length ? cookies[0].value : null;
});

// 删除 Cookie
ipcMain.handle('remove-cookie', async (event, name) => {
  await session.defaultSession.cookies.remove(cookieUrl, name);
  return true;
});
/** 存储到 cookie 相关结束 */

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
