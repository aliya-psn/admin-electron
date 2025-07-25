# 项目结构详细说明

## 📁 根目录结构

```
AppExploreTest/
├── 📁 electron/                 # Electron 主进程代码
├── 📁 src/                      # Vue 3 前端应用源码
├── 📁 scripts/                  # 构建和工具脚本
├── 📁 images/                   # 静态图片资源
├── 📁 build/                    # 构建产物目录（自动生成）
├── 📁 dist/                     # Web 构建输出目录（自动生成）
├── 📁 dist_electron/            # Electron 构建输出目录（自动生成）
├── 📄 package.json              # 项目配置和依赖
├── 📄 vite.config.ts            # Vite 构建配置
├── 📄 tsconfig.json             # TypeScript 配置
├── 📄 unocss.config.ts          # UnoCSS 配置
├── 📄 prettier.config.js        # Prettier 代码格式化配置
├── 📄 commitlint.config.js      # Git 提交规范配置
├── 📄 app-loading.css           # 应用加载样式
├── 📄 index.html                # HTML 入口文件
└── 📄 README.md                 # 项目说明文档
```

## 📁 electron/ - Electron 主进程

```
electron/
├── 📁 appium/                   # Appium 自动化测试相关
│   └── 📄 runner.js             # Appium 任务运行器，后边不会使用，会使用 python 服务
├── 📁 config/                   # 配置文件
│   ├── 📄 database.js           # 数据库连接配置
│   └── 📄 environment.js        # 环境变量配置
├── 📄 main.js                   # Electron 主进程入口文件
├── 📄 preload.js                # 预加载脚本，提供安全的 API
└── 📄 logger.js                 # 日志记录工具
```

### 主要文件说明

- **main.js**: Electron 主进程的核心文件，负责创建窗口、处理系统事件、管理应用生命周期
- **preload.js**: 在渲染进程中预加载的脚本，提供安全的 API 接口给渲染进程
- **logger.js**: 统一的日志记录工具，支持不同级别的日志输出
- **config/database.js**: MySQL 数据库连接配置和连接池管理
- **config/environment.js**: 应用环境配置，包括应用信息、API 地址等
- **appium/runner.js**: Appium 自动化测试任务的核心运行器

## 📁 src/ - Vue 3 前端应用

