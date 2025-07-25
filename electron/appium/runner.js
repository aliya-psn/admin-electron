import { remote } from 'webdriverio';
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 定义 __dirname (ES模块中需要手动定义)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 常量定义
const APPIUM_PORT = 4723;
const APPIUM_URL = `http://localhost:${APPIUM_PORT}`;
const DEFAULT_TIMEOUT = 10;
const SERVER_TIMEOUT = 15000;

// 截图相关常量
const SCREENSHOTS_DIR = path.join(__dirname, '../../screenshots');
const SCREENSHOT_FORMAT = 'png';

/**
 * 确保截图目录存在
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * 生成截图文件名
 * @param {string} deviceName 设备名称
 * @param {string} appPackage 应用包名
 * @returns {string} 截图文件名
 */
function generateScreenshotFilename(deviceName, appPackage) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const safeDeviceName = deviceName.replace(/[^a-zA-Z0-9]/g, '_');
  const safePackage = appPackage.replace(/[^a-zA-Z0-9]/g, '_');
  return `${safeDeviceName}_${safePackage}_${timestamp}.${SCREENSHOT_FORMAT}`;
}

/**
 * 保存截图到文件
 * @param {Buffer} screenshotBuffer 截图数据
 * @param {string} filename 文件名
 * @returns {string} 保存的文件路径
 */
function saveScreenshot(screenshotBuffer, filename) {
  ensureScreenshotsDir();
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  fs.writeFileSync(filePath, screenshotBuffer);
  return filePath;
}

/**
 * 获取设备截图
 * @param {Object} client WebDriverIO客户端
 * @param {string} deviceName 设备名称
 * @param {string} appPackage 应用包名
 * @param {(msg: string) => void} log 日志函数
 * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
 */
