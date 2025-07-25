import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 常量定义
const SCREENSHOTS_DIR = path.join(__dirname, '../../screenshots');
const SCREENSHOT_FORMAT = 'png';
const MINICAP_DIR = path.join(__dirname, '../../tools/minicap');

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
 * 获取设备屏幕分辨率
 * @param {string} deviceId 设备ID
 * @returns {Promise<{width: number, height: number}>}
 */
async function getDeviceResolution(deviceId) {
  return new Promise((resolve, reject) => {
    const adb = spawn('adb', ['-s', deviceId, 'shell', 'wm', 'size']);
    let output = '';

    adb.stdout.on('data', data => {
      output += data.toString();
    });

    adb.stderr.on('data', data => {
      console.error('获取设备分辨率错误:', data.toString());
    });

    adb.on('close', code => {
      if (code === 0) {
        // 输出格式: Physical size: 1080x2400
        const match = output.match(/Physical size: (\d+)x(\d+)/);
        if (match) {
          resolve({
            width: parseInt(match[1]),
            height: parseInt(match[2])
          });
        } else {
          reject(new Error('无法解析设备分辨率'));
        }
      } else {
        reject(new Error(`获取设备分辨率失败，退出码: ${code}`));
      }
    });
  });
}

/**
 * 检查设备是否支持MiniCap
 * @param {string} deviceId 设备ID
 * @returns {Promise<boolean>}
 */
async function checkMinicapSupport(deviceId) {
  return new Promise(resolve => {
    const adb = spawn('adb', ['-s', deviceId, 'shell', 'which', 'minicap']);

    adb.on('close', code => {
      resolve(code === 0);
    });
  });
}

/**
 * 安装MiniCap到设备
 * @param {string} deviceId 设备ID
 * @param {string} abi 设备架构 (arm64-v8a, armeabi-v7a, x86, x86_64)
 * @returns {Promise<boolean>}
 */
