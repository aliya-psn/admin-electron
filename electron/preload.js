const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    removeListener: (channel, func) => {
      ipcRenderer.removeListener(channel, func);
    }
  }
});

// 暴露文件操作 API
contextBridge.exposeInMainWorld('fileAPI', {
  read: (path, encoding) => ipcRenderer.invoke('file-operations', 'read', path, encoding),
  write: (path, content, encoding) => ipcRenderer.invoke('file-operations', 'write', path, content, encoding),
  exists: path => ipcRenderer.invoke('file-operations', 'exists', path),
  mkdir: path => ipcRenderer.invoke('file-operations', 'mkdir', path),
  readdir: path => ipcRenderer.invoke('file-operations', 'readdir', path),
  stat: path => ipcRenderer.invoke('file-operations', 'stat', path)
});

// 暴露系统信息 API
contextBridge.exposeInMainWorld('systemAPI', {
  getAll: () => ipcRenderer.invoke('system-info', 'get-all'),
  getMemory: () => ipcRenderer.invoke('system-info', 'get-memory'),
  getCPU: () => ipcRenderer.invoke('system-info', 'get-cpu')
});

// 暴露剪贴板 API
contextBridge.exposeInMainWorld('clipboardAPI', {
  readText: () => ipcRenderer.invoke('clipboard-operations', 'read-text'),
  writeText: text => ipcRenderer.invoke('clipboard-operations', 'write-text', text),
  readHTML: () => ipcRenderer.invoke('clipboard-operations', 'read-html'),
  writeHTML: html => ipcRenderer.invoke('clipboard-operations', 'write-html', html),
  readImage: () => ipcRenderer.invoke('clipboard-operations', 'read-image'),
  writeImage: dataUrl => ipcRenderer.invoke('clipboard-operations', 'write-image', dataUrl),
  clear: () => ipcRenderer.invoke('clipboard-operations', 'clear')
});

// 暴露对话框 API
contextBridge.exposeInMainWorld('dialogAPI', {
  openFile: filters => ipcRenderer.invoke('dialog-operations', 'open-file', filters),
  saveFile: filters => ipcRenderer.invoke('dialog-operations', 'save-file', filters),
  openDirectory: () => ipcRenderer.invoke('dialog-operations', 'open-directory'),
  showMessageBox: (type, title, message, detail, buttons, defaultId, cancelId) =>
    ipcRenderer.invoke('dialog-operations', 'message-box', type, title, message, detail, buttons, defaultId, cancelId)
});

// 暴露通知 API
contextBridge.exposeInMainWorld('notificationAPI', {
  show: (title, body, icon, silent, timeoutType, id) =>
    ipcRenderer.invoke('notification-operations', 'show', title, body, icon, silent, timeoutType, id),
  isSupported: () => ipcRenderer.invoke('notification-operations', 'is-supported'),
  on: (event, callback) => {
    ipcRenderer.on(event, (_, data) => callback(data));
  }
});

// 暴露外部应用 API
contextBridge.exposeInMainWorld('externalAPI', {
  openExternal: url => ipcRenderer.invoke('external-operations', 'open-external', url),
  openPath: path => ipcRenderer.invoke('external-operations', 'open-path', path),
  showItemInFolder: path => ipcRenderer.invoke('external-operations', 'show-item-in-folder', path),
  beep: () => ipcRenderer.invoke('external-operations', 'beep'),
  writeShortcutLink: (shortcutPath, operation) =>
    ipcRenderer.invoke('external-operations', 'write-shortcut-link', shortcutPath, operation),
  readShortcutLink: shortcutPath => ipcRenderer.invoke('external-operations', 'read-shortcut-link', shortcutPath)
});

