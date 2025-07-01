import { ref } from 'vue';
import store from '@/store';
import { defineStore } from 'pinia';
import { useTagsViewStore } from './tags-view';
import { useSettingsStore } from './settings';
import { getToken, removeToken, setToken } from '@/utils/token-storage';
import { resetRouter } from '@/router';
import { loginApi, getUserInfoApi } from '@/api/login';
import { projectApi } from '@/api/project';
import { type LoginRequestData } from '@/api/types/login';
import { ProjectSelectModel } from '@/api/types/project';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '');
  const username = ref<string>('');
  const nickname = ref<string>('');
  const userId = ref<Number>();
  const admin = ref<Number>(0); // 是否是管理员

  const roleIds = ref<Array<Number>>([]); // 角色
  const menus = ref<Array<string>>([]); // 菜单
  const permissions = ref<Array<string>>([]); // 权限

  const projectList = ref<Array<ProjectSelectModel>>([]); // 项目列表

  const tagsViewStore = useTagsViewStore();
  const settingsStore = useSettingsStore();

  /** 登录 */
  const login = async ({ username, password }: LoginRequestData) => {
    const { data } = await loginApi({ username, password });
    setToken(data.token);
    token.value = data.token;
  };

  /** 获取用户详情 */
  const getInfo = async () => {
    const { data } = await getUserInfoApi();
    username.value = data.username;
    nickname.value = data.nickname;
    userId.value = data.userId;
    admin.value = data.admin;
    roleIds.value = data.roleIds || []; // roleIds: 1最高权限

    // 获取项目信息
    const res = await projectApi.getProjectList(Number(userId.value));
    projectList.value = res.data;

    // 菜单权限，如果不需要动态控制，可以在 permission.ts中设置为全部，这里可不写
    menus.value = ['user', 'project', 'file-operations', 'system-features'];
    permissions.value = [];
  };

  /** 登出 */
  const logout = () => {
    removeToken();
    token.value = '';
    resetRouter();
    _resetTagsView();
  };
  /** 重置 Token */
  const resetToken = () => {
    removeToken();
    token.value = '';
  };
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews();
      tagsViewStore.delAllCachedViews();
    }
  };
  return {
    token,
    username,
    nickname,
    admin,
    projectList,
    menus,
    permissions,
    userId,
    roleIds,
    login,
    getInfo,
    logout,
    resetToken
  };
});

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store);
}
