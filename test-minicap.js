#!/usr/bin/env node

/**
 * MiniCap 功能测试脚本
 * 测试 MiniCap 截图功能是否正常工作
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// 测试配置
const TEST_DEVICE_ID = 'emulator-5554'; // 默认测试设备ID
const TEST_DEVICE_NAME = 'Android_Emulator';
const TEST_APP_PACKAGE = 'com.android.settings';

/**
 * 执行ADB命令
 */
function execAdb(args) {
  return new Promise((resolve, reject) => {
    const adb = spawn('adb', args);
    let stdout = '';
    let stderr = '';

    adb.stdout.on('data', data => {
      stdout += data.toString();
    });

    adb.stderr.on('data', data => {
      stderr += data.toString();
    });

    adb.on('close', code => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`ADB命令失败: ${stderr}`));
      }
    });
  });
}

/**
 * 检查设备连接
 */
async function checkDeviceConnection() {
  try {
    console.log('检查设备连接...');
    const devices = await execAdb(['devices']);
    console.log('已连接设备:');
    console.log(devices);

    if (devices.includes(TEST_DEVICE_ID)) {
      console.log('✅ 测试设备已连接');
      return true;
    } else {
      console.log('❌ 测试设备未连接');
      return false;
    }
  } catch (error) {
    console.error('检查设备连接失败:', error.message);
    return false;
  }
}

/**
 * 获取设备信息
 */
async function getDeviceInfo() {
  try {
    console.log('获取设备信息...');

    const model = await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'getprop', 'ro.product.model']);
    const androidVersion = await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'getprop', 'ro.build.version.release']);
    const resolution = await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'wm', 'size']);

    console.log(`设备型号: ${model}`);
    console.log(`Android版本: ${androidVersion}`);
    console.log(`屏幕分辨率: ${resolution}`);

    return { model, androidVersion, resolution };
  } catch (error) {
    console.error('获取设备信息失败:', error.message);
    return null;
  }
}

/**
 * 测试ADB截图功能
 */
async function testAdbScreenshot() {
  try {
    console.log('\n测试ADB截图功能...');

    const filename = `test_adb_${Date.now()}.png`;
    const remotePath = `/sdcard/${filename}`;
    const localPath = path.join(process.cwd(), filename);

    // 截图
    console.log('执行ADB截图...');
    await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'screencap', remotePath]);

    // 拉取文件
    console.log('拉取截图文件...');
    await execAdb(['-s', TEST_DEVICE_ID, 'pull', remotePath, localPath]);

    // 检查文件
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      console.log(`✅ ADB截图成功: ${filename} (${stats.size} bytes)`);

      // 清理
      fs.unlinkSync(localPath);
      await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'rm', remotePath]);

      return true;
    } else {
      console.log('❌ ADB截图失败: 文件不存在');
      return false;
    }
  } catch (error) {
    console.error('ADB截图测试失败:', error.message);
    return false;
  }
}

/**
 * 测试MiniCap功能
 */
async function testMinicapScreenshot() {
  try {
    console.log('\n测试MiniCap截图功能...');

    // 检查MiniCap是否已安装
    const minicapExists = await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'ls', '/data/local/tmp/minicap'])
      .then(() => true)
      .catch(() => false);

    if (!minicapExists) {
      console.log('MiniCap未安装，跳过测试');
      return false;
    }

    console.log('✅ MiniCap已安装');

    // 获取设备分辨率
    const resolution = await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'wm', 'size']);
    const match = resolution.match(/Physical size: (\d+)x(\d+)/);

    if (!match) {
      console.log('❌ 无法获取设备分辨率');
      return false;
    }

    const [width, height] = [parseInt(match[1]), parseInt(match[2])];
    console.log(`设备分辨率: ${width}x${height}`);

    // 启动MiniCap
    console.log('启动MiniCap服务...');
    const minicapProcess = spawn('adb', [
      '-s',
      TEST_DEVICE_ID,
      'shell',
      'LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P ' + `${width}x${height}@${width}x${height}/0`
    ]);

    // 等待启动
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 转发端口
    console.log('转发MiniCap端口...');
    await execAdb(['-s', TEST_DEVICE_ID, 'forward', 'tcp:1313', 'localabstract:minicap']);

    // 等待端口转发
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 测试截图
    const filename = `test_minicap_${Date.now()}.png`;
    const localPath = path.join(process.cwd(), filename);

    console.log('下载MiniCap截图...');
    const curl = spawn('curl', ['-o', localPath, 'http://localhost:1313/screenshot']);

    return new Promise(resolve => {
      curl.on('close', async code => {
        // 清理
        minicapProcess.kill();
        await execAdb(['-s', TEST_DEVICE_ID, 'forward', '--remove', 'tcp:1313']);
        await execAdb(['-s', TEST_DEVICE_ID, 'shell', 'pkill', 'minicap']);

        if (code === 0 && fs.existsSync(localPath)) {
          const stats = fs.statSync(localPath);
          console.log(`✅ MiniCap截图成功: ${filename} (${stats.size} bytes)`);

          // 清理文件
          fs.unlinkSync(localPath);
          resolve(true);
        } else {
          console.log('❌ MiniCap截图失败');
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.error('MiniCap截图测试失败:', error.message);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('=== MiniCap 功能测试 ===\n');

  // 检查设备连接
  const deviceConnected = await checkDeviceConnection();
  if (!deviceConnected) {
    console.log('请先连接Android设备或启动模拟器');
    process.exit(1);
  }

  // 获取设备信息
  await getDeviceInfo();

  // 测试ADB截图
  const adbSuccess = await testAdbScreenshot();

  // 测试MiniCap截图
  const minicapSuccess = await testMinicapScreenshot();

  // 输出测试结果
  console.log('\n=== 测试结果 ===');
  console.log(`ADB截图: ${adbSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`MiniCap截图: ${minicapSuccess ? '✅ 成功' : '❌ 失败'}`);

  if (adbSuccess || minicapSuccess) {
    console.log('\n✅ 截图功能测试通过');
  } else {
    console.log('\n❌ 截图功能测试失败');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(console.error);