```
src/
├── 📁 api/                      # API 接口定义
│   ├── 📁 types/                # API 相关类型定义
│   │   ├── 📄 login.ts          # 登录相关类型
│   │   ├── 📄 project.ts        # 项目相关类型
│   │   └── 📄 user.ts           # 用户相关类型
│   ├── 📄 login.ts              # 登录 API 接口
│   ├── 📄 project.ts            # 项目 API 接口
│   └── 📄 user.ts               # 用户 API 接口
├── 📁 assets/                   # 静态资源
│   ├── 📁 error-page/           # 错误页面资源
│   │   └── 📄 404.png           # 404 页面图片
│   ├── 📁 login/                # 登录页面资源
│   │   └── 📄 login-bg.png      # 登录背景图
│   └── 📁 logo/                 # Logo 资源
│       ├── 📄 logo.png          # Logo 图片
│       └── 📄 logo-text.png     # Logo 文字图片
├── 📁 components/               # 公共组件
│   ├── 📁 DevTools/             # 开发者工具组件
│   │   └── 📄 index.vue         # 开发者工具主组件
│   ├── 📁 Notify/               # 通知组件
│   │   ├── 📄 data.ts           # 通知数据
│   │   ├── 📄 index.vue         # 通知主组件
│   │   └── 📄 NotifyList.vue    # 通知列表组件
│   ├── 📁 Pagination/           # 分页组件
│   │   └── 📄 index.vue         # 分页主组件
│   ├── 📁 PathMap/              # 路径映射组件
│   │   └── 📄 PathMap.vue       # 路径映射主组件
│   ├── 📁 Screenfull/           # 全屏组件
│   │   └── 📄 index.vue         # 全屏主组件
│   ├── 📁 SearchMenu/           # 搜索菜单组件
│   │   ├── 📄 index.vue         # 搜索菜单主组件
│   │   ├── 📄 SearchFooter.vue  # 搜索页脚组件
│   │   ├── 📄 SearchModal.vue   # 搜索模态框组件
│   │   └── 📄 SearchResult.vue  # 搜索结果组件
│   └── 📁 SvgIcon/              # SVG 图标组件
│       └── 📄 index.vue         # SVG 图标主组件
├── 📁 config/                   # 应用配置
│   ├── 📄 layouts.ts            # 布局配置
│   ├── 📄 route.ts              # 路由配置
│   └── 📄 white-list.ts         # 白名单配置
├── 📁 constants/                # 常量定义
│   ├── 📄 app-key.ts            # 应用键值常量
│   └── 📄 cache-key.ts          # 缓存键值常量
├── 📁 directives/               # 自定义指令
│   ├── 📄 index.ts              # 指令入口文件
│   └── 📁 permission/           # 权限指令
│       └── 📄 index.ts          # 权限指令实现
├── 📁 hooks/                    # 组合式函数
│   ├── 📄 useDevice.ts          # 设备相关 Hook
│   ├── 📄 useFetchSelect.ts     # 选择器数据获取 Hook
│   ├── 📄 useFullscreenLoading.ts # 全屏加载 Hook
│   ├── 📄 useLayoutMode.ts      # 布局模式 Hook
│   ├── 📄 usePagination.ts      # 分页 Hook
│   ├── 📄 useRouteListener.ts   # 路由监听 Hook
│   ├── 📄 useTitle.ts           # 标题管理 Hook
│   └── 📄 useWatermark.ts       # 水印 Hook
├── 📁 icons/                    # 图标资源
│   ├── 📄 index.ts              # 图标入口文件
│   └── 📁 svg/                  # SVG 图标文件
│       ├── 📄 back.svg          # 返回图标
│       ├── 📄 dashboard.svg     # 仪表盘图标
│       ├── 📄 fullscreen-exit.svg # 退出全屏图标
│       ├── 📄 fullscreen.svg    # 全屏图标
│       ├── 📄 info.svg          # 信息图标
│       ├── 📄 link.svg          # 链接图标
│       ├── 📄 lock.svg          # 锁定图标
│       ├── 📄 menu.svg          # 菜单图标
│       ├── 📄 search.svg        # 搜索图标
│       ├── 📄 任务配置.svg       # 任务配置图标
│       ├── 📄 服务管理.svg       # 服务管理图标
│       ├── 📄 环境配置.svg       # 环境配置图标
│       ├── 📄 用户管理.svg       # 用户管理图标
│       └── 📄 项目管理.svg       # 项目管理图标
├── 📁 layouts/                  # 布局组件
│   ├── 📁 components/           # 布局相关组件
│   │   ├── 📄 AppMain.vue       # 主内容区域组件
│   │   ├── 📁 Breadcrumb/       # 面包屑导航组件
│   │   │   └── 📄 index.vue     # 面包屑主组件
│   │   ├── 📁 CompConsumer/     # 组件消费者
│   │   │   └── 📄 index.ts      # 组件消费者实现
│   │   ├── 📁 Footer/           # 页脚组件
│   │   │   └── 📄 index.vue     # 页脚主组件
│   │   ├── 📁 Hamburger/        # 汉堡菜单组件
│   │   │   └── 📄 index.vue     # 汉堡菜单主组件
│   │   ├── 📄 index.ts          # 布局组件入口
│   │   ├── 📁 Logo/             # Logo 组件
│   │   │   └── 📄 index.vue     # Logo 主组件
│   │   ├── 📁 NavigationBar/    # 导航栏组件
│   │   │   └── 📄 index.vue     # 导航栏主组件
│   │   ├── 📁 RightPanel/       # 右侧面板组件
│   │   │   └── 📄 index.vue     # 右侧面板主组件
│   │   ├── 📁 SelectProject/    # 项目选择组件
│   │   │   └── 📄 index.vue     # 项目选择主组件
│   │   ├── 📁 Settings/         # 设置组件
│   │   │   ├── 📄 index.vue     # 设置主组件
│   │   │   └── 📄 SelectLayoutMode.vue # 布局模式选择组件
│   │   ├── 📁 Sidebar/          # 侧边栏组件
│   │   │   ├── 📄 index.vue     # 侧边栏主组件
│   │   │   ├── 📄 SidebarItem.vue # 侧边栏项组件
│   │   │   └── 📄 SidebarItemLink.vue # 侧边栏链接组件
│   │   └── 📁 TagsView/         # 标签视图组件
│   │       ├── 📄 index.vue     # 标签视图主组件
│   │       └── 📄 ScrollPane.vue # 滚动面板组件
│   ├── 📁 hooks/                # 布局相关 Hook
│   │   └── 📄 useResize.ts      # 尺寸调整 Hook
│   ├── 📄 index.vue             # 主布局组件
│   ├── 📄 LeftMode.vue          # 左侧布局模式
│   ├── 📄 LeftTopMode.vue       # 左上布局模式
│   └── 📄 TopMode.vue           # 顶部布局模式
├── 📁 mysql/                    # MySQL 数据库操作
│   ├── 📄 project.ts            # 项目数据库操作
│   ├── 📄 user.ts               # 用户数据库操作
│   └── 📄 util.ts               # 数据库工具函数
├── 📁 plugins/                  # 插件配置
│   ├── 📁 element-plus/         # Element Plus 插件
│   │   └── 📄 index.ts          # Element Plus 配置
│   ├── 📁 element-plus-icon/    # Element Plus 图标插件
│   │   └── 📄 index.ts          # Element Plus 图标配置
│   └── 📄 index.ts              # 插件入口文件
├── 📁 router/                   # 路由配置
│   ├── 📄 helper.ts             # 路由辅助函数
│   ├── 📄 index.ts              # 路由主配置
│   └── 📄 permission.ts         # 路由权限控制
├── 📁 service/                  # 服务层
│   ├── 📄 cmd.ts                # 命令执行服务
│   └── 📄 mysql.ts              # MySQL 服务
├── 📁 store/                    # 状态管理
│   ├── 📄 index.ts              # Store 入口文件
│   └── 📁 modules/              # Store 模块
│       ├── 📄 app.ts            # 应用状态模块
│       ├── 📄 permission.ts     # 权限状态模块
│       ├── 📄 settings.ts       # 设置状态模块
│       ├── 📄 tags-view.ts      # 标签视图状态模块
│       └── 📄 user.ts           # 用户状态模块
├── 📁 styles/                   # 样式文件
│   ├── 📄 element-plus.css      # Element Plus 样式
│   ├── 📄 element-plus.scss     # Element Plus SCSS 样式
│   ├── 📄 index.scss            # 主样式文件
│   ├── 📄 mixins.scss           # SCSS 混入
│   ├── 📁 themes/               # 主题样式
│   │   ├── 📄 theme-client.scss # 客户端主题
│   │   ├── 📄 theme-dark.scss   # 暗色主题
│   │   └── 📄 theme-default.scss # 默认主题
│   ├── 📄 variables.css         # CSS 变量
│   └── 📄 view-transition.scss  # 视图过渡样式
├── 📁 types/                    # TypeScript 类型定义
│   ├── 📄 api.d.ts              # API 类型定义
│   ├── 📄 env.d.ts              # 环境变量类型定义
│   ├── 📄 global-components.d.ts # 全局组件类型定义
│   ├── 📄 global.d.ts           # 全局类型定义
│   ├── 📄 papaparse.d.ts        # PapaParse 类型定义
│   ├── 📄 scroll-to.d.ts        # 滚动类型定义
│   ├── 📄 shims-vue.d.ts        # Vue 类型声明
│   └── 📄 vue-router.d.ts       # Vue Router 类型定义
├── 📁 utils/                    # 工具函数
│   ├── 📄 env-theme.ts          # 环境主题工具
│   ├── 📄 index.ts              # 工具函数入口
│   ├── 📄 local-storage.ts      # 本地存储工具
│   ├── 📄 logger.ts             # 日志工具
│   ├── 📄 scroll-to.js          # 滚动工具
│   ├── 📄 service.ts            # 服务工具
│   ├── 📄 token-storage.ts      # Token 存储工具
│   └── 📄 validate.ts           # 验证工具
├── 📁 views/                    # 页面组件
│   ├── 📁 dashboard/            # 仪表盘页面
│   │   └── 📄 index.vue         # 仪表盘主页面
│   ├── 📁 environment-setup/    # 环境配置页面
│   │   └── 📄 index.vue         # 环境配置主页面
│   ├── 📁 error-page/           # 错误页面
│   │   └── 📄 404.vue           # 404 错误页面
│   ├── 📁 explore-task/         # 探索任务页面
│   │   ├── 📄 config.vue        # 任务配置页面
│   │   ├── 📄 DeviceAppDetail.vue # 设备应用详情页面
│   │   ├── 📄 EnvGuideDialog.vue # 环境引导对话框
│   │   ├── 📄 execute.vue       # 任务执行页面
│   │   ├── 📄 InstallAppDialog.vue # 安装应用对话框
│   │   └── 📄 report.vue        # 测试报告页面
│   ├── 📁 login/                # 登录页面
│   │   ├── 📁 hooks/            # 登录相关 Hook
│   │   │   └── 📄 useFocus.ts   # 焦点管理 Hook
│   │   └── 📄 index.vue         # 登录主页面
│   ├── 📁 project/              # 项目管理页面
│   │   └── 📄 index.vue         # 项目管理主页面
│   ├── 📁 system-features/      # 系统功能页面
│   │   └── 📄 index.vue         # 系统功能主页面
│   └── 📁 user-manage/          # 用户管理页面
│       ├── 📄 role.vue          # 角色管理页面
│       └── 📄 user.vue          # 用户管理页面
├── 📄 App.vue                   # 根组件
└── 📄 main.ts                   # 应用入口文件
```

