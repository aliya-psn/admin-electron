export interface LoginRequestData {
  // 账号
  username: string;
  // 密码
  password: string;
}

export type LoginCodeResponseData = ApiResponseData<string>;

export type LoginResponseData = ApiResponseData<{ token: string }>;

// 用户信息接口响应参数
export type UserInfoResponseData = ApiResponseData<{
  username: string;
  nickname: string;
  userId: Number;

  roleIds: Array<Number>; // 角色
}>;
