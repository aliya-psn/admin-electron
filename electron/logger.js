import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志文件目录
const logDir = path.resolve(__dirname, '../logs');
const LOG_RETAIN_DAYS = 7;

// 确保 logs 目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function getLogFilePath(level) {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return path.join(logDir, `${yyyy}-${mm}-${dd}-${level}.log`);
}

function cleanOldLogs() {
  fs.readdir(logDir, (err, files) => {
    if (err) return;
    const now = Date.now();
    files.forEach(file => {
      const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-(info|warn|error)\.log$/);
      if (match) {
        const fileDate = new Date(`${match[1]}-${match[2]}-${match[3]}`);
        const diffDays = (now - fileDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > LOG_RETAIN_DAYS - 1) {
          fs.unlink(path.join(logDir, file), err => {
            if (!err) {
              console.log(`已自动清理日志: ${file}`);
            }
          });
        }
      }
    });
  });
}

function appendLogToFile(level, message) {
  const logFile = getLogFilePath(level);
  fs.appendFile(logFile, message, err => {
    if (err) {
      // 文件写入失败也输出到控制台
      console.error('写入日志文件失败:', err);
    }
  });
  cleanOldLogs(); // 每次写日志时自动清理
}

export const logger = {
  log: (...args) => {
    const timestamp = new Date().toLocaleString('zh-CN');
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
    const logStr = `[${timestamp}] ${message}\n`;
    appendLogToFile('info', logStr);
    if (process.platform === 'win32') {
      const buffer = Buffer.from(logStr, 'utf8');
      process.stdout.write(buffer);
    } else {
      console.log(`[${timestamp}]`, ...args);
    }
  },
  error: (...args) => {
    const timestamp = new Date().toLocaleString('zh-CN');
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
    const logStr = `[${timestamp}] ERROR: ${message}\n`;
    appendLogToFile('error', logStr);
    if (process.platform === 'win32') {
      const buffer = Buffer.from(logStr, 'utf8');
      process.stderr.write(buffer);
    } else {
      console.error(`[${timestamp}] ERROR:`, ...args);
    }
  },
  warn: (...args) => {
    const timestamp = new Date().toLocaleString('zh-CN');
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
    const logStr = `[${timestamp}] WARN: ${message}\n`;
    appendLogToFile('warn', logStr);
    if (process.platform === 'win32') {
      const buffer = Buffer.from(logStr, 'utf8');
      process.stdout.write(buffer);
    } else {
      console.warn(`[${timestamp}] WARN:`, ...args);
    }
  }
};
