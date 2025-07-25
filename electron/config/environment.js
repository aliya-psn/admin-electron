// 环境配置文件
const isDev = process.env.NODE_ENV === 'development';

// 开发环境配置
const devConfig = {
  database: {
    host: '192.168.179.129',
    user: 'root',
    password: 'Swhysc@123456@',
    database: 'cov-test'
  },
  app: {
    title: 'Swhy-FE (开发环境)',
    devTools: true
  }
};

// 生产环境配置
const prodConfig = {
  database: {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
  },
  app: {
    title: 'Swhy-FE',
    devTools: false
  }
};

// 根据环境导出配置
export const config = isDev ? devConfig : prodConfig;

// 获取当前环境
export const getEnvironment = () => ({
  isDev,
  isProd: !isDev,
  nodeEnv: process.env.NODE_ENV || 'development'
});
