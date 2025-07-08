<template>
  <div class="system-features-container">
    <el-card class="features-card">
      <template #header>
        <div class="card-header">
          <span>Electron 系统功能演示</span>
        </div>
      </template>

      <!-- 系统信息 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>系统信息</span>
            <el-button size="small" @click="refreshSystemInfo">刷新</el-button>
          </div>
        </template>

        <div v-if="systemInfo" class="system-info">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <el-card class="info-card">
                <h4>基本信息</h4>
                <p><strong>平台：</strong>{{ systemInfo.platform }}</p>
                <p><strong>架构：</strong>{{ systemInfo.arch }}</p>
                <p><strong>版本：</strong>{{ systemInfo.version }}</p>
                <p><strong>主机名：</strong>{{ systemInfo.hostname }}</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <el-card class="info-card">
                <h4>内存信息</h4>
                <p><strong>总内存：</strong>{{ formatBytes(systemInfo.totalmem) }}</p>
                <p><strong>可用内存：</strong>{{ formatBytes(systemInfo.freemem) }}</p>
                <p><strong>使用率：</strong>{{ memoryUsage }}%</p>
                <el-progress :percentage="Number(memoryUsage)" :color="memoryColor" />
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <el-card class="info-card">
                <h4>CPU 信息</h4>
                <p><strong>核心数：</strong>{{ systemInfo.cpus?.length || 0 }}</p>
                <p><strong>负载：</strong>{{ systemInfo.loadavg?.join(', ') || 'N/A' }}</p>
                <p><strong>运行时间：</strong>{{ formatUptime(systemInfo.uptime) }}</p>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- CMD 命令执行功能 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>CMD 命令执行</span>
          </div>
        </template>
        <div class="cmd-section">
          <el-input
            v-model="cmdInput"
            placeholder="请输入要执行的命令，如 dir 或 echo hello"
            @keyup.enter="runCmd"
            clearable
          />
          <div class="button-group" style="margin-top: 8px">
            <el-button type="primary" @click="runCmd">执行命令</el-button>
            <el-button @click="clearCmdResult">清空结果</el-button>
          </div>
          <el-card class="cmd-result-card" style="margin-top: 12px">
            <template #header>
              <span>执行结果</span>
            </template>
            <el-scrollbar height="120">
              <pre style="white-space: pre-wrap; word-break: break-all">{{ cmdResult }}</pre>
            </el-scrollbar>
          </el-card>
        </div>
      </el-card>

      <!-- 数据库操作功能 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>数据库操作</span>
          </div>
        </template>
        <div class="db-section">
          <el-input
            v-model="dbSql"
            placeholder="请输入要执行的 SQL 语句，如 SELECT * FROM users"
            @keyup.enter="runDbQuery"
            clearable
          />
          <div class="button-group" style="margin-top: 8px">
            <el-button type="primary" @click="runDbQuery">执行 SQL</el-button>
            <el-button @click="clearDbResult">清空结果</el-button>
          </div>
          <el-card class="db-result-card" style="margin-top: 12px">
            <template #header>
              <span>查询结果</span>
            </template>
            <el-scrollbar height="180">
              <el-table
                v-if="Array.isArray(dbResult) && dbResult.length"
                :data="dbResult"
                border
                size="small"
                style="width: 100%"
              >
                <el-table-column v-for="col in dbColumns" :key="col" :prop="col" :label="col" />
              </el-table>
              <div v-else-if="dbResultMsg" style="color: #888; padding: 8px">{{ dbResultMsg }}</div>
              <div v-else style="color: #888; padding: 8px">暂无数据</div>
            </el-scrollbar>
          </el-card>
        </div>
      </el-card>

      <!-- 剪贴板操作 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><DocumentCopy /></el-icon>
            <span>剪贴板操作</span>
          </div>
        </template>

        <div class="clipboard-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h4>文本操作</h4>
              <el-input v-model="clipboardText" type="textarea" :rows="4" placeholder="输入要复制到剪贴板的文本" />
              <div class="button-group">
                <el-button type="primary" @click="writeClipboardText">复制到剪贴板</el-button>
                <el-button type="success" @click="readClipboardText">从剪贴板读取</el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h4>HTML 操作</h4>
              <el-input v-model="clipboardHTML" type="textarea" :rows="4" placeholder="输入要复制到剪贴板的 HTML" />
              <div class="button-group">
                <el-button type="primary" @click="writeClipboardHTML">复制 HTML</el-button>
                <el-button type="success" @click="readClipboardHTML">读取 HTML</el-button>
              </div>
            </el-col>
          </el-row>
          <div class="button-group">
            <el-button type="warning" @click="clearClipboard">清空剪贴板</el-button>
          </div>
        </div>
      </el-card>

      <!-- 对话框操作 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><FolderOpened /></el-icon>
            <span>对话框操作</span>
          </div>
        </template>

        <div class="dialog-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <h4>文件操作</h4>
              <div class="button-group">
                <el-button type="primary" @click="openFileDialog">打开文件</el-button>
                <el-button type="success" @click="saveFileDialog">保存文件</el-button>
                <el-button type="warning" @click="openDirectoryDialog">打开目录</el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <h4>消息框</h4>
              <div class="button-group">
                <el-button type="info" @click="showInfoMessage">信息提示</el-button>
                <el-button type="warning" @click="showWarningMessage">警告提示</el-button>
                <el-button type="danger" @click="showErrorMessage">错误提示</el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <h4>确认框</h4>
              <div class="button-group">
                <el-button type="primary" @click="showConfirmDialog">确认对话框</el-button>
                <el-button type="success" @click="showCustomDialog">自定义对话框</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 系统通知 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Bell /></el-icon>
            <span>系统通知</span>
          </div>
        </template>

        <div class="notification-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h4>通知设置</h4>
              <el-input v-model="notificationTitle" placeholder="通知标题" />
              <el-input v-model="notificationBody" type="textarea" :rows="3" placeholder="通知内容" />
              <div class="button-group">
                <el-button type="primary" @click="showNotification">发送通知</el-button>
                <el-button type="success" @click="showSilentNotification">静默通知</el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h4>通知状态</h4>
              <p><strong>支持通知：</strong>{{ notificationSupported ? '是' : '否' }}</p>
              <div v-if="notificationEvents.length > 0">
                <h5>通知事件：</h5>
                <div v-for="event in notificationEvents" :key="event.id" class="notification-event">
                  <span class="event-time">{{ event.time }}</span>
                  <span class="event-type">{{ event.type }}</span>
                  <span class="event-data">{{ event.data }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 外部应用操作 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Link /></el-icon>
            <span>外部应用操作</span>
          </div>
        </template>

        <div class="external-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h4>外部链接</h4>
              <el-input v-model="externalUrl" placeholder="输入 URL" />
              <div class="button-group">
                <el-button type="primary" @click="openExternalUrl">打开外部链接</el-button>
                <el-button type="success" @click="openPath">打开路径</el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h4>系统操作</h4>
              <div class="button-group">
                <el-button type="warning" @click="playBeep">播放提示音</el-button>
                <el-button type="info" @click="showItemInFolder">在文件夹中显示</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 窗口操作 -->
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><FullScreen /></el-icon>
            <span>窗口操作</span>
          </div>
        </template>

        <div class="window-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <h4>窗口控制</h4>
              <div class="button-group">
                <el-button type="primary" @click="minimizeWindow">最小化</el-button>
                <el-button type="success" @click="maximizeWindow">最大化/还原</el-button>
                <el-button type="warning" @click="centerWindow">居中</el-button>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <h4>窗口大小</h4>
              <div class="button-group">
                <el-button type="primary" @click="setWindowSize(800, 600)">800x600</el-button>
                <el-button type="warning" @click="setWindowSize(1920, 1080)">1920x1080</el-button>
                <el-button type="info" @click="restoreDefaultSize">还原默认尺寸</el-button>
              </div>
              <div v-if="screenSize" class="screen-info">
                <p><strong>屏幕尺寸：</strong>{{ screenSize.width }}x{{ screenSize.height }}</p>
                <p>
                  <strong>默认窗口：</strong>{{ Math.floor(screenSize.width * 0.9) }}x{{
                    Math.floor(screenSize.height * 0.9)
                  }}
                </p>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <h4>窗口标题</h4>
              <el-input v-model="windowTitle" placeholder="窗口标题" />
              <div class="button-group">
                <el-button type="primary" @click="setWindowTitle">设置标题</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 操作日志 -->
      <el-card class="log-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>操作日志</span>
            <el-button size="small" @click="clearLogs">清空日志</el-button>
          </div>
        </template>
        <div class="log-content">
          <div v-for="(log, index) in operationLogs" :key="index" :class="['log-item', log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Monitor, DocumentCopy, FolderOpened, Bell, Link, FullScreen, InfoFilled } from '@element-plus/icons-vue';
import { execCmd } from '@/service/cmd';
import { mysqlQuery } from '@/service/mysql';

// 系统信息
const systemInfo = ref<any>(null);
const memoryUsage = computed(() => {
  if (!systemInfo.value) return 0;
  return (((systemInfo.value.totalmem - systemInfo.value.freemem) / systemInfo.value.totalmem) * 100).toFixed(2);
});
const memoryColor = computed(() => {
  const usage = Number(memoryUsage.value);
  if (usage > 80) return '#f56c6c';
  if (usage > 60) return '#e6a23c';
  return '#67c23a';
});

// 剪贴板
const clipboardText = ref('');
const clipboardHTML = ref('<h1>Hello World</h1>');

// 通知
const notificationTitle = ref('测试通知');
const notificationBody = ref('这是一个测试通知');
const notificationSupported = ref(false);
const notificationEvents = ref<Array<{ id: number; time: string; type: string; data: string }>>([]);

// 外部应用
const externalUrl = ref('https://www.electronjs.org');

// 窗口操作
const windowTitle = ref('Electron 系统功能演示');
const screenSize = ref<{ width: number; height: number } | null>(null);

// 操作日志
const operationLogs = ref<Array<{ time: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

// CMD 命令执行相关
const cmdInput = ref('');
const cmdResult = ref('');

// 数据库操作相关
const dbSql = ref('SELECT * FROM user');
const dbResult = ref<any[]>([]);
const dbColumns = ref<string[]>([]);
const dbResultMsg = ref('');

// 添加日志
const addLog = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const time = new Date().toLocaleTimeString();
  operationLogs.value.unshift({ time, message, type });
  if (operationLogs.value.length > 50) {
    operationLogs.value = operationLogs.value.slice(0, 50);
  }
};

// 清空日志
const clearLogs = () => {
  operationLogs.value = [];
};

// 格式化字节
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化运行时间
const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}天 ${hours}小时 ${minutes}分钟`;
};

// 刷新系统信息
const refreshSystemInfo = async () => {
  try {
    if (typeof window !== 'undefined' && window.systemAPI) {
      const result = await window.systemAPI.getAll();
      if (result.success) {
        systemInfo.value = result.data;
        addLog('系统信息刷新成功', 'success');
      } else {
        addLog(`系统信息刷新失败: ${result.error}`, 'error');
      }
    } else {
      addLog('当前不在 Electron 环境中', 'error');
    }
  } catch (error) {
    addLog(`系统信息刷新异常: ${error}`, 'error');
  }
};

// 剪贴板操作
const writeClipboardText = async () => {
  try {
    if (typeof window !== 'undefined' && window.clipboardAPI) {
      const result = await window.clipboardAPI.writeText(clipboardText.value);
      if (result.success) {
        addLog('文本复制到剪贴板成功', 'success');
        ElMessage.success('文本已复制到剪贴板');
      } else {
        addLog(`文本复制失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`剪贴板操作异常: ${error}`, 'error');
  }
};

