import { request } from '@/utils/service';
import type {
  UserListParams,
  UserListData,
  RoleListParams,
  RoleListData,
  RoleAddParams,
  RoleUpdateParams,
  PermissionModel
} from './types/user';

interface Role {
  roleId: number;
  roleName: string;
}

interface GetAllRolesResponse {
  code: string;
  message: string;
  data: Role[];
}

export const userApi = {
  getUserList(_param: UserListParams) {
    return request<UserListData>({
      url: '/user/list',
      method: 'get',
      params: _param
    });
  },
  getAllRoles(_param: any): Promise<GetAllRolesResponse> {
    return new Promise(resolve => {
      resolve({
        code: '200',
        message: '操作成功',
        data: [
          {
            roleId: 1,
            roleName: '管理员'
          },
          {
            roleId: 2,
            roleName: '测试主管'
          },
          {
            roleId: 3,
            roleName: '测试人员'
          }
        ]
      });
    });
  },
  postUpdateUser(param: { userId: number; roleId: number }) {
    return request({
      url: '/user/updateUser',
      method: 'post',
      data: param
    });
  },
  deleteUser(userId: number) {
    return request({
      url: `/user/deleteUser/${userId}`,
      method: 'delete'
    });
  }
};
// 角色
export const roleApi = {
  getListRole(param: RoleListParams) {
    return request<RoleListData>({
      url: '/user/listRole',
      method: 'post',
      data: param
    });
  },
  getListAllPermission() {
    return request<Array<PermissionModel>>({
      url: '/user/listAllPermission',
      method: 'get'
    });
  },
  postAddRole(param: RoleAddParams) {
    return request({
      url: '/user/addRole',
      method: 'post',
      data: param
    });
  },
  postDeleteRole(param: { id: number }) {
    return request({
      url: '/user/deleteRole',
      method: 'post',
      data: param
    });
  },
  postUpdateRole(param: RoleUpdateParams) {
    return request({
      url: '/user/updateRole',
      method: 'post',
      data: param
    });
  }
};
