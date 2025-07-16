import { remote } from 'webdriverio';

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
  }

  const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities: {
      platformName: params.platform === 'android' ? 'Android' : 'iOS',
      deviceName: params.deviceName,
      appPackage: params.package,
      appActivity: params.appActivity,
      bundleId: params.bundleId,
      automationName: params.platform === 'android' ? 'UiAutomator2' : 'XCUITest'
    }
  };

  let client;
  try {
    log('启动 Appium 客户端...');
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
    if (client) await client.deleteSession();
    return { success: false, logs };
  }
}
