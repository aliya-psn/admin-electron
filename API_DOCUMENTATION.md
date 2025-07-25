# API 文档

## 📋 概述

本文档描述了 Swhy 应用探索测试平台的 API 接口。所有 API 都遵循 RESTful 设计原则，使用 JSON 格式进行数据交换。

### 基础信息

- **基础 URL**: `http://localhost:8081`
- **内容类型**: `application/json`
- **字符编码**: `UTF-8`
- **认证方式**: Bearer Token

### 响应格式

所有 API 响应都遵循统一的格式：

```typescript
interface ApiResponse<T> {
  code: number;        // 状态码
  message: string;     // 消息
  data: T;            // 数据
  timestamp: string;   // 时间戳
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 🔐 认证相关

### 登录

**接口地址**: `POST /api/auth/login`

**请求参数**:

```typescript
interface LoginRequest {
  username: string;    // 用户名
  password: string;    // 密码
}
```

**响应数据**:

```typescript
interface LoginResponse {
  token: string;       // 访问令牌
  refreshToken: string; // 刷新令牌
  user: UserInfo;      // 用户信息
  expiresIn: number;   // 过期时间（秒）
}
```

**示例**:

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }'
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "expiresIn": 3600
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 刷新令牌

**接口地址**: `POST /api/auth/refresh`

**请求参数**:

```typescript
interface RefreshRequest {
  refreshToken: string; // 刷新令牌
}
```

**响应数据**:

```typescript
interface RefreshResponse {
  token: string;       // 新的访问令牌
  expiresIn: number;   // 过期时间（秒）
}
```

### 登出

**接口地址**: `POST /api/auth/logout`

**请求头**: `Authorization: Bearer <token>`

**响应数据**:

```typescript
interface LogoutResponse {
  success: boolean;    // 是否成功
}
```

## 👥 用户管理

### 获取用户列表

**接口地址**: `GET /api/users`

**请求参数**:

```typescript
interface GetUsersRequest {
  page?: number;       // 页码，默认 1
  pageSize?: number;   // 每页数量，默认 10
  keyword?: string;    // 搜索关键词
  role?: string;       // 角色筛选
}
```

**响应数据**:

```typescript
interface GetUsersResponse {
  list: UserInfo[];    // 用户列表
  total: number;       // 总数
  page: number;        // 当前页
  pageSize: number;    // 每页数量
}

interface UserInfo {
  id: number;          // 用户ID
  username: string;    // 用户名
  email: string;       // 邮箱
  role: string;        // 角色
  status: string;      // 状态
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
}
```

**示例**:

```bash
curl -X GET "http://localhost:8081/api/users?page=1&pageSize=10" \
  -H "Authorization: Bearer <token>"
```

### 创建用户

**接口地址**: `POST /api/users`

**请求参数**:

```typescript
interface CreateUserRequest {
  username: string;    // 用户名
  email: string;       // 邮箱
  password: string;    // 密码
  role: string;        // 角色
}
```

**响应数据**:

```typescript
interface CreateUserResponse {
  id: number;          // 用户ID
  username: string;    // 用户名
  email: string;       // 邮箱
  role: string;        // 角色
  createdAt: string;   // 创建时间
}
```

### 更新用户

**接口地址**: `PUT /api/users/:id`

**请求参数**:

```typescript
interface UpdateUserRequest {
  username?: string;   // 用户名
  email?: string;      // 邮箱
  role?: string;       // 角色
  status?: string;     // 状态
}
```

### 删除用户

**接口地址**: `DELETE /api/users/:id`

**响应数据**:

```typescript
interface DeleteUserResponse {
  success: boolean;    // 是否成功
}
```

## 📱 设备管理

### 获取设备列表

**接口地址**: `GET /api/devices`

**请求参数**:

```typescript
interface GetDevicesRequest {
  platform?: string;   // 平台筛选 (android/ios)
  status?: string;     // 状态筛选
}
```

**响应数据**:

```typescript
interface GetDevicesResponse {
  list: DeviceInfo[];  // 设备列表
}

