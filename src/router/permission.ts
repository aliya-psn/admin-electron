import router from '@/router';
import { useUserStoreHook } from '@/store/modules/user';
import { usePermissionStoreHook } from '@/store/modules/permission';
import { setRouteChange } from '@/hooks/useRouteListener';
import { useTitle } from '@/hooks/useTitle';
import { getToken } from '@/utils/token-storage';
import isWhiteList from '@/config/white-list';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const { setTitle } = useTitle();
NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, _from, next) => {
  console.log('Router beforeEach triggered', { to, _from });
  NProgress.start();

  const userToken = await getToken();

  if (to.path === '/login') {
    next();
    return;
  }

  if (userToken) {
    if (to.path === '/') {
      next('/dashboard');
      return;
    }

    const userStore = useUserStoreHook();
    const permissionStore = usePermissionStoreHook();

    if (!userStore.username) {
      try {
        await userStore.getInfo(userToken);
        // 菜单权限 生成可访问的 Routes
        const menus = userStore.menus;
        permissionStore.setRoutes(menus);
        next({ ...to, replace: true });
      } catch (error) {
        // 获取用户信息失败，清除 token 并跳转到登录页
        userStore.resetToken();
        next('/login');
      }
    } else {
      next();
    }
  } else if (isWhiteList(to)) {
    // 白名单
    next();
  } else {
    next('/login');
  }
});

router.afterEach(to => {
  console.log('Router afterEach triggered', { to });
  setRouteChange(to);
  setTitle(to.meta.title);
  NProgress.done();
});
