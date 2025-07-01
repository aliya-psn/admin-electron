/**
 * 调用 Electron 主进程的 MySQL 查询接口
 * @param sql SQL 语句
 * @param params 参数数组
 * @returns 查询结果 Promise
 */
export async function mysqlQuery(sql: string, params: any[] = []): Promise<any> {
  // @ts-ignore
  if (!window.mysqlAPI) throw new Error('mysqlAPI not available');
  // @ts-ignore
  return await window.mysqlAPI.query(sql, params);
}