## 📁 scripts/ - 构建脚本

```
scripts/
└── 📄 gen-icon.js               # 生成应用图标脚本
```

## 📁 images/ - 静态图片资源

```
images/
├── 📄 file_1.png               # 示例图片 1
├── 📄 file_2.png               # 示例图片 2
├── 📄 file_3.png               # 示例图片 3
├── 📄 file_4.png               # 示例图片 4
├── 📄 file_5.png               # 示例图片 5
├── 📄 file_6.png               # 示例图片 6
├── 📄 file_7.png               # 示例图片 7
├── 📄 file_8.png               # 示例图片 8
├── 📄 file_9.png               # 示例图片 9
├── 📄 file_10.png              # 示例图片 10
└── 📄 file_11.png              # 示例图片 11
```

## 🔧 配置文件说明

### package.json
- **name**: 项目名称 "Swhy"
- **version**: 项目版本 "1.0.0"
- **main**: Electron 主进程入口文件
- **scripts**: 项目脚本命令
- **dependencies**: 生产环境依赖
- **devDependencies**: 开发环境依赖
- **build**: Electron 构建配置

### vite.config.ts
- **base**: 部署基础路径
- **resolve.alias**: 路径别名配置
- **server**: 开发服务器配置
- **build**: 构建配置
- **plugins**: Vite 插件配置

