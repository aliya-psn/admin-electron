/**
 * 调用 Electron 主进程的 cmd 命令执行接口
 * @param command 要执行的命令字符串
 * @param errorPrefix 错误信息
 * @returns Promise<{ success: boolean, stdout: string, stderr: string, error: string | null }>
 */
// logger 兼容 window.logger 和本地控制台
import { createLogger } from '@/utils/logger';
const logger = createLogger('CMD');

export async function executeCommand(
  command: string,
  errorPrefix: string = '命令执行失败'
): Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }> {
  if (!window.cmdAPI) {
    logger.error?.('CMD API 不可用', { command });
    return { success: false, error: 'CMD API 不可用' };
  }

  try {
    logger.log?.('执行命令:', command);
    const result = await window.cmdAPI.exec(command);
    logger.log?.('命令执行结果:', { command, result });
    return result;
  } catch (error) {
    logger.error?.(`${errorPrefix}:`, { command, error });
    console.error(`${errorPrefix}:`, error);
    return { success: false, error: String(error) };
  }
}