async function takeScreenshot(client, deviceName, appPackage, log) {
  try {
    log('开始获取设备截图...');

    // 使用WebDriverIO的截图API
    const screenshotBuffer = await client.saveScreenshot();

    if (!screenshotBuffer) {
      throw new Error('截图数据为空');
    }

    // 生成文件名并保存
    const filename = generateScreenshotFilename(deviceName, appPackage);
    const filePath = saveScreenshot(screenshotBuffer, filename);

    log(`截图保存成功: ${filename}`);
    return { success: true, filePath, filename };
  } catch (error) {
    const errorMsg = `截图失败: ${error.message}`;
    log(errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * 获取截图列表
 * @returns {Array<{filename: string, filePath: string, size: number, createTime: string}>}
 */
function getScreenshotsList() {
  ensureScreenshotsDir();

  try {
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    return files
      .filter(file => file.endsWith(`.${SCREENSHOT_FORMAT}`))
      .map(file => {
        const filePath = path.join(SCREENSHOTS_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          filePath: filePath,
          size: stats.size,
          createTime: stats.birthtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
  } catch (error) {
    console.error('获取截图列表失败:', error);
    return [];
  }
}

/**
 * 删除截图文件
 * @param {string} filename 文件名
 * @returns {boolean} 是否删除成功
 */
function deleteScreenshot(filename) {
  try {
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除截图失败:', error);
    return false;
  }
}

/**
 * 获取默认 Android SDK 路径
 */
function getDefaultSdkPath() {
  return process.platform === 'win32' ? 'C:\\Android\\Sdk' : path.join(process.env.HOME, 'Library', 'Android', 'sdk');
}

/**
 * 检查 Appium Server 是否已启动
 * @returns {Promise<boolean>}
 */
function checkAppiumServerReady() {
  return new Promise(resolve => {
    console.log('[checkAppiumServerReady] 检查 Appium Server 状态...');
    const req = http.get(`${APPIUM_URL}/status`, res => {
      // Appium 1.x 则为'/wd/hub/status',
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        console.log('[checkAppiumServerReady] 返回数据:', data);
        try {
          const json = JSON.parse(data);
          resolve(json.value?.ready === true || json.status === 0);
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', err => {
      console.log('[checkAppiumServerReady] 请求出错:', err);
      resolve(false);
    });
    req.setTimeout(2000, () => {
      req.abort();
      console.log('[checkAppiumServerReady] 请求超时');
      resolve(false);
    });
  });
}

/**
 * 检查 Android 环境
 * @returns {boolean}
 */
function checkAndroidEnvironment() {
  // 获取平台对应的默认 SDK 路径
  const sdkPath = process.env.ANDROID_HOME || getDefaultSdkPath();

  // 检查 SDK 目录是否存在
  if (!fs.existsSync(sdkPath)) {
    console.error(`[ERROR] Android SDK 路径不存在: ${sdkPath}`);
    return false;
  }
  return true;
}

/**
 * 获取 Appium 可执行文件路径
 * @returns {Object}
 */
function getAppiumBinPath() {
  const paths =
    process.platform === 'win32'
      ? [
          { path: 'npx', args: ['appium'] },
          { path: 'appium.cmd', args: [] }
        ]
      : [
          { path: 'npx', args: ['appium'] },
          { path: path.join(__dirname, '../../node_modules/.bin/appium'), args: [] }
        ];

  return paths.find(option => option.path === 'npx' || fs.existsSync(option.path)) || paths[0];
}

/**
 * 启动 Appium Server
 * @returns {ChildProcess}
 */
function startAppiumServer() {
  // 1. 环境检查
  if (!checkAndroidEnvironment()) {
    return null;
  }

  //2. 动态选择路径
  const { path: appiumPath, args } = getAppiumBinPath();

  // 3. 启动子进程
  const env = { ...process.env };
  env.ANDROID_HOME = env.ANDROID_HOME || getDefaultSdkPath();

  const child = spawn(appiumPath, ['--port', APPIUM_PORT.toString(), '--log-level', 'info', ...args], {
    env,
    stdio: 'pipe',
    shell: true
  });

  child.stdout.on('data', data => console.log(`[Appium] ${data}`));
  child.stderr.on('data', data => console.error(`[Appium] ${data}`));

  return child;
}

/**
 * 等待 Appium Server 启动
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
async function waitForAppiumServer(timeoutMs = DEFAULT_TIMEOUT) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await checkAppiumServerReady()) {
      console.log('[waitForAppiumServer] Appium Server 已就绪');
      return true;
    }
    console.log('[waitForAppiumServer] Appium Server 未就绪，等待重试...');
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('[waitForAppiumServer] Appium Server 启动超时');
  return false;
}

/**
 * @typedef {Object} AppiumTaskParams
 * @property {'android'|'ios'} platform
 * @property {string} deviceName
 * @property {string} package
 * @property {string} [appActivity] // Android
 * @property {string} [bundleId]    // iOS
 */

/**
 * 运行 Appium 自动化任务
 * @param {AppiumTaskParams} params
 * @param {(msg: string) => void} [onProgress]
 * @returns {Promise<{ success: boolean; logs: string[] }>}
 */
export async function runAppiumTask(params, onProgress) {
  const logs = [];
  const log = msg => {
    logs.push(msg);
    onProgress?.(msg);
    console.log('[runAppiumTask]', msg);
  };

  // 检查并启动 Appium Server
  log('检查 Appium Server 状态...');
  let ready = await checkAppiumServerReady();

  if (!ready) {
    log('Appium Server 未启动，尝试自动启动...');
    const child = startAppiumServer();

    if (!child) {
      log('无法启动Appium Server！请确保已安装Appium: npm install -g appium');
      log('或者安装为开发依赖: npm install appium --save-dev');
      log('在Windows上，也可以使用: npm install -g @appium/cli');
      return { success: false, logs };
    }

    ready = await waitForAppiumServer(SERVER_TIMEOUT);
    if (!ready) {
      log('Appium Server 启动失败，请检查环境配置！');
      log('常见解决方案:');
      log('1. 安装Appium: npm install -g appium');
      log('2. 确保Node.js版本兼容');
      log('3. 检查防火墙设置');
      return { success: false, logs };
    }
    log('Appium Server 启动成功！');
  } else {
    log('Appium Server 已启动。');
  }

  // 配置 WebDriver 连接参数
  const capabilities = {
    platformName: params.platform === 'android' ? 'Android' : 'iOS',
    'appium:deviceName': params.deviceName,
    'appium:appPackage': params.package,
    'appium:appActivity': params.appActivity,
    'appium:bundleId': params.bundleId,
    'appium:automationName': params.platform === 'android' ? 'UiAutomator2' : 'XCUITest'
  };

  let client;
  try {
    log('启动 Appium 客户端...');
    console.log('[runAppiumTask] WebDriverIO 连接参数:', {
      path: '/',
      port: APPIUM_PORT,
      capabilities
    });
    client = await remote({
      path: '/',
      port: APPIUM_PORT,
      capabilities
    });

    log('Appium 客户端已连接，开始自动化操作...');

    // 执行截图操作
    const screenshotResult = await takeScreenshot(client, params.deviceName, params.package, log);
    if (screenshotResult.success) {
      log(`截图已保存到: ${screenshotResult.filePath}`);
    }

    // TODO: 在这里添加具体的自动化操作逻辑
    // const el = await client.$('~your_selector');
    // await el.click();
    // log('已点击按钮');

    log('自动化操作完成，关闭会话...');
    await client.deleteSession();
    log('任务完成');
    return { success: true, logs, screenshot: screenshotResult };
  } catch (err) {
    log('自动化执行失败: ' + (err?.message || err));
    console.log('[runAppiumTask] 自动化执行异常:', err);
    if (client) await client.deleteSession();
    return { success: false, logs };
  }
}

// 导出截图相关函数
export { takeScreenshot, getScreenshotsList, deleteScreenshot };
