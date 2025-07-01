import CacheKey from '@/constants/cache-key';
import Cookies from 'js-cookie';
import { isElectron } from '@/utils';

// 获取 token
export const getToken = () => {
  if (isElectron) {
    // @ts-ignore
    return window.electronLocalStorage.get('token');
  } else {
    return Cookies.get(CacheKey.TOKEN);
  }
};

// 设置 token
export const setToken = (token: string) => {
  if (isElectron) {
    // @ts-ignore
    window.electronLocalStorage.set('token', token);
  } else {
    Cookies.set(CacheKey.TOKEN, token);
  }
};

// 移除 token
export const removeToken = () => {
  if (isElectron) {
    // @ts-ignore
    window.electronLocalStorage.remove('token');
  } else {
    Cookies.remove(CacheKey.TOKEN);
  }
};
