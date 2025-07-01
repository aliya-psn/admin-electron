import dayjs from 'dayjs';
import { removeConfigLayout } from '@/utils/local-storage';
import { ElMessage } from 'element-plus';

// 判断是否为 Electron 环境
export const isElectron = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');

/** 格式化时间 */
export const formatDateTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format('YYYY-MM-DD HH:mm:ss') : 'N/A';
};

/** 浏览器 复制文本到剪贴板 */
export const copyTextToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      // 现代标准：1.兼容性：（Chrome 66+, Firefox 63+, Edge 79+）2.安全性：要求 HTTPS 或 localhost 环境、可能被浏览器权限系统阻止
      await navigator.clipboard.writeText(text);
      ElMessage.success('复制成功');
      return;
    }
    // 兼容性更好，但是会造成dom污染，execCommand已废弃；
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // 避免滚动
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0'; // 不可见
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const success = document.execCommand('copy');
      if (!success) throw new Error('复制命令执行失败');
    } finally {
      document.body.removeChild(textarea);
      ElMessage.success('复制成功');
    }
  } catch (error) {
    ElMessage.error('复制失败');
    console.error(error);
  }
};

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = '';
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName);
  } catch (error) {
    console.error(error);
  }
  return cssVariableValue;
};

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue);
  } catch (error) {
    console.error(error);
  }
};

/** 重置项目配置 */
export const resetConfigLayout = () => {
  removeConfigLayout();
  location.reload();
};