const readClipboardText = async () => {
  try {
    if (typeof window !== 'undefined' && window.clipboardAPI) {
      const result = await window.clipboardAPI.readText();
      if (result.success) {
        clipboardText.value = result.data || '';
        addLog('从剪贴板读取文本成功', 'success');
        ElMessage.success('已从剪贴板读取文本');
      } else {
        addLog(`读取剪贴板失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`剪贴板操作异常: ${error}`, 'error');
  }
};

const writeClipboardHTML = async () => {
  try {
    if (typeof window !== 'undefined' && window.clipboardAPI) {
      const result = await window.clipboardAPI.writeHTML(clipboardHTML.value);
      if (result.success) {
        addLog('HTML 复制到剪贴板成功', 'success');
        ElMessage.success('HTML 已复制到剪贴板');
      } else {
        addLog(`HTML 复制失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`剪贴板操作异常: ${error}`, 'error');
  }
};

const readClipboardHTML = async () => {
  try {
    if (typeof window !== 'undefined' && window.clipboardAPI) {
      const result = await window.clipboardAPI.readHTML();
      if (result.success) {
        clipboardHTML.value = result.data || '';
        addLog('从剪贴板读取 HTML 成功', 'success');
        ElMessage.success('已从剪贴板读取 HTML');
      } else {
        addLog(`读取剪贴板失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`剪贴板操作异常: ${error}`, 'error');
  }
};

const clearClipboard = async () => {
  try {
    if (typeof window !== 'undefined' && window.clipboardAPI) {
      const result = await window.clipboardAPI.clear();
      if (result.success) {
        addLog('剪贴板清空成功', 'success');
        ElMessage.success('剪贴板已清空');
      } else {
        addLog(`剪贴板清空失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`剪贴板操作异常: ${error}`, 'error');
  }
};

// 对话框操作
const openFileDialog = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.openFile();
      if (result.success && result.data?.length) {
        addLog(`打开文件成功: ${result.data[0]}`, 'success');
        ElMessage.success(`已选择文件: ${result.data[0]}`);
      } else {
        addLog('文件选择已取消', 'info');
      }
    }
  } catch (error) {
    addLog(`文件对话框异常: ${error}`, 'error');
  }
};

const saveFileDialog = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.saveFile();
      if (result.success && result.data) {
        addLog(`保存文件成功: ${result.data}`, 'success');
        ElMessage.success(`文件将保存到: ${result.data}`);
      } else {
        addLog('文件保存已取消', 'info');
      }
    }
  } catch (error) {
    addLog(`文件对话框异常: ${error}`, 'error');
  }
};

