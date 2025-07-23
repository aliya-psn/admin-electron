import { request } from '@/utils/service';
import * as Project from './types/project';

export const projectApi = {
  // 不带分页
  getProjectList(projectMember: number) {
    return new Promise<{ data: Array<Project.ProjectSelectModel> }>(resolve => {
      resolve({
        data: [
          {
            id: 'SAE005801',
            name: '新一代消息中心',
            appType: 5
          },
          {
            id: 'SCB006801',
            name: '权益类场外衍生品网厅系统',
            appType: 1
          },
          {
            id: 'SDC000101',
            name: '业务中台',
            appType: 1
          },
          {
            id: 'TEST00001',
            name: '非轻舟云部署测试项目',
            appType: 5
          },
          {
            id: 'TEST00002',
            name: '测试项目2',
            appType: 5
          }
        ]
      });
    });
    return request<{ data: Array<Project.ProjectSelectModel> }>({
      url: `/api/project/getProjects/${projectMember}`,
      method: 'get'
    });
  },
  // 带分页参数的接口
  getProjectListWithPage(param: Project.ProjectParams) {
    return new Promise<{ data: { projectList: Array<Project.ProjectModel>; totalNum: number } }>(resolve => {
      resolve({
        data: {
          projectList: [
            {
              id: 'SAE005801',
              projectName: '新一代消息中心',
              projectDesc: '新一代消息中心',
              projectMember: '[31, 32, 33, 36]',
              createTime: '2025-06-04 10:04:29',
              updateTime: '2025-06-04 10:04:29',
              createUser: '王越冬',
              updateUser: '王越冬',
              isDeleted: 0,
              appType: 5
            },
            {
              id: 'SCB006801',
              projectName: '权益类场外衍生品网厅系统',
              projectDesc: '权益类场外衍生品网厅系统',
              projectMember: '[31, 32, 33, 34, 35, 36, 42]',
              createTime: '2025-03-03 13:13:57',
              updateTime: '2025-06-05 10:52:39',
              isDeleted: 0,
              appType: 1
            },
            {
              id: 'SDC000101',
              projectName: '业务中台',
              projectDesc: '业务中台',
              projectMember: '[31, 32, 33, 36, 37, 38, 39, 40]',
              createTime: '2025-04-10 16:11:43',
              updateTime: '2025-05-27 15:32:16',
              isDeleted: 0,
              appType: 1
            },
            {
              id: 'SFA005701',
              projectName: '申财有道',
              projectDesc: '申财有道APP',
              projectMember: '[31, 32, 33, 34, 35, 36, 42]',
              createTime: '2025-04-15 14:53:36',
              updateTime: '2025-04-15 14:53:44'
            },
            {
              id: 'TEST00001',
              projectName: '非轻舟云部署测试项目',
              projectDesc: '测试项目描述',
              projectMember: '[36, 31, 32, 33, 34, 35]',
              createTime: '2025-03-03 13:14:48',
              updateTime: '2025-05-30 14:57:25',
              updateUser: '余璐丹',
              isDeleted: 0,
              appType: 5
            }
          ],
          totalNum: 5
        }
      });
    });
    return request<Project.ProjectData>({
      url: `/api/project/getProjectList`,
      method: 'post',
      data: param
    });
  },
};
