# 开发指南

## 🛠️ 开发环境搭建

### 系统要求

- **操作系统**: Windows 10+ 或 macOS 10.15+
- **Node.js**: 20.x 或 >=22.x
- **包管理器**: Yarn (推荐) 或 npm
- **数据库**: MySQL 5.7+
- **Git**: 最新版本

### 环境准备

#### 1. 安装 Node.js

```bash
# 使用 nvm 管理 Node.js 版本 (推荐)
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Windows
# 下载 nvm-windows: https://github.com/coreybutler/nvm-windows/releases

# 安装 Node.js 20.x
nvm install 20
nvm use 20
```

#### 2. 安装 Yarn

```bash
# 使用 npm 安装 Yarn
npm install -g yarn

# 验证安装
yarn --version
```

#### 3. 配置镜像源

```bash
# 配置 npm 镜像源
yarn config set registry https://registry.npmmirror.com

# 配置 Electron 镜像源
yarn config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
```

#### 4. 安装数据库

**MySQL 安装**:
- **Windows**: 下载 MySQL Installer
- **macOS**: 使用 Homebrew 安装 `brew install mysql`

**启动 MySQL 服务**:
```bash
# macOS
brew services start mysql

# Windows
# 通过服务管理器启动 MySQL 服务
```

### 项目初始化

#### 1. 克隆项目

```bash
git clone <repository-url>
cd AppExploreTest
```

#### 2. 安装依赖

```bash
yarn install
```

#### 3. 配置环境变量

创建 `.env` 文件：

```bash
# 应用配置
VITE_APP_TITLE=Swhy 应用探索测试平台
VITE_APP_VERSION=1.0.0

# API 配置
VITE_API_BASE_URL=http://localhost:8081

# 开发环境配置
VITE_PUBLIC_PATH=/
```

#### 4. 配置数据库

修改 `electron/config/database.js`：

```javascript
export const databaseConfig = {
  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'your_username',
    password: 'your_password',
    database: 'swhy_test',
    charset: 'utf8mb4',
    timezone: '+08:00'
  }
};
```

#### 5. 创建数据库

```sql
CREATE DATABASE swhy_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🚀 开发流程

### 启动开发服务器

```bash
# 启动 Web 开发服务器
yarn dev

# 启动 Electron 开发模式
yarn electron:dev
```

### 开发模式说明

- **Web 模式**: 纯前端开发，访问 `http://localhost:5173`
- **Electron 模式**: 桌面应用开发，包含主进程和渲染进程

### 热重载

- 前端代码修改会自动热重载
- Electron 主进程修改需要重启应用
- 配置文件修改需要重启开发服务器

## 📝 代码规范

### TypeScript 规范

#### 类型定义

```typescript
// 接口定义
interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

// 枚举定义
enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// 类型别名
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};
```

#### 组件类型

```typescript
// Vue 组件 Props 类型
interface Props {
  title: string;
  visible: boolean;
  data?: UserInfo[];
}

// 组件 Emits 类型
interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', data: UserInfo): void;
}
```

### Vue 3 规范

#### 组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入
import { ref, computed, onMounted } from 'vue';
import type { UserInfo } from '@/types/user';

// Props 定义
interface Props {
  title: string;
  data?: UserInfo[];
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
});

// Emits 定义
interface Emits {
  (e: 'confirm', data: UserInfo): void;
}

const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const formData = ref<UserInfo>({});

// 计算属性
const isValid = computed(() => {
  return formData.value.username && formData.value.email;
});