interface DeviceInfo {
  id: string;          // 设备ID
  name: string;        // 设备名称
  model: string;       // 设备型号
  platform: string;    // 平台 (android/ios)
  version: string;     // 系统版本
  apiLevel?: number;   // API 级别 (Android)
  status: string;      // 状态
  isConnected: boolean; // 是否连接
}
```

### 连接设备

**接口地址**: `POST /api/devices/:id/connect`

**响应数据**:

```typescript
interface ConnectDeviceResponse {
  success: boolean;    // 是否成功
  message: string;     // 消息
}
```

### 断开设备

**接口地址**: `POST /api/devices/:id/disconnect`

## 📦 应用管理

### 获取应用列表

**接口地址**: `GET /api/apps`

**请求参数**:

```typescript
interface GetAppsRequest {
  deviceId?: string;   // 设备ID
  platform?: string;   // 平台筛选
}
```

**响应数据**:

```typescript
interface GetAppsResponse {
  list: AppInfo[];     // 应用列表
}

interface AppInfo {
  id: string;          // 应用ID
  name: string;        // 应用名称
  packageName: string; // 包名
  version: string;     // 版本
  platform: string;    // 平台
  icon?: string;       // 图标
  isInstalled: boolean; // 是否已安装
}
```

### 安装应用

**接口地址**: `POST /api/apps/install`

**请求参数**:

```typescript
interface InstallAppRequest {
  deviceId: string;    // 设备ID
  appPath: string;     // 应用文件路径
}
```

**响应数据**:

```typescript
interface InstallAppResponse {
  success: boolean;    // 是否成功
  message: string;     // 消息
}
```

### 卸载应用

**接口地址**: `DELETE /api/apps/:id`

**请求参数**:

```typescript
interface UninstallAppRequest {
  deviceId: string;    // 设备ID
}
```

## 🧪 测试任务

### 创建测试任务

**接口地址**: `POST /api/tasks`

**请求参数**:

```typescript
interface CreateTaskRequest {
  name: string;        // 任务名称
  description?: string; // 任务描述
  deviceId: string;    // 设备ID
  appId: string;       // 应用ID
  config: TaskConfig;  // 任务配置
}

interface TaskConfig {
  duration: number;    // 测试时长（分钟）
  actions: Action[];   // 操作列表
  screenshots: boolean; // 是否截图
  logs: boolean;       // 是否记录日志
}

interface Action {
  type: string;        // 操作类型
  params: any;         // 操作参数
  delay?: number;      // 延迟时间（毫秒）
}
```

**响应数据**:

```typescript
interface CreateTaskResponse {
  id: string;          // 任务ID
  name: string;        // 任务名称
  status: string;      // 任务状态
  createdAt: string;   // 创建时间
}
```

### 获取任务列表

**接口地址**: `GET /api/tasks`

**请求参数**:

```typescript
interface GetTasksRequest {
  page?: number;       // 页码
  pageSize?: number;   // 每页数量
  status?: string;     // 状态筛选
}
```

**响应数据**:

```typescript
interface GetTasksResponse {
  list: TaskInfo[];    // 任务列表
  total: number;       // 总数
  page: number;        // 当前页
  pageSize: number;    // 每页数量
}

