/**
 * 调用 Electron 主进程的 cmd 命令执行接口
 * @param command 要执行的命令字符串
 * @returns Promise<{ success: boolean, stdout: string, stderr: string, error: string | null }>
 */
export async function execCmd(
  command: string
): Promise<{ success: boolean; stdout: string; stderr: string; error: string | null }> {
  // @ts-ignore
  if (!window.cmdAPI) throw new Error('cmdAPI not available');
  // @ts-ignore
  return await window.cmdAPI.exec(command);
}
