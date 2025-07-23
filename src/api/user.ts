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
    return new Promise<UserListData>(resolve => {
      resolve({
        "code": "200",
        "message": "操作成功",
        "data": {
            "userList": [
                {
                    "createTime": "2025.03.13 13:02:15",
                    "deleteStatus": 0,
                    "roles": [
                        {
                            "roleId": 1,
                            "roleName": "管理员"
                        }
                    ],
                    "nickname": "刘怡兰",
                    "updateTime": "2025.06.25 10:54:39",
                    "userId": 31,
                    "username": "fsl_liuyilan"
                },
                {
                    "createTime": "2025.03.13 13:57:54",
                    "deleteStatus": 0,
                    "roles": [
                        {
                            "roleId": 1,
                            "roleName": "管理员"
                        }
                    ],
                    "nickname": "王越冬",
                    "updateTime": "2025.03.13 13:57:54",
                    "userId": 32,
                    "username": "230674"
                },
                {
                    "createTime": "2025.03.14 10:59:40",
                    "deleteStatus": 0,
                    "roles": [
                        {
                            "roleId": 2,
                            "roleName": "测试主管"
                        }
                    ],
                    "nickname": "余璐丹",
                    "updateTime": "2025.04.15 14:02:49",
                    "userId": 33,
                    "username": "230714"
                },
                {
                    "createTime": "2025.03.19 09:58:03",
                    "roles": [
                        {
                            "roleId": 2,
                            "roleName": "测试主管"
                        }
                    ],
                    "nickname": "李跃",
                    "updateTime": "2025.03.19 09:58:03",
                    "userId": 34,
                    "username": "230429"
                },
                {
                    "createTime": "2025.03.26 10:46:27",
                    "roles": [
                        {
                            "roleId": 3,
                            "roleName": "测试人员"
                        }
                    ],
                    "nickname": "原明杰",
                    "updateTime": "2025.03.26 10:46:27",
                    "userId": 35,
                    "username": "zrgj_yuanmingjie"
                },
                {
                    "createTime": "2025.04.10 09:58:46",
                    "roles": [
                        {
                            "roleId": 2,
                            "roleName": "测试主管"
                        }
                    ],
                    "nickname": "朱帅",
                    "updateTime": "2025.04.10 09:58:46",
                    "userId": 36,
                    "username": "fsl_zhushuai"
                },
                {
                    "createTime": "2025.04.10 16:37:42",
                    "roles": [
                        {
                            "roleId": 2,
                            "roleName": "测试主管"
                        }
                    ],
                    "nickname": "窦娜娜",
                    "updateTime": "2025.04.10 16:37:42",
                    "userId": 37,
                    "username": "zs_04073"
                },
            ],
            "totalNum": 7
        }
    })
    });
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
