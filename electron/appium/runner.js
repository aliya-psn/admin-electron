import { remote } from 'webdriverio';
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';

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

/**
 * 自动启动 Appium Server
 * @returns {Promise<ChildProcess|null>}
 */
function startAppiumServer() {
  // 1. 指定 appium 路径
  const appiumPath = 'appium'; // 或 path.resolve(__dirname, '../../node_modules/.bin/appium')

  // 2. 指定参数
  const args = ['--port', '4723', '--log-level', 'info'];

  // 4. 启动
  console.log('[startAppiumServer] 启动 Appium Server:', appiumPath, args);
  const child = spawn(appiumPath, args, {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
  console.log('[startAppiumServer] Appium Server 进程已启动，PID:', child.pid);
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
    startAppiumServer();
    ready = await waitForAppiumServer(15000);
    if (!ready) {
      log('Appium Server 启动失败，请检查环境！');
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