### tsconfig.json
- TypeScript 编译配置
- 路径映射配置
- 编译选项设置

### unocss.config.ts
- UnoCSS 原子化 CSS 框架配置
- 自定义规则和预设

## 📱 核心功能模块

### 1. 环境配置模块 (`src/views/environment-setup/`)
- Android SDK 环境检测
- iOS 开发环境检测
- 设备管理工具配置

### 2. 探索任务模块 (`src/views/explore-task/`)
- 任务配置 (`config.vue`)
- 任务执行 (`execute.vue`)
- 测试报告 (`report.vue`)
- 设备应用详情 (`DeviceAppDetail.vue`)
- 环境引导 (`EnvGuideDialog.vue`)
- 应用安装 (`InstallAppDialog.vue`)

### 3. 项目管理模块 (`src/views/project/`)
- 项目列表管理
- 项目信息维护

### 4. 用户管理模块 (`src/views/user-manage/`)
- 用户管理 (`user.vue`)
- 角色管理 (`role.vue`)

### 5. 系统功能模块 (`src/views/system-features/`)
- 系统功能展示
- 功能说明文档

## 🎨 样式系统

### 主题系统
- **默认主题**: `src/styles/themes/theme-default.scss`
- **暗色主题**: `src/styles/themes/theme-dark.scss`
- **客户端主题**: `src/styles/themes/theme-client.scss`

### 样式架构
- **Element Plus 样式**: `src/styles/element-plus.scss`
- **全局样式**: `src/styles/index.scss`
- **混入样式**: `src/styles/mixins.scss`
- **CSS 变量**: `src/styles/variables.css`

## 🔌 插件系统

### Element Plus 插件
- UI 组件库集成
- 图标库集成
- 主题定制

### 自定义插件
- SVG 图标插件
- 路由权限插件
- 状态管理插件

## 🗄️ 数据层架构

### API 层 (`src/api/`)
- RESTful API 接口定义
- TypeScript 类型定义
- 请求/响应拦截

### 服务层 (`src/service/`)
- 业务逻辑处理
- 数据转换
- 错误处理

### 状态管理 (`src/store/`)
- Pinia 状态管理
- 模块化状态设计
- 持久化存储

## 🔐 权限系统

### 路由权限 (`src/router/permission.ts`)
- 路由守卫
- 权限验证
- 动态路由加载

### 指令权限 (`src/directives/permission/`)
- 权限指令
- 按钮权限控制
- 菜单权限控制

## 📊 监控和日志

### 日志系统
- **前端日志**: `src/utils/logger.ts`
- **后端日志**: `electron/logger.js`
- **错误监控**: 全局错误捕获

### 性能监控
- 页面加载性能
- 组件渲染性能
- 网络请求性能

## 🚀 部署和构建

### 构建流程
1. **Web 构建**: Vite 构建 Vue 应用
2. **Electron 构建**: Electron Builder 打包桌面应用
3. **资源优化**: 图片压缩、代码分割
4. **平台适配**: Windows、macOS 平台适配

### 部署配置
- **开发环境**: 本地开发服务器
- **生产环境**: 静态资源部署
- **桌面应用**: 安装包分发

---

这个项目结构文档提供了完整的项目架构说明，帮助开发者快速理解项目的组织方式和各个模块的职责。 