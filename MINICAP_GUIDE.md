# MiniCap 截图功能实现指南

## 概述

本项目实现了基于 MiniCap 的 Android 设备截图功能，相比传统的 Appium 方案，MiniCap 具有以下优势：

- **更轻量级**: 不依赖 WebDriver，直接使用 ADB 命令
- **更稳定**: 减少中间层，降低故障率
- **更高效**: 截图速度更快，资源占用更少
- **更简单**: 实现逻辑简单，维护成本低

## 架构设计

### 技术栈
- **核心工具**: MiniCap + ADB
- **备用方案**: ADB screencap 命令
- **前端**: Vue 3 + Element Plus
- **后端**: Electron + Node.js

### 文件结构
```
electron/
├── minicap/
│   └── screenshot.js          # MiniCap 截图核心逻辑
├── main.js                    # 主进程，处理 IPC 通信
└── preload.js                 # 预加载脚本，暴露 API

tools/
└── minicap/                   # MiniCap 二进制文件
    ├── arm64-v8a/
    │   ├── minicap
    │   └── minicap.so
    ├── armeabi-v7a/
    ├── x86/
    └── x86_64/

scripts/
└── download-minicap.js        # MiniCap 下载安装脚本

test-minicap.js                # 功能测试脚本
```

## 安装配置

### 1. 安装 MiniCap

```bash
# 安装 MiniCap
yarn minicap:install

# 检查安装状态
yarn minicap:check

# 强制重新安装
yarn minicap:install --force
```

### 2. 环境要求

- **Android SDK**: 确保 `adb` 命令可用
- **Node.js**: 版本 18+ 
- **Git**: 用于下载 MiniCap 源码
- **Make**: 用于编译 MiniCap

### 3. 设备准备

```bash
# 检查设备连接
adb devices

# 启用 USB 调试
# 在设备上：设置 -> 开发者选项 -> USB 调试

# 检查设备架构
adb shell getprop ro.product.cpu.abi
```

## 核心功能

### 1. 智能截图

系统会优先使用 MiniCap 截图，如果失败则自动切换到 ADB 备用方案：

```javascript
// 优先使用 MiniCap
const minicapResult = await takeScreenshotWithMinicap(deviceId, deviceName, appPackage, log);

if (minicapResult.success) {
  return minicapResult;
}

// MiniCap 失败，使用 ADB 备用方案
log('MiniCap截图失败，切换到ADB截图...');
return await takeScreenshotWithADB(deviceId, deviceName, appPackage, log);
```

### 2. MiniCap 截图流程

1. **检查设备支持**: 验证设备是否已安装 MiniCap
2. **自动安装**: 如果未安装，自动推送并安装 MiniCap
3. **获取分辨率**: 获取设备屏幕分辨率
4. **启动服务**: 启动 MiniCap 服务
5. **端口转发**: 转发本地端口到设备
6. **下载截图**: 通过 HTTP 接口下载截图
7. **清理资源**: 停止服务并清理端口转发

### 3. ADB 备用方案

当 MiniCap 不可用时，使用传统的 ADB 截图：

```bash
# 在设备上截图
adb shell screencap /sdcard/screenshot.png

# 拉取到本地
adb pull /sdcard/screenshot.png ./screenshot.png

# 清理设备文件
adb shell rm /sdcard/screenshot.png
```

## API 接口

### 截图操作 API

```typescript
interface ScreenshotAPI {
  // 获取设备截图
  takeScreenshot: (params: {
    deviceId: string;      // 设备ID
    deviceName: string;    // 设备名称
    appPackage: string;    // 应用包名
  }) => Promise<{
    success: boolean;
    data?: {
      filePath: string;
      filename: string;
    };
    error?: string;
  }>;
  
  // 获取截图列表
  getScreenshotsList: () => Promise<{
    success: boolean;
    data?: Array<{
      filename: string;
      filePath: string;
      size: number;
      createTime: string;
    }>;
    error?: string;
  }>;
  
  // 删除截图
  deleteScreenshot: (filename: string) => Promise<{
    success: boolean;
    data?: { deleted: boolean };
    error?: string;
  }>;
  
  // 监听截图进度
  onScreenshotProgress: (callback: (event: any, msg: string) => void) => void;
}
```

### 核心函数

#### takeScreenshotWithMinicap
```javascript
export async function takeScreenshotWithMinicap(deviceId, deviceName, appPackage, log) {
  // 1. 检查并安装 MiniCap
  const hasMinicap = await checkMinicapSupport(deviceId);
  if (!hasMinicap) {
    const installed = await installMinicap(deviceId);
    if (!installed) {
      throw new Error('MiniCap安装失败');
    }
  }
  
  // 2. 获取设备分辨率
  const resolution = await getDeviceResolution(deviceId);
  
  // 3. 启动 MiniCap 服务
  const startMinicap = spawn('adb', [
    '-s', deviceId, 
    'shell', 
    'LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P ' + 
    `${resolution.width}x${resolution.height}@${resolution.width}x${resolution.height}/0`
  ]);
  
  // 4. 转发端口
  const forward = spawn('adb', ['-s', deviceId, 'forward', 'tcp:1313', 'localabstract:minicap']);
  
  // 5. 下载截图
  const curl = spawn('curl', ['-o', localPath, 'http://localhost:1313/screenshot']);
  
  // 6. 清理资源
  spawn('adb', ['-s', deviceId, 'forward', '--remove', 'tcp:1313']);
  spawn('adb', ['-s', deviceId, 'shell', 'pkill', 'minicap']);
}
```

