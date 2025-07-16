/** 环境检测和主题管理工具 */

/**
 * 检测是否为 Electron 环境
 */
export const isElectronEnv = (): boolean => {
  // 检测 preload.js 暴露的API
  if (typeof window !== 'undefined') {
    return !!(
      (window as any).electron ||
      (window as any).fileAPI ||
      (window as any).systemAPI ||
      (window as any).windowAPI
    );
  }

  // 备用检测：process.versions.electron
  if (typeof process !== 'undefined' && process.versions && process.versions.electron) {
    return true;
  }

  return false;
};

/**
 * 检测是否为 Web 打包环境
 */
export const isWebBuildEnv = (): boolean => {
  // 在生产环境且非 Electron 环境下认为是 Web 打包
  return import.meta.env.PROD && !isElectronEnv();
};

/**
 * 获取环境对应的默认主题
 */
export const getDefaultThemeByEnv = (): string => {
  if (isElectronEnv()) {
    // Electron 环境使用客户端主题
    return 'client';
  } else {
    // Web 环境使用默认主题
    return 'default';
  }
};

/**
 * 应用主题到页面
 */
export const applyTheme = (themeKey: string): void => {
  const html = document.documentElement;

  // 移除所有主题类
  html.classList.remove('theme-default', 'theme-client', 'ui-theme-dark', 'dark', 'dark-blue', 'normal');

  // 应用新主题
  switch (themeKey) {
    case 'client':
      html.classList.add('theme-client');
      break;
    case 'dark':
      html.classList.add('ui-theme-dark');
      break;
    default:
      html.classList.add('theme-default');
      html.classList.add('normal'); // 保持与现有系统兼容
      break;
  }
};

/**
 * 保存主题设置到本地存储
 */
export const saveThemeToStorage = (themeKey: string): void => {
  localStorage.setItem('ui-theme', themeKey);
};

/**
 * 从本地存储加载主题设置
 */
export const loadThemeFromStorage = (): string | null => {
  return localStorage.getItem('ui-theme');
};

/**
 * 获取最终使用的主题（考虑用户设置和环境默认值）
 */
export const getFinalTheme = (): string => {
  // 优先使用用户保存的设置
  const savedTheme = loadThemeFromStorage();
  if (savedTheme) {
    return savedTheme;
  }

  // 如果没有用户设置，则根据环境返回默认主题
  return getDefaultThemeByEnv();
};

/**
 * 初始化主题系统
 */
export const initThemeSystem = (): string => {
  const isElectron = isElectronEnv();
  const envDefault = getDefaultThemeByEnv();
  const savedTheme = loadThemeFromStorage();
  const finalTheme = getFinalTheme();

  // 开发模式下输出调试信息
  if (import.meta.env.DEV) {
    console.log('🎨 主题系统初始化:');
    console.log(`  - 运行环境: ${isElectron ? 'Electron' : 'Web'}`);
    console.log(`  - 环境默认主题: ${envDefault}`);
    console.log(`  - 用户保存的主题: ${savedTheme || '无'}`);
    console.log(`  - 最终使用主题: ${finalTheme}`);
  }

  applyTheme(finalTheme);

  // 如果是首次使用（没有保存的设置），保存环境默认主题
  if (!savedTheme) {
    saveThemeToStorage(finalTheme);
    if (import.meta.env.DEV) {
      console.log(`  - 保存默认主题: ${finalTheme}`);
    }
  }

  return finalTheme;
};
