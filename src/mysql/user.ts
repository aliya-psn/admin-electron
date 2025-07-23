import type { UserListParams, UserListData } from '../api/types/user';
import type * as Login from '../api/types/login';

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

export const userMq = {
  // 登录
  async loginApi(data: Login.LoginRequestData) {
    const sql = 'SELECT COUNT(*) as count FROM user WHERE username = ?';
    const res = await mysqlQuery(sql, [data.username]);
    const count = Array.isArray(res) && res.length ? res[0].count : 0;
    return count > 0
      ? {
          data: {
            token: data.username,
            username: data.username
          }
        }
      : {
          data: null
        };
  },

  // 获取用户信息
  async getUserInfoApi(userToken: string) {
    // 查询用户基本信息
    const userSql = 'SELECT id, username, nickname FROM user WHERE username = ? LIMIT 1';
    const userRes = await mysqlQuery(userSql, [userToken]);

    if (!Array.isArray(userRes) || userRes.length === 0) {
      return {
        data: null
      };
    }
    const { id, username, nickname } = userRes[0];
    // 查询用户角色ID
    const roleSql = 'SELECT role_id FROM sys_user_role WHERE user_id = ?';
    const roleRes = await mysqlQuery(roleSql, [id]);
    const roleIds = Array.isArray(roleRes) ? roleRes.map((item: any) => item.role_id) : [];
    return {
      data: {
        userId: id,
        username,
        nickname,
        roleIds
      }
    };
  },

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
      ORDER BY u.id DESC
    `;
    console.log(dbSql);
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