async function installMinicap(deviceId, abi = 'arm64-v8a') {
  return new Promise(resolve => {
    const minicapPath = path.join(MINICAP_DIR, abi, 'minicap');
    const minicapSoPath = path.join(MINICAP_DIR, abi, 'minicap.so');

    if (!fs.existsSync(minicapPath) || !fs.existsSync(minicapSoPath)) {
      console.error('MiniCap文件不存在，请先下载MiniCap');
      resolve(false);
      return;
    }

    // 推送minicap可执行文件
    const pushExec = spawn('adb', ['-s', deviceId, 'push', minicapPath, '/data/local/tmp/']);
    pushExec.on('close', code => {
      if (code === 0) {
        // 推送minicap.so库文件
        const pushSo = spawn('adb', ['-s', deviceId, 'push', minicapSoPath, '/data/local/tmp/']);
        pushSo.on('close', code2 => {
          if (code2 === 0) {
            // 设置执行权限
            const chmod = spawn('adb', ['-s', deviceId, 'shell', 'chmod', '777', '/data/local/tmp/minicap']);
            chmod.on('close', code3 => {
              resolve(code3 === 0);
            });
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * 使用MiniCap截图
 * @param {string} deviceId 设备ID
 * @param {string} deviceName 设备名称
 * @param {string} appPackage 应用包名
 * @param {(msg: string) => void} log 日志函数
 * @returns {Promise<{success: boolean, filePath?: string, filename?: string, error?: string}>}
 */
export async function takeScreenshotWithMinicap(deviceId, deviceName, appPackage, log) {
  try {
    log('开始使用MiniCap截图...');

    // 确保截图目录存在
    ensureScreenshotsDir();

    // 检查设备是否支持MiniCap
    const hasMinicap = await checkMinicapSupport(deviceId);
    if (!hasMinicap) {
      log('设备不支持MiniCap，尝试安装...');
      const installed = await installMinicap(deviceId);
      if (!installed) {
        throw new Error('MiniCap安装失败');
      }
    }

    // 获取设备分辨率
    log('获取设备分辨率...');
    const resolution = await getDeviceResolution(deviceId);
    log(`设备分辨率: ${resolution.width}x${resolution.height}`);

    // 生成截图文件名
    const filename = generateScreenshotFilename(deviceName, appPackage);
    const localPath = path.join(SCREENSHOTS_DIR, filename);

    // 启动MiniCap服务
    log('启动MiniCap服务...');
    const startMinicap = spawn('adb', [
      '-s',
      deviceId,
      'shell',
      'LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P ' +
        `${resolution.width}x${resolution.height}@${resolution.width}x${resolution.height}/0`
    ]);

    // 等待MiniCap启动
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 转发端口
    log('转发MiniCap端口...');
    const forward = spawn('adb', ['-s', deviceId, 'forward', 'tcp:1313', 'localabstract:minicap']);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 使用curl下载截图
    log('下载截图...');
    const curl = spawn('curl', ['-o', localPath, 'http://localhost:1313/screenshot']);

    return new Promise(resolve => {
      curl.on('close', code => {
        if (code === 0) {
          log(`截图保存成功: ${filename}`);
          resolve({ success: true, filePath: localPath, filename });
        } else {
          log('截图下载失败');
          resolve({ success: false, error: '截图下载失败' });
        }

        // 清理：停止端口转发和MiniCap进程
        spawn('adb', ['-s', deviceId, 'forward', '--remove', 'tcp:1313']);
        spawn('adb', ['-s', deviceId, 'shell', 'pkill', 'minicap']);
      });
    });
  } catch (error) {
    const errorMsg = `MiniCap截图失败: ${error.message}`;
    log(errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * 使用ADB截图（备用方案）
 * @param {string} deviceId 设备ID
 * @param {string} deviceName 设备名称
 * @param {string} appPackage 应用包名
 * @param {(msg: string) => void} log 日志函数
 * @returns {Promise<{success: boolean, filePath?: string, filename?: string, error?: string}>}
 */
export async function takeScreenshotWithADB(deviceId, deviceName, appPackage, log) {
  try {
    log('使用ADB截图（备用方案）...');

    // 确保截图目录存在
    ensureScreenshotsDir();

    // 生成截图文件名
    const filename = generateScreenshotFilename(deviceName, appPackage);
    const localPath = path.join(SCREENSHOTS_DIR, filename);
    const remotePath = `/sdcard/${filename}`;

    // 在设备上截图
    const screenshot = spawn('adb', ['-s', deviceId, 'shell', 'screencap', remotePath]);

    return new Promise(resolve => {
      screenshot.on('close', code => {
        if (code === 0) {
          // 拉取截图到本地
          const pull = spawn('adb', ['-s', deviceId, 'pull', remotePath, localPath]);
          pull.on('close', pullCode => {
            if (pullCode === 0) {
              // 删除设备上的截图文件
              spawn('adb', ['-s', deviceId, 'shell', 'rm', remotePath]);
              log(`ADB截图保存成功: ${filename}`);
              resolve({ success: true, filePath: localPath, filename });
            } else {
              log('ADB截图拉取失败');
              resolve({ success: false, error: 'ADB截图拉取失败' });
            }
          });
        } else {
          log('ADB截图失败');
          resolve({ success: false, error: 'ADB截图失败' });
        }
      });
    });
  } catch (error) {
    const errorMsg = `ADB截图失败: ${error.message}`;
    log(errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * 智能截图（优先使用MiniCap，失败时使用ADB）
 * @param {string} deviceId 设备ID
 * @param {string} deviceName 设备名称
 * @param {string} appPackage 应用包名
 * @param {(msg: string) => void} log 日志函数
 * @returns {Promise<{success: boolean, filePath?: string, filename?: string, error?: string}>}
 */
export async function takeScreenshot(deviceId, deviceName, appPackage, log) {
  // 首先尝试MiniCap
  const minicapResult = await takeScreenshotWithMinicap(deviceId, deviceName, appPackage, log);

  if (minicapResult.success) {
    return minicapResult;
  }

  // MiniCap失败，使用ADB备用方案
  log('MiniCap截图失败，切换到ADB截图...');
  return await takeScreenshotWithADB(deviceId, deviceName, appPackage, log);
}

/**
 * 获取截图列表
 * @returns {Array<{filename: string, filePath: string, size: number, createTime: string}>}
 */
export function getScreenshotsList() {
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
export function deleteScreenshot(filename) {
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
