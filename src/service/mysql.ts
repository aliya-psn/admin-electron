import { ElMessage } from 'element-plus';
import { createLogger } from '@/utils/logger';
const logger = createLogger('MySQL');

/**
 * 调用 Electron 主进程的 MySQL 查询接口
 * @param sql SQL 语句
 * @param params 参数数组
 * @returns 查询结果 Promise
 */
export async function mysqlQuery(sql: string, params: any[] = []): Promise<any> {
  logger.log('执行查询:', {
    sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
    paramsCount: params.length
  });

  try {
    // @ts-ignore
    if (!window.mysqlAPI) throw new Error('mysqlAPI not available');
    // @ts-ignore
    const result = await window.mysqlAPI.query(sql, params);

    logger.log('查询成功:', {
      resultCount: Array.isArray(result) ? result.length : 1
    });

    return result;
  } catch (error: any) {
    // 记录错误信息
    logger.error('查询失败:', {
      error: error.message,
      code: error.code,
      errno: error.errno
    });
    ElMessage.error(error.message);

    // 处理特定的数据库连接错误
    if (error.message?.includes('ETIMEDOUT')) {
      throw new Error('数据库连接超时，请检查网络连接和数据库服务状态');
    } else if (error.message?.includes('ECONNREFUSED')) {
      throw new Error('数据库连接被拒绝，请检查数据库服务是否启动');
    } else if (error.message?.includes('ER_ACCESS_DENIED_ERROR')) {
      throw new Error('数据库访问权限错误，请检查用户名和密码');
    } else if (error.message?.includes('ENOTFOUND')) {
      throw new Error('无法找到数据库主机，请检查主机地址配置');
    } else {
      throw new Error(`数据库操作失败: ${error.message || '未知错误'}`);
    }
  }
}

/**
 * 获取数据库连接状态
 * @returns 数据库状态信息
 */
export async function getMysqlStatus(): Promise<any> {
  try {
    // @ts-ignore
    if (!window.mysqlAPI) throw new Error('mysqlAPI not available');
    // @ts-ignore
    const status = await window.mysqlAPI.getStatus();

    logger.log('数据库状态查询成功:', status);
    return status;
  } catch (error: any) {
    logger.error('数据库状态查询失败:', error.message);
    throw new Error(`获取数据库状态失败: ${error.message || '未知错误'}`);
  }
}