const openDirectoryDialog = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.openDirectory();
      if (result.success && result.data?.length) {
        addLog(`打开目录成功: ${result.data[0]}`, 'success');
        ElMessage.success(`已选择目录: ${result.data[0]}`);
      } else {
        addLog('目录选择已取消', 'info');
      }
    }
  } catch (error) {
    addLog(`目录对话框异常: ${error}`, 'error');
  }
};

const showInfoMessage = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.showMessageBox('info', '信息', '这是一个信息提示');
      if (result.success) {
        addLog('信息对话框显示成功', 'success');
      }
    }
  } catch (error) {
    addLog(`对话框异常: ${error}`, 'error');
  }
};

const showWarningMessage = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.showMessageBox('warning', '警告', '这是一个警告提示');
      if (result.success) {
        addLog('警告对话框显示成功', 'success');
      }
    }
  } catch (error) {
    addLog(`对话框异常: ${error}`, 'error');
  }
};

const showErrorMessage = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.showMessageBox('error', '错误', '这是一个错误提示');
      if (result.success) {
        addLog('错误对话框显示成功', 'success');
      }
    }
  } catch (error) {
    addLog(`对话框异常: ${error}`, 'error');
  }
};

const showConfirmDialog = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.showMessageBox(
        'question',
        '确认',
        '您确定要执行此操作吗？',
        '此操作不可撤销',
        ['确定', '取消']
      );
      if (result.success) {
        const response = result.data?.response === 0 ? '确定' : '取消';
        addLog(`确认对话框结果: ${response}`, 'success');
        ElMessage.success(`用户选择了: ${response}`);
      }
    }
  } catch (error) {
    addLog(`对话框异常: ${error}`, 'error');
  }
};