// 方法
const handleSubmit = async () => {
  loading.value = true;
  try {
    // 处理逻辑
    emit('confirm', formData.value);
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>

<style lang="scss" scoped>
/* 样式内容 */
</style>
```

#### 组合式函数 (Composables)

```typescript
// src/hooks/useUser.ts
import { ref, computed } from 'vue';
import type { UserInfo } from '@/types/user';

export function useUser() {
  const user = ref<UserInfo | null>(null);
  const isLoggedIn = computed(() => !!user.value);

  const login = async (credentials: LoginCredentials) => {
    // 登录逻辑
  };

  const logout = () => {
    user.value = null;
  };

  return {
    user: readonly(user),
    isLoggedIn,
    login,
    logout
  };
}
```

### 样式规范

#### SCSS 规范

```scss
// 变量定义
$primary-color: #409eff;
$border-radius: 4px;
$font-size-base: 14px;

// 混入定义
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 组件样式
.user-card {
  @include flex-center;
  padding: 16px;
  border-radius: $border-radius;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &__title {
    font-size: $font-size-base;
    font-weight: 600;
    @include text-ellipsis;
  }

  &__content {
    margin-top: 8px;
  }
}
```

#### UnoCSS 使用

```vue
<template>
  <div class="flex items-center justify-center p-4 bg-white rounded-lg shadow-md">
    <h2 class="text-lg font-semibold text-gray-800 truncate">
      {{ title }}
    </h2>
  </div>
</template>
```

### 文件命名规范

- **组件文件**: PascalCase (如 `UserCard.vue`)
- **工具文件**: camelCase (如 `useUser.ts`)
- **类型文件**: camelCase (如 `userTypes.ts`)
- **常量文件**: kebab-case (如 `app-constants.ts`)

### 目录结构规范

```
src/
├── components/          # 公共组件
│   └── UserCard/       # 组件目录
│       ├── index.vue   # 主组件
│       ├── types.ts    # 类型定义
│       └── style.scss  # 样式文件
├── views/              # 页面组件
│   └── user/           # 页面目录
│       ├── index.vue   # 主页面
│       ├── components/ # 页面私有组件
│       └── composables/ # 页面私有组合式函数
└── hooks/              # 全局组合式函数
```

## 🔧 开发工具配置

### VS Code 配置

#### 推荐扩展

```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### 工作区设置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "vue.codeActions.enabled": false
}
```

### Git 配置

#### Git Hooks

项目使用 `lint-staged` 和 `husky` 进行代码检查：

```json
{
  "lint-staged": {
    "*.{vue,js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,less,scss,html,md}": [
      "prettier --write"
    ]
  }
}
```

#### 提交规范

使用 Conventional Commits 规范：

```bash
# 提交类型
feat:     新功能
fix:      修复
docs:     文档更新
style:    代码格式
refactor: 重构
test:     测试
chore:    构建过程或辅助工具的变动

# 示例
git commit -m "feat: 添加用户管理功能"
git commit -m "fix: 修复登录页面样式问题"
```

## 🧪 测试指南

### 单元测试

```bash
# 运行测试
yarn test

# 运行测试并生成覆盖率报告
yarn test:coverage

# 监听模式
yarn test:watch
```

### 组件测试示例

```typescript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import UserCard from '@/components/UserCard/index.vue';

describe('UserCard', () => {
  it('renders user information correctly', () => {
    const user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    };

    const wrapper = mount(UserCard, {
      props: { user }
    });

    expect(wrapper.text()).toContain('testuser');
    expect(wrapper.text()).toContain('test@example.com');
  });
});
```

## 📦 构建和部署

### 构建流程

```bash
# 构建 Web 应用
yarn build

# 构建 Electron 应用
yarn electron:build

# 构建特定平台
yarn electron:build:mac
yarn electron:build:win
```

### 构建配置

#### Vite 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus']
        }
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

#### Electron 构建配置

```json
{
  "build": {
    "appId": "com.swhy-fe.app",
    "productName": "Swhy-FE",
    "directories": {
      "output": "dist_electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "mac": {
      "target": ["dmg"],
      "category": "public.app-category.developer-tools"
    },
    "win": {
      "target": [{"target": "nsis", "arch": ["x64"]}]
    }
  }
}
```

## 🐛 调试指南

### 前端调试

#### Vue DevTools

```bash
# 安装 Vue DevTools
npm install -g @vue/devtools

# 启动 Vue DevTools
vue-devtools
```

#### 浏览器调试

```javascript
// 在代码中添加调试信息
console.log('调试信息:', data);
console.table(arrayData);
console.group('分组调试');
console.groupEnd();
```

### Electron 调试

#### 主进程调试

```javascript
// electron/main.js
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

#### 渲染进程调试

- 使用 F12 打开开发者工具
- 在 Sources 面板中设置断点
- 使用 Console 面板查看日志

### 数据库调试

```javascript
// 数据库连接测试
const testConnection = async () => {
  try {
    const promisePool = mysqlPool.promise();
    const [rows] = await promisePool.execute('SELECT 1 as test');
    console.log('数据库连接成功:', rows);
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};
```

## 📚 常用命令

### 开发命令

```bash
# 启动开发服务器
yarn dev                    # Web 开发
yarn electron:dev          # Electron 开发

# 代码检查
yarn lint                  # 完整检查
yarn lint:eslint          # ESLint 检查
yarn lint:prettier        # Prettier 格式化

# 构建
yarn build                # Web 构建
yarn electron:build       # Electron 构建
yarn electron:build:mac   # macOS 构建
yarn electron:build:win   # Windows 构建

# 工具
yarn gen:icon             # 生成应用图标
yarn clean                # 清理构建文件
yarn analyze              # 构建分析
```

### Git 命令

```bash
# 代码提交
yarn commit               # 交互式提交
git add .                 # 添加文件
git commit -m "feat: 新功能" # 直接提交

# 分支管理
git checkout -b feature/new-feature  # 创建功能分支
git checkout main                    # 切换到主分支
git merge feature/new-feature        # 合并分支
```

## 🔍 常见问题

### 依赖安装问题

```bash
# 清除缓存
yarn cache clean

# 删除 node_modules
rm -rf node_modules

# 重新安装
yarn install
```

### 端口占用问题

```bash
# 查看端口占用
lsof -i :5173

# 杀死进程
kill -9 <PID>
```

### 数据库连接问题

```bash
# 检查 MySQL 服务状态
# macOS
brew services list | grep mysql

# Windows
sc query mysql
```

### Electron 构建问题

```bash
# 清理构建缓存
yarn clean

# 重新安装 Electron
yarn add electron --dev

# 设置镜像源
yarn config set electron_mirror https://cdn.npmmirror.com/binaries/electron/
```

---

这个开发指南提供了完整的开发环境搭建、代码规范、开发流程和调试方法，帮助开发者快速上手项目开发。 