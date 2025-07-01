import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';
import { history } from './helper';

const Layouts = () => import('@/layouts/index.vue');
/**
 * 常驻路由
 * 除了 redirect/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    meta: {
      hidden: true
    },
    alias: '/:pathMatch(.*)*'
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/',
    component: Layouts,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        name: 'dashboard',
        meta: {
          title: '首页',
          svgIcon: 'dashboard',
          keepAlive: true
        }
      }
    ]
  }
];

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/project',
    component: Layouts,
    children: [
      {
        name: 'project',
        path: 'list',
        component: () => import('@/views/project/index.vue'),
        meta: {
          title: '项目管理',
          svgIcon: '项目管理',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layouts,
    children: [
      {
        name: 'user',
        path: 'user',
        component: () => import('@/views/user-manage/user.vue'),
        meta: {
          title: '用户管理',
          svgIcon: '用户管理',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/file-operations',
    component: Layouts,
    children: [
      {
        name: 'file-operations',
        path: 'index',
        component: () => import('@/views/file-operations/index.vue'),
        meta: {
          title: '文件操作',
          svgIcon: 'link',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/system-features',
    component: Layouts,
    children: [
      {
        name: 'system-features',
        path: 'index',
        component: () => import('@/views/system-features/index.vue'),
        meta: {
          title: '系统功能',
          svgIcon: 'info',
          keepAlive: true
        }
      }
    ]
  }
];

const routes = constantRoutes.concat(dynamicRoutes);
const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
});

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach(route => {
      const { name, meta } = route;
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name);
      }
    });
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload();
  }
}

export default router;
