import { config } from './environment.js';

// 数据库配置文件
export const databaseConfig = {
  // MySQL 连接配置
  mysql: {
    ...config.database,
    // 连接池配置
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 连接选项
    idleTimeout: 60000, // 空闲连接超时时间 1分钟
    maxIdle: 10, // 最大空闲连接数
    enableKeepAlive: true, // 启用心跳包
    keepAliveInitialDelay: 0 // 心跳包初始延迟
  }
};

// 数据库连接健康检查配置
export const healthCheckConfig = {
  // 健康检查间隔时间（毫秒）
  interval: 5 * 60 * 1000, // 5分钟
  // 连接超时时间（毫秒）
  timeout: 5000
}; 