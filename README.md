# Swhy 应用探索测试平台

一个基于 Vue 3 + Electron + Appium 的跨平台应用自动化测试平台，支持 Android 和 iOS 设备的应用探索测试。

## 🚀 快速开始

### 环境要求

- **Node.js**: 20.x 或 >=22.x
- **包管理器**: 推荐使用 Yarn
- **数据库**: MySQL 5.7+

```bash
# node版本要求
webdrivers要求: 20 || >=22  
# 因为需要安装 electron，建议使用yarn
yarn config set registry https://registry.npmmirror.com
yarn config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
yarn install
```

### 📦️ electron

```bash
# 启动
yarn electron:dev

# 打包
yarn electron:build


### ✔️ vite 以浏览器环境方式启动，目前不考虑使用

```bash
# 启动
yarn dev

# 打包
yarn build
```

### 日志查看

- 应用日志实现文件：`electron/logger.js`
- 开发工具：F12 开发者工具
- 系统日志：系统日志查看器


**注意**：菜单目前可动态配置，在 `src/store/modules/user` 下，可修改或者新增菜单。（menus.value 与 router 的 name 相对应）


## 📋 项目概述

Swhy 是一个现代化的应用测试平台，集成了以下核心功能：

- 🖥️ **跨平台桌面应用**：基于 Electron 构建，支持 Windows 和 macOS
- 📱 **多设备支持**：支持 Android 和 iOS 设备管理
- 🤖 **自动化测试**：基于 Appium 的应用探索测试
- 🎨 **现代化 UI**：基于 Vue 3 + Element Plus 的响应式界面
- 📊 **测试报告**：详细的测试结果分析和报告生成
- 👥 **用户管理**：完整的用户权限管理系统
- 🗄️ **数据持久化**：基于 MySQL 的数据存储

## 🏗️ 项目架构

### 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI 组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **构建工具**：Vite
- **桌面应用**：Electron
- **自动化测试**：Appium + WebDriverIO ---- 会放到 python 服务里，不在前端里实现
- **数据库**：MySQL
- **样式处理**：Sass + UnoCSS
- **代码规范**：ESLint + Prettier

### 目录结构

```
AppExploreTest/
├── 📁 electron/                 # Electron 主进程
│   ├── 📁 appium/              # Appium 相关配置
│   ├── 📁 config/              # 配置文件
│   ├── main.js                 # 主进程入口
│   ├── preload.js              # 预加载脚本
│   └── logger.js               # 日志工具
├── 📁 src/                     # Vue 应用源码
│   ├── 📁 api/                 # API 接口定义
│   ├── 📁 assets/              # 静态资源
│   ├── 📁 components/          # 公共组件
│   ├── 📁 config/              # 应用配置
│   ├── 📁 constants/           # 常量定义
│   ├── 📁 directives/          # 自定义指令
│   ├── 📁 hooks/               # 组合式函数
│   ├── 📁 icons/               # 图标资源
│   ├── 📁 layouts/             # 布局组件
│   ├── 📁 plugins/             # 插件配置
│   ├── 📁 router/              # 路由配置
│   ├── 📁 service/             # 服务层
│   ├── 📁 store/               # 状态管理
│   ├── 📁 styles/              # 样式文件
│   ├── 📁 types/               # TypeScript 类型定义
│   ├── 📁 utils/               # 工具函数
│   ├── 📁 views/               # 页面组件
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 应用入口
├── 📁 scripts/                 # 构建脚本
├── 📁 images/                  # 图片资源
├── package.json                # 项目配置
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
└── README.md                   # 项目文档
```

## 📱 核心功能

### 1. 环境配置
- Android SDK 环境检测和配置
- iOS 开发环境检测和配置
- 设备管理工具集成

### 2. 设备管理
- Android 设备检测和管理
- iOS 设备检测和管理
- 设备状态监控

### 3. 应用管理
- 应用安装和卸载
- 应用列表管理
- 应用信息查看

### 4. 测试任务
- 测试任务创建和配置
- 自动化测试执行
- 测试进度监控

### 5. 测试报告
- 测试结果分析
- 详细报告生成
- 数据可视化展示

### 6. 用户管理
- 用户账户管理
- 角色权限控制
- 系统设置

## 🔧 配置说明

### 数据库配置

在 `electron/config/database.js` 中配置 MySQL 连接：

```javascript
export const databaseConfig = {
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'your_username',
    password: 'your_password',
    database: 'swhy_test'
  }
};
```

### 环境变量

创建 `.env` 文件配置环境变量：

```bash
# 应用配置
VITE_APP_TITLE=Swhy 应用探索测试平台
VITE_APP_VERSION=1.0.0

# API 配置
VITE_API_BASE_URL=http://localhost:8081
```

## 🛠️ 开发指南

### 组件开发

- 组件放置在 `src/components/` 目录
- 页面组件放置在 `src/views/` 目录
- 使用 TypeScript 进行类型定义

### 路由配置

在 `src/router/index.ts` 中配置路由：

```typescript
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/your-route',
    component: Layouts,
    children: [
      {
        name: 'your-page',
        path: 'index',
        component: () => import('@/views/your-page/index.vue'),
        meta: {
          title: '页面标题',
          svgIcon: 'icon-name',
          keepAlive: true
        }
      }
    ]
  }
];
```