import type { UserListParams, UserListData } from '../api/types/user';
import { mysqlQuery } from '@/service/mysql';
import { formatMysqlResult } from './util';

function attachRoles(list: any[]) {
  return list.map(item => {
    const { roleId, roleName, ...rest } = item;
    return {
      ...rest,
      roles: roleId !== undefined && roleId !== null ? [{ roleId, roleName }] : []
    };
  });
}

export const mqUserApi = {
  // mysql 查询用户列表带分页和条件
  async getUserList(_param: UserListParams): Promise<UserListData> {
    const { pageNum, pageSize, roleName = '', username = '', nickname = '' } = _param;
    const offset = (pageNum - 1) * pageSize;

    let whereSql = 'WHERE 1=1';
    const params: any[] = [];

    if (username) {
      whereSql += ' AND u.username LIKE ?';
      params.push(`%${username}%`);
    }
    if (nickname) {
      whereSql += ' AND u.nickname LIKE ?';
      params.push(`%${nickname}%`);
    }
    if (roleName) {
      whereSql += ' AND r.role_name LIKE ?';
      params.push(`%${roleName}%`);
    }

    // 查询总数
    const totalSql = `
      SELECT COUNT(*) as totalNum
      FROM user u
      LEFT JOIN sys_user_role ur ON ur.user_id = u.id
      LEFT JOIN sys_role r ON ur.role_id = r.id
      ${whereSql}
    `;
    const totalRes = await mysqlQuery(totalSql, params);
    const totalNum = Array.isArray(totalRes) && totalRes.length ? totalRes[0].totalNum : 0;

    // 查询数据
    const dbSql = `
      SELECT
        u.id AS userId,
        u.username,
        u.nickname,
        u.create_time,
        u.update_time,
        u.is_deleted AS deleteStatus,
        ur.role_id AS roleId,
        r.role_name AS roleName
      FROM user u
      LEFT JOIN sys_user_role ur ON ur.user_id = u.id
      LEFT JOIN sys_role r ON ur.role_id = r.id
      ${whereSql}
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, pageSize, offset];
    const res = await mysqlQuery(dbSql, dataParams);
    let userList = Array.isArray(res) ? formatMysqlResult(res) : [];
    userList = attachRoles(userList);
    return {
      data: {
        userList,
        totalNum
      }
    };
  }
};
