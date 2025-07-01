import { ref } from 'vue';
import store from '@/store';
import { defineStore } from 'pinia';
import { type RouteRecordRaw } from 'vue-router';
import { constantRoutes, dynamicRoutes } from '@/router';

export const usePermissionStore = defineStore('permission', () => {
  /** 可访问的路由 */
  const routes = ref<RouteRecordRaw[]>([]);

  /** 根据用户权限menus 动态生成菜单 */
  const setRoutes = (menus: string[]) => {
    // // 如果不需要动态路由，可直接使用所有路由
    // routes.value = constantRoutes.concat(dynamicRoutes);
    // return;

    // 筛选出本角色可用的路由
    const accessedRouters = filterAsyncRouter(dynamicRoutes, menus);
    // 将固定路由和新增路由进行合并, 成为本用户最终的全部路由信息
    const routers = constantRoutes.concat(accessedRouters);
    // 设置路由
    routes.value = routers;
  };

  return { routes, setRoutes };
});

/**
 * 递归过滤异步路由表，返回符合用户菜单权限的路由表
 * @param asyncRouterMap
 * @param menus
 */
const filterAsyncRouter = (asyncRouterMap: RouteRecordRaw[], menus: string[]): RouteRecordRaw[] => {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(menus, route)) {
      if (route.children && route.children.length) {
        // 如果这个路由下面还有下一级的话,就递归调用
        route.children = filterAsyncRouter(route.children, menus);
        // 如果过滤一圈后,没有子元素了,这个父级菜单就也不显示了
        return route.children && route.children.length;
      }
      return true;
    }
    return false;
  });
  return accessedRouters;
};

/**
 * 判断用户是否拥有此菜单
 * @param menus
 * @param route
 */
const hasPermission = (menus: string[], route: RouteRecordRaw) => {
  if (route.name && typeof route.name === 'string') {
    return menus.indexOf(route.name) > -1;
  }
  return true;
};

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
