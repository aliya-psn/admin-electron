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
import { logger } from './logger.js';
import { databaseConfig, healthCheckConfig } from './config/database.js';
import { config } from './config/environment.js';
import { runAppiumTask } from './appium/runner.js';
import { takeScreenshot, getScreenshotsList, deleteScreenshot } from './minicap/screenshot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

// 自动设置 ANDROID_HOME/ANDROID_SDK_ROOT 环境变量
const androidSdkPath = path.join(os.homedir(), 'Library', 'Android', 'sdk');
process.env.ANDROID_HOME = androidSdkPath;
process.env.ANDROID_SDK_ROOT = androidSdkPath;
process.env.PATH = process.env.PATH + ':' + path.join(androidSdkPath, 'platform-tools');

let mainWindow;

// 创建 MySQL 连接池
const mysqlPool = mysql.createPool({
  ...databaseConfig.mysql
});

// 数据库连接健康检查
async function checkDatabaseConnection() {
  try {
    const promisePool = mysqlPool.promise();
    await promisePool.execute('SELECT 1 as test');
    logger.log('数据库连接正常');
    return true;
  } catch (error) {
    logger.error('数据库连接失败:', error.message);
    return false;
  }
}

// 启动时检查数据库连接
checkDatabaseConnection();

// 定期检查数据库连接
setInterval(checkDatabaseConnection, healthCheckConfig.interval);

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
    title: config.app.title,
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
      logger.error('Failed to load index file:', error);
      // 尝试加载备用路径
      const altPath = path.join(__dirname, 'dist/index.html');
      try {
        await fs.promises.access(altPath);
        await mainWindow.loadFile(altPath);
      } catch (altError) {
        logger.error('Failed to load from alternative path:', altError);
        // 显示错误页面
        mainWindow.loadURL(
          `data:text/html,<html><body><h1>应用加载失败</h1><p>错误: ${error.message}</p><p>路径: ${indexPath}</p></body></html>`
        );
      }
    }
  }

  // 添加页面加载事件监听
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    logger.error('页面加载失败:', { errorCode, errorDescription, validatedURL });
  });

  mainWindow.webContents.on('did-finish-load', () => {
    logger.log('页面加载成功');
    // mainWindow.webContents.openDevTools(); // 打开开发者工具
  });

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    logger.log('窗口准备完成，开始显示');
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
ipcMain.handle('mysql-query', async (event, sql, params = []) => {
  // 参数验证
  if (!sql || typeof sql !== 'string') {
    throw new Error('SQL 语句不能为空且必须是字符串');
  }

  if (!Array.isArray(params)) {
    throw new Error('参数必须是数组类型');
  }

  logger.log('执行 SQL 查询:', {
    sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
    paramsLength: params.length
  });

  try {
    // 使用 Promise 化的 mysql2 接口
    const promisePool = mysqlPool.promise();
    const [results, fields] = await promisePool.execute(sql, params);

    logger.log('SQL 查询成功，返回 ' + (Array.isArray(results) ? results.length : 1) + ' 条记录');
    return results;
  } catch (error) {
    // 详细的错误日志
    logger.error('数据库查询失败:', {
      sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });

    // 抛出错误，让渲染进程处理
    throw error;
  }
});

// 获取数据库连接状态
ipcMain.handle('mysql-status', async event => {
  try {
    const isConnected = await checkDatabaseConnection();
    const poolStatus = {
      totalConnections: mysqlPool._allConnections ? mysqlPool._allConnections.length : 0,
      freeConnections: mysqlPool._freeConnections ? mysqlPool._freeConnections.length : 0,
      acquiringConnections: mysqlPool._acquiringConnections ? mysqlPool._acquiringConnections.length : 0,
      connectionLimit: mysqlPool.config.connectionLimit,
      queueLength: mysqlPool._connectionQueue ? mysqlPool._connectionQueue.length : 0
    };

    return {
      success: true,
      connected: isConnected,
      poolStatus
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      connected: false
    };
  }
});

// 支持执行 cmd 命令并返回结果
ipcMain.handle('exec-cmd', async (event, command) => {
  return new Promise(resolve => {
    exec(command, { encoding: 'utf8' }, (error, stdout, stderr) => {
      const result = {
        success: !error,
        stdout: stdout,
        stderr: stderr,
        error: error ? error.message : null
      };
      if (error) {
        logger.error('命令执行失败:', { command, error: error.message, stderr });
      } else {
        logger.log('命令执行成功:', { command, stdout });
      }
      resolve(result);
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

// 执行任务
ipcMain.handle('run-appium-task', async (event, params) => {
  const webContents = event.sender;
  function sendProgress(msg) {
    webContents.send('appium-task-progress', msg);
  }
  const result = await runAppiumTask(params, sendProgress);
  return result;
});

// 截图相关操作
ipcMain.handle('screenshot-operations', async (event, operation, ...args) => {
  try {
    switch (operation) {
      case 'take-screenshot': {
        const { deviceId, deviceName, appPackage } = args[0];
        const log = msg => {
          event.sender.send('screenshot-progress', msg);
        };
        const result = await takeScreenshot(deviceId, deviceName, appPackage, log);
        return { success: true, data: result };
      }
      case 'get-screenshots-list': {
        const screenshots = getScreenshotsList();
        return { success: true, data: screenshots };
      }
      case 'delete-screenshot': {
        const { filename } = args[0];
        const success = deleteScreenshot(filename);
        return { success, data: { deleted: success } };
      }
      default:
        return { success: false, error: '未知的截图操作' };
    }
  } catch (error) {
    logger.error('截图操作失败:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
