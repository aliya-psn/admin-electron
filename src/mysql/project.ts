import { mysqlQuery } from '@/service/mysql';
import { formatMysqlResult } from './util';

export const projectMq = {
  async getProjectList(projectMember: number) {
    const sql = `SELECT id, project_name AS name, app_type FROM project WHERE project_member LIKE ? AND app_type IS NOT NULL AND app_type != ''`;
    // 用逗号包裹，防止误匹配
    const likeStr = `%${projectMember}%`;
    const res = await mysqlQuery(sql, [likeStr]);
    return {
      data: Array.isArray(res) ? formatMysqlResult(res) : []
    };
  }
};
