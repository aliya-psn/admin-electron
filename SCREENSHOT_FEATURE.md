# Android 手机 App 截图功能实现方案

## 功能概述

本项目实现了基于 Vue 3 + Electron + Appium 的 Android 手机应用截图功能，支持在自动化测试过程中实时获取设备屏幕截图，并提供完整的截图管理功能。

## 架构设计

### 1. 技术栈
- **前端**: Vue 3 + TypeScript + Element Plus
- **桌面应用**: Electron
- **自动化测试**: Appium + WebDriverIO
- **文件管理**: Node.js fs 模块

### 2. 核心组件

#### 后端 (Electron 主进程)
- `electron/appium/runner.js`: Appium 任务运行器，包含截图核心逻辑
- `electron/main.js`: 主进程，处理截图相关的 IPC 通信
- `electron/preload.js`: 预加载脚本，暴露截图 API 给渲染进程

#### 前端 (Vue 应用)
- `src/views/explore-task/execute.vue`: 任务执行页面，包含截图界面
- `src/types/global.d.ts`: TypeScript 类型定义

## 功能特性

### 1. 实时截图
- 支持在任务执行过程中实时获取设备屏幕截图
- 自动生成带时间戳的截图文件名
- 支持 Android 和 iOS 设备

### 2. 截图管理
- 截图历史列表展示
- 截图预览和查看
- 批量删除功能
- 截图下载功能

### 3. 文件管理
- 自动创建截图存储目录
- 按设备名和应用包名组织文件
- 支持文件大小和创建时间显示

## 使用方法

### 1. 创建任务
1. 在任务配置页面选择设备和应用
2. 填写任务参数（任务名称、测试时长、截图间隔等）
3. 点击"创建任务"按钮

### 2. 执行任务
1. 任务创建成功后自动跳转到执行页面
2. 在"设备镜像"面板中可以看到截图控制按钮
3. 点击"截图"按钮获取当前设备屏幕截图
4. 点击"刷新"按钮更新截图列表

### 3. 管理截图
1. 点击"查看全部"按钮打开截图管理对话框
2. 在对话框中可以：
   - 查看所有截图列表
   - 预览截图缩略图
   - 删除单个或批量删除截图
   - 查看截图详细信息

## API 接口

### 截图操作 API

```typescript
interface ScreenshotAPI {
  // 获取设备截图
  takeScreenshot: (params: {
    client: any;
    deviceName: string;
    appPackage: string;
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
  
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

#### 1. takeScreenshot
```javascript
async function takeScreenshot(client, deviceName, appPackage, log) {
  // 使用 WebDriverIO 的截图 API
  const screenshotBuffer = await client.saveScreenshot();
  
  // 生成文件名并保存
  const filename = generateScreenshotFilename(deviceName, appPackage);
  const filePath = saveScreenshot(screenshotBuffer, filename);
  
  return { success: true, filePath, filename };
}
```

#### 2. generateScreenshotFilename
```javascript
function generateScreenshotFilename(deviceName, appPackage) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const safeDeviceName = deviceName.replace(/[^a-zA-Z0-9]/g, '_');
  const safePackage = appPackage.replace(/[^a-zA-Z0-9]/g, '_');
  return `${safeDeviceName}_${safePackage}_${timestamp}.png`;
}
```

## 文件结构

```
screenshots/
├── HUAWEI_Mate_X5_com.huawei.testmall_2024-01-15T10-30-45.png
├── HUAWEI_Mate_X5_com.huawei.testmall_2024-01-15T10-31-12.png
└── iPhone_15_Pro_com.apple.messages_2024-01-15T10-32-00.png
```

## 配置说明

### 1. 截图存储路径
默认存储在项目根目录的 `screenshots` 文件夹中，可通过修改 `SCREENSHOTS_DIR` 常量自定义。

### 2. 截图格式
默认使用 PNG 格式，可通过修改 `SCREENSHOT_FORMAT` 常量更改。

### 3. 文件名规则
格式：`{设备名}_{应用包名}_{时间戳}.{格式}`
- 设备名和应用包名中的特殊字符会被替换为下划线
- 时间戳格式：YYYY-MM-DDTHH-mm-ss

## 错误处理

### 1. 常见错误
- **设备连接失败**: 检查设备是否已连接并启用 USB 调试
- **Appium 服务未启动**: 确保 Appium 服务正常运行
- **权限不足**: 确保应用有文件系统访问权限

### 2. 错误日志
所有截图操作都会记录详细的日志信息，可在任务执行页面的日志面板中查看。

## 扩展功能

### 1. 定时截图
可以扩展为支持按时间间隔自动截图的功能。

### 2. 截图压缩
可以添加截图压缩功能以节省存储空间。

### 3. 云端存储
可以集成云存储服务，将截图上传到云端。

### 4. 截图分析
可以集成图像识别技术，自动分析截图内容。

## 测试验证

运行测试脚本验证功能：
```bash
node test-screenshot.js
```

## 注意事项

1. 确保 Android 设备已启用 USB 调试模式
2. 确保已安装并配置好 Android SDK
3. 确保 Appium 服务正常运行
4. 截图功能需要设备屏幕处于解锁状态
5. 大量截图可能占用较多存储空间，建议定期清理

## 更新日志

### v1.0.0 (2024-01-15)
- 实现基础截图功能
- 添加截图管理界面
- 支持截图预览和删除
- 集成到任务执行流程中 