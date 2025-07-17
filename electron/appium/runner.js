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

    // TODO: 在这里添加具体的自动化操作逻辑
    // const el = await client.$('~your_selector');
    // await el.click();
    // log('已点击按钮');

    log('自动化操作完成，关闭会话...');
    await client.deleteSession();
    log('任务完成');
    return { success: true, logs };
  } catch (err) {
    log('自动化执行失败: ' + (err?.message || err));
    console.log('[runAppiumTask] 自动化执行异常:', err);
    if (client) await client.deleteSession();
    return { success: false, logs };
  }
}
