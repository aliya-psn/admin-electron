// Electron API 类型声明
interface FileAPI {
  read: (path: string, encoding?: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  write: (path: string, content: string, encoding?: string) => Promise<{ success: boolean; error?: string }>;
  exists: (path: string) => Promise<{ success: boolean; exists?: boolean; error?: string }>;
  mkdir: (path: string) => Promise<{ success: boolean; error?: string }>;
  readdir: (path: string) => Promise<{ success: boolean; files?: string[]; error?: string }>;
  stat: (path: string) => Promise<{ success: boolean; stats?: any; error?: string }>;
}

interface SystemAPI {
  getAll: () => Promise<{ success: boolean; data?: any; error?: string }>;
  getMemory: () => Promise<{ success: boolean; data?: any; error?: string }>;
  getCPU: () => Promise<{ success: boolean; data?: any; error?: string }>;
}

interface ClipboardAPI {
  readText: () => Promise<{ success: boolean; data?: string; error?: string }>;
  writeText: (text: string) => Promise<{ success: boolean; error?: string }>;
  readHTML: () => Promise<{ success: boolean; data?: string; error?: string }>;
  writeHTML: (html: string) => Promise<{ success: boolean; error?: string }>;
  readImage: () => Promise<{ success: boolean; data?: string; error?: string }>;
  writeImage: (dataUrl: string) => Promise<{ success: boolean; error?: string }>;
  clear: () => Promise<{ success: boolean; error?: string }>;
}

interface DialogAPI {
  openFile: (filters?: any[]) => Promise<{ success: boolean; data?: string[]; error?: string }>;
  saveFile: (filters?: any[]) => Promise<{ success: boolean; data?: string; error?: string }>;
  openDirectory: () => Promise<{ success: boolean; data?: string[]; error?: string }>;
  showMessageBox: (
    type?: string,
    title?: string,
    message?: string,
    detail?: string,
    buttons?: string[],
    defaultId?: number,
    cancelId?: number
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
}

interface NotificationAPI {
  show: (
    title?: string,
    body?: string,
    icon?: string,
    silent?: boolean,
    timeoutType?: string,
    id?: string
  ) => Promise<{ success: boolean; error?: string }>;
  isSupported: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
  on: (event: string, callback: (data: any) => void) => void;
}

interface ExternalAPI {
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  openPath: (path: string) => Promise<{ success: boolean; error?: string }>;
  showItemInFolder: (path: string) => Promise<{ success: boolean; error?: string }>;
  beep: () => Promise<{ success: boolean; error?: string }>;
  writeShortcutLink: (
    shortcutPath: string,
    operation: any
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  readShortcutLink: (shortcutPath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

interface WindowAPI {
  minimize: () => Promise<{ success: boolean; error?: string }>;
  maximize: () => Promise<{ success: boolean; error?: string }>;
  close: () => Promise<{ success: boolean; error?: string }>;
  setSize: (width: number, height: number) => Promise<{ success: boolean; error?: string }>;
  setPosition: (x: number, y: number) => Promise<{ success: boolean; error?: string }>;
  center: () => Promise<{ success: boolean; error?: string }>;
  setTitle: (title: string) => Promise<{ success: boolean; error?: string }>;
  getBounds: () => Promise<{ success: boolean; data?: any; error?: string }>;
  setBounds: (bounds: any) => Promise<{ success: boolean; error?: string }>;
  getScreenSize: () => Promise<{ success: boolean; data?: { width: number; height: number }; error?: string }>;
  restoreDefaultSize: () => Promise<{ success: boolean; data?: { width: number; height: number }; error?: string }>;
}

interface CmdAPI {
  exec: (command: string) => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
}

interface ElectronAPI {
  ipcRenderer: {
    send: (channel: string, data: any) => void;
    on: (channel: string, func: (...args: any[]) => void) => void;
    removeListener: (channel: string, func: (...args: any[]) => void) => void;
  };
}

export interface LoggerAPI {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
}

declare global {
  interface Window {
    fileAPI: FileAPI;
    systemAPI: SystemAPI;
    clipboardAPI: ClipboardAPI;
    dialogAPI: DialogAPI;
    notificationAPI: NotificationAPI;
    externalAPI: ExternalAPI;
    windowAPI: WindowAPI;
    cmdAPI: CmdAPI;
    electron: ElectronAPI;
    logger?: LoggerAPI;
  }
}

export {};