// 暴露窗口操作 API
contextBridge.exposeInMainWorld('windowAPI', {
  minimize: () => ipcRenderer.invoke('window-operations', 'minimize'),
  maximize: () => ipcRenderer.invoke('window-operations', 'maximize'),
  close: () => ipcRenderer.invoke('window-operations', 'close'),
  setSize: (width, height) => ipcRenderer.invoke('window-operations', 'set-size', width, height),
  setPosition: (x, y) => ipcRenderer.invoke('window-operations', 'set-position', x, y),
  center: () => ipcRenderer.invoke('window-operations', 'center'),
  setTitle: title => ipcRenderer.invoke('window-operations', 'set-title', title),
  getBounds: () => ipcRenderer.invoke('window-operations', 'get-bounds'),
  setBounds: bounds => ipcRenderer.invoke('window-operations', 'set-bounds', bounds),
  getScreenSize: () => ipcRenderer.invoke('window-operations', 'get-screen-size'),
  restoreDefaultSize: () => ipcRenderer.invoke('window-operations', 'restore-default-size')
});

// 暴露 mysqlQuery API
contextBridge.exposeInMainWorld('mysqlAPI', {
  query: (sql, params) => ipcRenderer.invoke('mysql-query', sql, params),
  getStatus: () => ipcRenderer.invoke('mysql-status')
});

// 暴露 execCmd API
contextBridge.exposeInMainWorld('cmdAPI', {
  exec: command => ipcRenderer.invoke('exec-cmd', command)
});

// 暴露 Cookie 存取 API
contextBridge.exposeInMainWorld('electronCookie', {
  set: (name, value) => ipcRenderer.invoke('set-cookie', { name, value }),
  get: name => ipcRenderer.invoke('get-cookie', name),
  remove: name => ipcRenderer.invoke('remove-cookie', name)
});

// 暴露 LocalStorage API
contextBridge.exposeInMainWorld('electronLocalStorage', {
  get: key => {
    return localStorage.getItem(key);
  },
  set: (key, value) => {
    localStorage.setItem(key, value);
  },
  remove: key => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
});

// 暴露 SessionStorage API
contextBridge.exposeInMainWorld('electronSessionStorage', {
  get: key => {
    return sessionStorage.getItem(key);
  },
  set: (key, value) => {
    sessionStorage.setItem(key, value);
  },
  remove: key => {
    sessionStorage.removeItem(key);
  },
  clear: () => {
    sessionStorage.clear();
  }
});

// 任务执行
contextBridge.exposeInMainWorld('electronAppiumAPI', {
  runAppiumTask: params => ipcRenderer.invoke('run-appium-task', params),
  onAppiumTaskProgress: callback => ipcRenderer.on('appium-task-progress', callback)
});

// 暴露 WebSocket 图片流 API
contextBridge.exposeInMainWorld('socketStreamAPI', {
  /**
   * 启动 WebSocket 图片流
   * @param {string} url - WebSocket 服务地址，如 ws://localhost:9002
   * @param {(blob: Blob) => void} cb - 每收到一帧图片时的回调，参数为图片 Blob
   * @returns {WebSocket} - 返回 WebSocket 实例，可用于关闭连接
   */
  start: (url, cb) => {
    const ws = new WebSocket(url);
    ws.binaryType = 'blob';
    ws.onmessage = event => {
      cb(event.data); // Blob
    };
    return ws;
  }
});

// 暴露 minicap 截图流 API
contextBridge.exposeInMainWorld('minicapAPI', {
  /**
   * 监听 minicap 截图帧
   * @param {(buf: ArrayBuffer) => void} cb - 每收到一帧图片时的回调，参数为图片 buffer
   */
  onFrame: cb => {
    ipcRenderer.on('minicap-frame', (event, buffer) => {
      cb(buffer);
    });
  },
  /**
   * 监听 minicap 错误
   * @param {(msg: string) => void} cb - 发生错误时的回调
   */
  onError: cb => {
    ipcRenderer.on('minicap-error', (event, msg) => {
      cb(msg);
    });
  },
  /**
   * 监听 minicap 关闭
   * @param {(msg: string) => void} cb - 连接关闭时的回调
   */
  onClosed: cb => {
    ipcRenderer.on('minicap-closed', (event, msg) => {
      cb(msg);
    });
  }
});