interface TaskInfo {
  id: string;          // 任务ID
  name: string;        // 任务名称
  description?: string; // 任务描述
  status: string;      // 任务状态
  progress: number;    // 进度 (0-100)
  deviceName: string;  // 设备名称
  appName: string;     // 应用名称
  createdAt: string;   // 创建时间
  startedAt?: string;  // 开始时间
  completedAt?: string; // 完成时间
}
```

### 启动任务

**接口地址**: `POST /api/tasks/:id/start`

**响应数据**:

```typescript
interface StartTaskResponse {
  success: boolean;    // 是否成功
  message: string;     // 消息
}
```

### 停止任务

**接口地址**: `POST /api/tasks/:id/stop`

**响应数据**:

```typescript
interface StopTaskResponse {
  success: boolean;    // 是否成功
  message: string;     // 消息
}
```

### 获取任务详情

**接口地址**: `GET /api/tasks/:id`

**响应数据**:

```typescript
interface TaskDetail {
  id: string;          // 任务ID
  name: string;        // 任务名称
  description?: string; // 任务描述
  status: string;      // 任务状态
  progress: number;    // 进度
  config: TaskConfig;  // 任务配置
  device: DeviceInfo;  // 设备信息
  app: AppInfo;        // 应用信息
  results?: TaskResult; // 测试结果
  createdAt: string;   // 创建时间
  startedAt?: string;  // 开始时间
  completedAt?: string; // 完成时间
}

interface TaskResult {
  screenshots: string[]; // 截图列表
  logs: string[];       // 日志列表
  actions: ActionResult[]; // 操作结果
  summary: TestSummary; // 测试摘要
}

interface ActionResult {
  type: string;        // 操作类型
  success: boolean;    // 是否成功
  message?: string;    // 消息
  timestamp: string;   // 时间戳
}

interface TestSummary {
  totalActions: number; // 总操作数
  successActions: number; // 成功操作数
  failedActions: number; // 失败操作数
  duration: number;    // 测试时长（秒）
}
```

## 📊 测试报告

### 获取报告列表

**接口地址**: `GET /api/reports`

**请求参数**:

```typescript
interface GetReportsRequest {
  page?: number;       // 页码
  pageSize?: number;   // 每页数量
  taskId?: string;     // 任务ID筛选
  dateRange?: string[]; // 日期范围
}
```

**响应数据**:

```typescript
interface GetReportsResponse {
  list: ReportInfo[];  // 报告列表
  total: number;       // 总数
  page: number;        // 当前页
  pageSize: number;    // 每页数量
}

interface ReportInfo {
  id: string;          // 报告ID
  taskId: string;      // 任务ID
  taskName: string;    // 任务名称
  status: string;      // 报告状态
  summary: TestSummary; // 测试摘要
  createdAt: string;   // 创建时间
}
```

### 获取报告详情

**接口地址**: `GET /api/reports/:id`

**响应数据**:

```typescript
interface ReportDetail {
  id: string;          // 报告ID
  task: TaskDetail;    // 任务详情
  summary: TestSummary; // 测试摘要
  screenshots: ScreenshotInfo[]; // 截图信息
  logs: LogInfo[];     // 日志信息
  actions: ActionResult[]; // 操作结果
  createdAt: string;   // 创建时间
}

interface ScreenshotInfo {
  id: string;          // 截图ID
  path: string;        // 文件路径
  timestamp: string;   // 时间戳
  description?: string; // 描述
}

interface LogInfo {
  level: string;       // 日志级别
  message: string;     // 日志消息
  timestamp: string;   // 时间戳
}
```

### 导出报告

**接口地址**: `GET /api/reports/:id/export`

**请求参数**:

```typescript
interface ExportReportRequest {
  format: 'pdf' | 'html' | 'json'; // 导出格式
}
```

**响应数据**: 文件流

## 🔧 系统配置

### 获取系统配置

**接口地址**: `GET /api/config`

**响应数据**:

```typescript
interface SystemConfig {
  appium: AppiumConfig; // Appium 配置
  database: DatabaseConfig; // 数据库配置
  storage: StorageConfig; // 存储配置
  features: FeatureConfig; // 功能配置
}

interface AppiumConfig {
  host: string;        // 主机地址
  port: number;        // 端口
  timeout: number;     // 超时时间
}

interface DatabaseConfig {
  host: string;        // 数据库主机
  port: number;        // 数据库端口
  database: string;    // 数据库名
}

interface StorageConfig {
  screenshots: string; // 截图存储路径
  logs: string;        // 日志存储路径
  reports: string;     // 报告存储路径
}