const showCustomDialog = async () => {
  try {
    if (typeof window !== 'undefined' && window.dialogAPI) {
      const result = await window.dialogAPI.showMessageBox(
        'info',
        '自定义对话框',
        '这是一个自定义的对话框',
        '支持多种按钮和选项',
        ['选项1', '选项2', '选项3', '取消'],
        0,
        3
      );
      if (result.success) {
        const response = result.data?.response;
        const options = ['选项1', '选项2', '选项3', '取消'];
        addLog(`自定义对话框结果: ${options[response]}`, 'success');
        ElMessage.success(`用户选择了: ${options[response]}`);
      }
    }
  } catch (error) {
    addLog(`对话框异常: ${error}`, 'error');
  }
};

// 通知操作
const showNotification = async () => {
  try {
    if (typeof window !== 'undefined' && window.notificationAPI) {
      const result = await window.notificationAPI.show(
        notificationTitle.value,
        notificationBody.value,
        undefined,
        false,
        'default',
        'test-notification'
      );
      if (result.success) {
        addLog('通知发送成功', 'success');
      } else {
        addLog(`通知发送失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`通知操作异常: ${error}`, 'error');
  }
};

const showSilentNotification = async () => {
  try {
    if (typeof window !== 'undefined' && window.notificationAPI) {
      const result = await window.notificationAPI.show(
        '静默通知',
        '这是一个静默通知',
        undefined,
        true,
        'default',
        'silent-notification'
      );
      if (result.success) {
        addLog('静默通知发送成功', 'success');
      } else {
        addLog(`静默通知发送失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`通知操作异常: ${error}`, 'error');
  }
};

// 外部应用操作
const openExternalUrl = async () => {
  try {
    if (typeof window !== 'undefined' && window.externalAPI) {
      const result = await window.externalAPI.openExternal(externalUrl.value);
      if (result.success) {
        addLog(`外部链接打开成功: ${externalUrl.value}`, 'success');
        ElMessage.success('外部链接已打开');
      } else {
        addLog(`外部链接打开失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`外部应用操作异常: ${error}`, 'error');
  }
};

const openPath = async () => {
  try {
    if (typeof window !== 'undefined' && window.externalAPI) {
      const result = await window.externalAPI.openPath('/');
      if (result.success) {
        addLog('路径打开成功', 'success');
        ElMessage.success('路径已打开');
      } else {
        addLog(`路径打开失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`外部应用操作异常: ${error}`, 'error');
  }
};

const playBeep = async () => {
  try {
    if (typeof window !== 'undefined' && window.externalAPI) {
      const result = await window.externalAPI.beep();
      if (result.success) {
        addLog('提示音播放成功', 'success');
        ElMessage.success('提示音已播放');
      } else {
        addLog(`提示音播放失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`外部应用操作异常: ${error}`, 'error');
  }
};

const showItemInFolder = async () => {
  try {
    if (typeof window !== 'undefined' && window.externalAPI) {
      const result = await window.externalAPI.showItemInFolder('/');
      if (result.success) {
        addLog('在文件夹中显示成功', 'success');
        ElMessage.success('已在文件夹中显示');
      } else {
        addLog(`在文件夹中显示失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`外部应用操作异常: ${error}`, 'error');
  }
};

// 窗口操作
const minimizeWindow = async () => {
  try {
    if (typeof window !== 'undefined' && window.windowAPI) {
      const result = await window.windowAPI.minimize();
      if (result.success) {
        addLog('窗口最小化成功', 'success');
      } else {
        addLog(`窗口最小化失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`窗口操作异常: ${error}`, 'error');
  }
};

const maximizeWindow = async () => {
  try {
    if (typeof window !== 'undefined' && window.windowAPI) {
      const result = await window.windowAPI.maximize();
      if (result.success) {
        addLog('窗口最大化/还原成功', 'success');
      } else {
        addLog(`窗口最大化/还原失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`窗口操作异常: ${error}`, 'error');
  }
};

const centerWindow = async () => {
  try {
    if (typeof window !== 'undefined' && window.windowAPI) {
      const result = await window.windowAPI.center();
      if (result.success) {
        addLog('窗口居中成功', 'success');
      } else {
        addLog(`窗口居中失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`窗口操作异常: ${error}`, 'error');
  }
};

const setWindowSize = async (width: number, height: number) => {
  try {
    if (typeof window !== 'undefined' && window.windowAPI) {
      const result = await window.windowAPI.setSize(width, height);
      if (result.success) {
        addLog(`窗口大小设置成功: ${width}x${height}`, 'success');
      } else {
        addLog(`窗口大小设置失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`窗口操作异常: ${error}`, 'error');
  }
};

const restoreDefaultSize = async () => {
  try {
    if (typeof window !== 'undefined' && window.windowAPI) {
      const result = await window.windowAPI.restoreDefaultSize();
      if (result.success) {
        const size = result.data;
        addLog(`窗口还原默认尺寸成功: ${size?.width}x${size?.height}`, 'success');
        ElMessage.success(`窗口已还原到默认尺寸: ${size?.width}x${size?.height}`);
      } else {
        addLog(`窗口还原默认尺寸失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`窗口操作异常: ${error}`, 'error');
  }
};

const setWindowTitle = async () => {
  try {
    if (typeof window !== 'undefined' && window.windowAPI) {
      const result = await window.windowAPI.setTitle(windowTitle.value);
      if (result.success) {
        addLog(`窗口标题设置成功: ${windowTitle.value}`, 'success');
      } else {
        addLog(`窗口标题设置失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`窗口操作异常: ${error}`, 'error');
  }
};

// 获取屏幕尺寸
const getScreenSize = async () => {
  try {
    if (typeof window !== 'undefined' && window.windowAPI) {
      const result = await window.windowAPI.getScreenSize();
      if (result.success) {
        screenSize.value = result.data || null;
        addLog('获取屏幕尺寸成功', 'success');
      } else {
        addLog(`获取屏幕尺寸失败: ${result.error}`, 'error');
      }
    }
  } catch (error) {
    addLog(`获取屏幕尺寸异常: ${error}`, 'error');
  }
};

// CMD 命令执行相关
const runCmd = async () => {
  if (!cmdInput.value.trim()) {
    ElMessage.warning('请输入命令');
    return;
  }
  addLog(`执行命令: ${cmdInput.value}`, 'info');
  try {
    const res = await execCmd(cmdInput.value);
    if (res.success) {
      cmdResult.value = res.stdout || '[无输出]';
      addLog('命令执行成功', 'success');
    } else {
      cmdResult.value = (res.stderr || '') + (res.error ? '\n' + res.error : '');
      addLog('命令执行失败: ' + (res.error || res.stderr), 'error');
    }
  } catch (err) {
    cmdResult.value = String(err);
    addLog('命令执行异常: ' + err, 'error');
  }
};
const clearCmdResult = () => {
  cmdResult.value = '';
};

// 数据库操作相关
const runDbQuery = async () => {
  if (!dbSql.value.trim()) {
    ElMessage.warning('请输入 SQL 语句');
    return;
  }
  addLog(`执行 SQL: ${dbSql.value}`, 'info');
  try {
    const res = await mysqlQuery(dbSql.value);
    if (Array.isArray(res) && res.length) {
      dbResult.value = res;
      dbColumns.value = Object.keys(res[0]);
      dbResultMsg.value = '';
      addLog('SQL 查询成功', 'success');
    } else if (Array.isArray(res)) {
      dbResult.value = [];
      dbColumns.value = [];
      dbResultMsg.value = '无数据返回';
      addLog('SQL 查询无数据', 'info');
    } else {
      dbResult.value = [];
      dbColumns.value = [];
      dbResultMsg.value = JSON.stringify(res);
      addLog('SQL 执行结果: ' + dbResultMsg.value, 'info');
    }
  } catch (err) {
    dbResult.value = [];
    dbColumns.value = [];
    dbResultMsg.value = String(err);
    addLog('SQL 执行异常: ' + err, 'error');
  }
};
const clearDbResult = () => {
  dbResult.value = [];
  dbColumns.value = [];
  dbResultMsg.value = '';
};

// 初始化
onMounted(async () => {
  // 检查通知支持
  try {
    if (typeof window !== 'undefined' && window.notificationAPI) {
      const result = await window.notificationAPI.isSupported();
      if (result.success) {
        notificationSupported.value = result.data || false;
      }
    }
  } catch (error) {
    console.error('检查通知支持失败:', error);
  }

  // 设置通知事件监听
  if (typeof window !== 'undefined' && window.notificationAPI) {
    window.notificationAPI.on('notification-clicked', data => {
      const event = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: '点击',
        data: data || 'default'
      };
      notificationEvents.value.unshift(event);
      addLog(`通知被点击: ${data}`, 'info');
    });

    window.notificationAPI.on('notification-closed', data => {
      const event = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: '关闭',
        data: data || 'default'
      };
      notificationEvents.value.unshift(event);
      addLog(`通知被关闭: ${data}`, 'info');
    });
  }

  // 刷新系统信息
  await refreshSystemInfo();

  // 获取屏幕尺寸
  await getScreenSize();
});
</script>

<style scoped>
.system-features-container {
  padding: 20px;
}

.features-card {
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.feature-card {
  margin-bottom: 20px;
}

.system-info {
  margin-top: 16px;
}

.info-card {
  height: 100%;
  margin-bottom: 16px;
}

.info-card h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.info-card p {
  margin: 8px 0;
  color: #606266;
}

.clipboard-section,
.dialog-section,
.notification-section,
.external-section,
.window-section {
  margin-top: 16px;
}

.clipboard-section h4,
.dialog-section h4,
.notification-section h4,
.external-section h4,
.window-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.button-group {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.notification-event {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-event:last-child {
  border-bottom: none;
}

.event-time {
  color: #909399;
  min-width: 80px;
}

.event-type {
  color: #409eff;
  min-width: 40px;
}

.event-data {
  flex: 1;
  color: #606266;
}

.log-card {
  margin-top: 20px;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
  background-color: #fafafa;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #909399;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-item.success .log-message {
  color: #67c23a;
}

.log-item.error .log-message {
  color: #f56c6c;
}

.log-item.info .log-message {
  color: #606266;
}

.dir-item {
  margin: 4px;
}

.screen-info {
  margin-top: 12px;
  padding: 8px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
}

.screen-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #0369a1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .system-features-container {
    padding: 15px;
  }

  .feature-card {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .system-features-container {
    padding: 10px;
  }

  .features-card {
    margin: 0;
  }

  .feature-card {
    margin-bottom: 12px;
  }

  .button-group {
    flex-direction: column;
    gap: 6px;
  }

  .button-group .el-button {
    width: 100%;
  }

  .log-item {
    flex-direction: column;
    gap: 4px;
  }

  .log-time {
    min-width: auto;
  }

  .notification-event {
    flex-direction: column;
    gap: 4px;
  }

  .event-time {
    min-width: auto;
  }

  .info-card {
    margin-bottom: 12px;
  }

  .screen-info {
    margin-top: 8px;
    padding: 6px;
  }

  .screen-info p {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .system-features-container {
    padding: 8px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .clipboard-section h4,
  .dialog-section h4,
  .notification-section h4,
  .external-section h4,
  .window-section h4 {
    font-size: 14px;
  }

  .info-card h4 {
    font-size: 14px;
  }

  .info-card p {
    font-size: 12px;
  }
}
</style>
