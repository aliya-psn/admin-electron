import { request } from '@/utils/service';
import type * as Login from './types/login';

export const loginApi = {
  /** 登录并返回 Token */
  async loginApi(_data: Login.LoginRequestData) {
    return new Promise<Login.LoginResponseData>(resolve => {
      resolve({
        code: 200,
        message: 'success',
        data: {
          token: 'b5ffd319bfd64bdb943c'
        }
      });
    });
    // return request<Login.LoginResponseData>({
    //   url: '/user/login',
    //   method: 'post',
    //   data: _data
    // });
  },

  /** 获取用户详情 */
  async getUserInfoApi(_username: string) {
    // return new Promise<Login.UserInfoResponseData>(resolve => {
    //   resolve({
    //     code: 200,
    //     message: '操作成功',
    //     data: {
    //       userId: 31,
    //       username: 'fsl_liuyilan',
    //       nickname: '刘怡兰',
    //       admin: 1,
    //       roleIds: [2]
    //     }
    //   });
    // });
    return request<Login.UserInfoResponseData>({
      url: '/login/getInfo',
      method: 'post'
    });
  }
};
