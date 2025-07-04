import { type Directive } from 'vue';
import { useUserStoreHook } from '@/store/modules/user';

/** 权限指令，和权限判断函数 checkPermission 功能类似 */
export const permission: Directive = {
  mounted(el, binding) {
    const { value: permissionRole } = binding;
    const { permissions } = useUserStoreHook();
    if (permissionRole) {
      const hasPermission = permissions.filter(per => permissionRole === per);
      // hasPermission || (el.style.display = "none") // 隐藏
      hasPermission || el.parentNode?.removeChild(el); // 销毁
    } else {
      throw new Error(`need roles!`);
    }
  }
};
