## 🚀 依赖安装

```bash
# 因为需要安装 electron，建议使用yarn
yarn config set registry https://registry.npmmirror.com
yarn config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
yarn install
```

## ✔️ vite

```bash
# 启动
yarn dev

# 打包
yarn build
```

## 📦️ electron

```bash
# 启动
yarn electron:dev

# 打包
yarn electron:build
```

## 注意事项
- 菜单目前可动态配置，在/store/modules/user 下，可修改或者新增菜单。（menus.value与router 的 name 相对应）；

## 整体方案

### 前期配置

前端：Appium 相关环境检测、安装指令、负责任务配置、设备/应用管理、任务提交等。
Electron 主进程：负责与系统、设备、数据库等交互、维护任务队列，支持并发/排队、状态跟踪。

### 任务执行
在 Electron 前端提交任务。
主进程调用 runAppiumTask（IPC），通过 WebdriverIO 连接本地 Appium Server。
Appium Server 接收到请求后，驱动手机/模拟器，执行自动化操作，执行过程中通过 IPC 向前端推送进度、日志、截图等。。
结果和日志通过 IPC 反馈到前端。

### 环境检查

终端输入 appium -v 能看到版本号，说明 Appium Server 已安装。
终端输入 adb devices 能看到设备，说明 Android 环境没问题。
终端输入 xcode-select -p 能看到路径，说明 Xcode 已安装（仅限 macOS/iOS）。