interface FeatureConfig {
  screenshot: boolean; // 是否启用截图
  video: boolean;      // 是否启用录屏
  analytics: boolean;  // 是否启用分析
}
```

### 更新系统配置

**接口地址**: `PUT /api/config`

**请求参数**:

```typescript
interface UpdateConfigRequest {
  appium?: Partial<AppiumConfig>;
  database?: Partial<DatabaseConfig>;
  storage?: Partial<StorageConfig>;
  features?: Partial<FeatureConfig>;
}
```

## 📈 统计分析

### 获取统计数据

**接口地址**: `GET /api/statistics`

**请求参数**:

```typescript
interface GetStatisticsRequest {
  type: 'daily' | 'weekly' | 'monthly'; // 统计类型
  dateRange?: string[]; // 日期范围
}
```

**响应数据**:

```typescript
interface StatisticsData {
  tasks: TaskStatistics;    // 任务统计
  devices: DeviceStatistics; // 设备统计
  apps: AppStatistics;      // 应用统计
  reports: ReportStatistics; // 报告统计
}

interface TaskStatistics {
  total: number;        // 总任务数
  running: number;      // 运行中任务数
  completed: number;    // 已完成任务数
  failed: number;       // 失败任务数
  successRate: number;  // 成功率
}

interface DeviceStatistics {
  total: number;        // 总设备数
  android: number;      // Android 设备数
  ios: number;          // iOS 设备数
  connected: number;    // 已连接设备数
}

interface AppStatistics {
  total: number;        // 总应用数
  android: number;      // Android 应用数
  ios: number;          // iOS 应用数
  installed: number;    // 已安装应用数
}

interface ReportStatistics {
  total: number;        // 总报告数
  today: number;        // 今日报告数
  thisWeek: number;     // 本周报告数
  thisMonth: number;    // 本月报告数
}
```

## 🔍 搜索功能

### 全局搜索

**接口地址**: `GET /api/search`

**请求参数**:

```typescript
interface SearchRequest {
  keyword: string;      // 搜索关键词
  type?: 'task' | 'device' | 'app' | 'report'; // 搜索类型
  limit?: number;       // 结果数量限制
}
```

**响应数据**:

```typescript
interface SearchResponse {
  tasks: TaskInfo[];    // 任务结果
  devices: DeviceInfo[]; // 设备结果
  apps: AppInfo[];      // 应用结果
  reports: ReportInfo[]; // 报告结果
  total: number;        // 总结果数
}
```

## 📝 错误处理

### 错误响应格式

```typescript
interface ErrorResponse {
  code: number;         // 错误码
  message: string;      // 错误消息
  details?: any;        // 错误详情
  timestamp: string;    // 时间戳
}
```

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 1001 | 参数验证失败 | 检查请求参数格式 |
| 1002 | 资源不存在 | 确认资源ID是否正确 |
| 1003 | 权限不足 | 检查用户权限 |
| 2001 | 设备连接失败 | 检查设备状态和连接 |
| 2002 | 应用安装失败 | 检查应用文件和应用权限 |
| 3001 | 任务执行失败 | 检查任务配置和设备状态 |
| 4001 | 数据库连接失败 | 检查数据库配置 |
| 5001 | 系统内部错误 | 查看服务器日志 |

## 🔐 安全说明

### 认证机制

- 使用 JWT (JSON Web Token) 进行身份认证
- Token 有效期为 1 小时
- 支持 Token 刷新机制
- 所有敏感接口都需要认证

### 权限控制

- 基于角色的访问控制 (RBAC)
- 支持细粒度的权限管理
- API 级别的权限验证

### 数据安全

- 所有敏感数据都进行加密存储
- 支持 HTTPS 传输
- 定期备份重要数据

## 📞 技术支持

如有 API 相关问题，请联系技术支持团队：

- **邮箱**: support@swhy.com
- **文档**: https://docs.swhy.com/api
- **GitHub**: https://github.com/swhy/app-explore-test/issues

---

本文档会随着 API 的更新而持续维护，请关注最新版本。 