## 使用方法

### 1. 在任务配置页面

选择设备和应用后，任务信息会自动存储到 localStorage：

```javascript
const taskInfo = {
  deviceId: device?.id || '',
  deviceName: device?.name || '',
  appPackage: app?.package || '',
  platform: device?.platform || 'android',
  taskName: form.value.taskName,
  duration: form.value.duration,
  interval: form.value.interval
};
localStorage.setItem('currentTaskInfo', JSON.stringify(taskInfo));
```

### 2. 在任务执行页面

```javascript
const takeScreenshot = async () => {
  const taskInfo = getCurrentTaskInfo();
  if (!taskInfo) {
    ElMessage.error('未找到任务信息，请重新创建任务');
    return;
  }
  
  const deviceId = taskInfo.deviceId;
  if (!deviceId) {
    ElMessage.error('未找到设备ID，请重新创建任务');
    return;
  }
  
  const result = await window.screenshotAPI?.takeScreenshot({
    deviceId: deviceId,
    deviceName: taskInfo.deviceName,
    appPackage: taskInfo.appPackage
  });
  
  if (result?.success) {
    ElMessage.success('截图成功');
    await refreshScreenshots();
  } else {
    ElMessage.error(result?.error || '截图失败');
  }
};
```

## 测试验证

### 1. 功能测试

```bash
# 运行测试脚本
yarn minicap:test

# 或直接运行
node test-minicap.js
```

### 2. 手动测试

```bash
# 检查设备连接
adb devices

# 测试 ADB 截图
adb shell screencap /sdcard/test.png
adb pull /sdcard/test.png ./test.png

# 测试 MiniCap（如果已安装）
adb shell LD_LIBRARY_PATH=/data/local/tmp /data/local/tmp/minicap -P 1080x2400@1080x2400/0
adb forward tcp:1313 localabstract:minicap
curl -o screenshot.png http://localhost:1313/screenshot
```

## 故障排除

### 1. 常见问题

#### MiniCap 安装失败
```bash
# 检查 Android SDK 环境
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT

# 检查 adb 命令
which adb
adb version

# 重新安装 MiniCap
yarn minicap:install --force
```

#### 设备连接问题
```bash
# 检查设备连接
adb devices

# 重启 adb 服务
adb kill-server
adb start-server

# 检查 USB 调试
adb shell getprop ro.debuggable
```

#### 权限问题
```bash
# 检查设备权限
adb shell ls -la /data/local/tmp/minicap

# 重新设置权限
adb shell chmod 777 /data/local/tmp/minicap
adb shell chmod 777 /data/local/tmp/minicap.so
```

### 2. 日志查看

所有截图操作都会记录详细日志：

```javascript
// 监听截图进度
window.screenshotAPI?.onScreenshotProgress?.((event, msg) => {
  console.log(`[截图] ${msg}`);
});
```

### 3. 调试模式

启用详细日志输出：

```javascript
// 在 main.js 中启用调试
const DEBUG = true;

if (DEBUG) {
  console.log('MiniCap 调试模式已启用');
}
```

## 性能优化

### 1. 截图优化

- **压缩格式**: 使用 PNG 格式保证质量
- **分辨率适配**: 根据设备分辨率自动调整
- **缓存机制**: 避免重复安装 MiniCap

### 2. 资源管理

- **自动清理**: 截图完成后自动清理临时文件
- **进程管理**: 及时停止 MiniCap 进程
- **端口管理**: 自动清理端口转发

### 3. 错误处理

- **重试机制**: 失败时自动重试
- **降级策略**: MiniCap 失败时使用 ADB
- **超时控制**: 设置合理的超时时间

## 扩展功能

### 1. 定时截图

可以扩展为支持按时间间隔自动截图：

```javascript
// 定时截图
setInterval(async () => {
  await takeScreenshot(deviceId, deviceName, appPackage, log);
}, interval * 1000);
```

### 2. 截图压缩

添加图片压缩功能：

```javascript
import sharp from 'sharp';

async function compressScreenshot(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}
```

### 3. 云端存储

集成云存储服务：

```javascript
// 上传到云存储
async function uploadToCloud(filePath) {
  // 实现云存储上传逻辑
}
```

## 注意事项

1. **设备兼容性**: 确保设备支持 MiniCap
2. **权限要求**: 需要设备 root 权限或 USB 调试权限
3. **网络环境**: MiniCap 需要网络连接下载依赖
4. **存储空间**: 大量截图可能占用较多存储空间
5. **性能影响**: 频繁截图可能影响设备性能

## 更新日志

### v1.0.0 (2024-01-15)
- 实现基于 MiniCap 的截图功能
- 添加 ADB 备用方案
- 集成到任务执行流程
- 添加完整的测试和文档 