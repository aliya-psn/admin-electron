export interface UserModel {
  username: string;
  nickname: string;
  createTime?: string;
  updateTime?: string;
  userId: number;
  roles: Array<{ roleId: number; roleName: string }>;
  roleNames?: string[];
}

export interface UserListParams {
  pageNum: number;
  pageSize: number;
  roleName?: string;
  username?: string;
  nickname?: string;
}

export interface UserListData {
  data: {
    userList: UserModel[];
    totalNum: number;
  };
}

export interface RoleModel {
  roleId: number;
  roleName: string;
  menus: Array<{
    permissions: Array<{
      permissionId: number;
      permissionName: string;
    }>;
    menuName: string;
    menuCode: string;
  }>;
  users: Array<{
    userId: number;
    nickname: string;
  }>;
}

export interface RoleListParams {
  roleName?: string;
  username?: string;
}

export interface RoleListData {
  data: RoleModel[];
}

export interface PermissionModel {
  permissions: Array<{
    id: number;
    requiredPerm: number;
    permissionName: string;
  }>;
  menuName: string;
}

export interface RoleAddParams {
  roleName: string;
  permissions: number[];
}

export interface RoleUpdateParams {
  id: number;
  roleName?: string;
  permissions?: number[];
}
