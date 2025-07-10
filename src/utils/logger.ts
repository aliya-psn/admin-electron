import type { LoggerAPI } from '@/types/global';

export function createLogger(tag = ''): LoggerAPI {
  return (
    (typeof window !== 'undefined' && window.logger) || {
      log: (...args: any[]) => {
        const timestamp = new Date().toLocaleString('zh-CN');
        console.log(`[${timestamp}]${tag ? ' [' + tag + ']' : ''}`, ...args);
      },
      error: (...args: any[]) => {
        const timestamp = new Date().toLocaleString('zh-CN');
        console.error(`[${timestamp}]${tag ? ' [' + tag + ']' : ''} [ERROR]`, ...args);
      },
      warn: (...args: any[]) => {
        const timestamp = new Date().toLocaleString('zh-CN');
        console.warn(`[${timestamp}]${tag ? ' [' + tag + ']' : ''} [WARN]`, ...args);
      }
    }
  );
}

export const logger: LoggerAPI = createLogger();
