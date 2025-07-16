import { remote } from 'webdriverio';
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * 检查 Appium Server 是否已启动
 * @returns {Promise<boolean>}
 */
function checkAppiumServerReady() {
  return new Promise(resolve => {
    console.log('[checkAppiumServerReady] 检查 Appium Server 状态...');
    const req = http.get('http://localhost:4723/status', res => {
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

function checkAndroidEnvironment() {
  // 获取平台对应的默认 SDK 路径
  const defaultSdkPath = process.platform === 'win32'
    ? 'C:\\Android\\Sdk'
    : path.join(process.env.HOME, 'Library', 'Android', 'sdk');

  const sdkPath = process.env.ANDROID_HOME || defaultSdkPath;
  
  // 检查 SDK 目录是否存在
  if (!fs.existsSync(sdkPath)) {
    console.error(`[ERROR] Android SDK 路径不存在: ${sdkPath}`);
    return false;
  }

  // 检查 adb 是否存在
  const adbPath = getPlatformAdbPath(sdkPath);
  if (!fs.existsSync(adbPath)) {
    console.error(`[ERROR] 未找到 adb: ${adbPath}`);
    return false;
  }

  return true;
}

function resolveAppiumBinPath() {
  if (process.platform === 'win32') {
    return [
      { path: 'npx', args: ['appium'] },
      { path: 'appium.cmd', args: [] }
    ];
  } else {
    return [
      { path: 'npx', args: ['appium'] },
      { path: path.join(__dirname, '../../node_modules/.bin/appium'), args: [] }
    ];
  }
}

function startAppiumServer() {
  // 1. 环境检查
  if (!checkAndroidEnvironment()) {
    return null;
  }

  // 2. 动态选择路径
  const options = resolveAppiumBinPath();
  let appiumPath, args;

  for (const option of options) {
    try {
      if (option.path === 'npx' || fs.existsSync(option.path)) {
        appiumPath = option.path;
        args = ['--port', '4723', '--log-level', 'info', ...option.args];
        break;
      }
    } catch (e) {
      console.log(`[startAppiumServer] 路径 ${option.path} 不可用:`, e.message);
    }
  }

  // 3. 启动子进程
  const child = spawn(appiumPath, args, {
    env: getPlatformEnv(),
    stdio: 'pipe',
    shell: true
  });

  child.stdout.on('data', (data) => console.log(`[Appium] ${data}`));
  child.stderr.on('data', (data) => console.error(`[Appium] ${data}`));

  return child;
}

/**
 * 等待 Appium Server 启动
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
async function waitForAppiumServer(timeoutMs = 10000) {
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
 * @param {AppiumTaskParams} params
 * @param {(msg: string) => void} [onProgress]
 * @returns {Promise<{ success: boolean; logs: string[] }>}
 */
export async function runAppiumTask(params, onProgress) {
  const logs = [];
  function log(msg) {
    logs.push(msg);
    if (onProgress) onProgress(msg);
    console.log('[runAppiumTask]', msg);
  }

  log('检查 Appium Server 是否已启动...');
  let ready = await checkAppiumServerReady();
  if (!ready) {
    log('Appium Server 未启动，尝试自动启动...');
    const child = startAppiumServer();
    
    if (!child) {
      log('无法启动Appium Server！');
      log('请确保已安装Appium: npm install -g appium');
      log('或者安装为开发依赖: npm install appium --save-dev');
      log('在Windows上，也可以使用: npm install -g @appium/cli');
      return { success: false, logs };
    }
    
    ready = await waitForAppiumServer(15000);
    if (!ready) {
      log('Appium Server 启动失败，请检查环境！');
      log('常见解决方案:');
      log('1. 安装Appium: npm install -g appium');
      log('2. 确保Node.js版本兼容');
      log('3. 检查防火墙设置');
      return { success: false, logs };
    }
    console.log('[runAppiumTask] Appium Server 启动成功！');
    log('Appium Server 启动成功！');
  } else {
    log('Appium Server 已启动。');
  }

  const opts = {
    path: '/', // Appium 2.x 默认，如果是Appium 1.x 则path: '/wd/hub',
    port: 4723,
    capabilities: {
      platformName: params.platform === 'android' ? 'Android' : 'iOS',
      'appium:deviceName': params.deviceName,
      'appium:appPackage': params.package,
      'appium:appActivity': params.appActivity,
      'appium:bundleId': params.bundleId,
      'appium:automationName': params.platform === 'android' ? 'UiAutomator2' : 'XCUITest'
    }
  };

  let client;
  try {
    log('启动 Appium 客户端...');
    console.log('[runAppiumTask] WebDriverIO 连接参数:', opts);
    client = await remote(opts);
    log('Appium 客户端已连接，开始自动化操作...');

    // 示例自动化操作（可根据实际需求扩展）
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
