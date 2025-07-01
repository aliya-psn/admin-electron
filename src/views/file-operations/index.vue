<template>
  <div class="file-operations-container">
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>文件操作演示</span>
        </div>
      </template>

      <!-- 浏览器文件操作 -->
      <el-card class="browser-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>浏览器文件操作（受限）</span>
          </div>
        </template>

        <div class="operation-section">
          <h4>文件读取</h4>
          <el-button type="primary" @click="browserReadFile"> 选择并读取文件 </el-button>
          <div v-if="browserFileContent" class="file-content">
            <h5>文件内容：</h5>
            <el-input
              v-model="browserFileContent"
              type="textarea"
              :rows="6"
              readonly
              placeholder="文件内容将显示在这里"
            />
          </div>
        </div>

        <div class="operation-section">
          <h4>文件下载</h4>
          <el-button type="success" @click="browserDownloadFile"> 下载示例文件 </el-button>
        </div>
      </el-card>

      <!-- Electron 文件操作 -->
      <el-card class="electron-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>Electron 文件操作（完整权限）</span>
          </div>
        </template>

        <div class="operation-section">
          <h4>文件读取</h4>
          <el-input
            v-model="electronFilePath"
            placeholder="请输入文件路径（如：/path/to/file.txt）"
            class="path-input"
          />
          <el-button type="primary" @click="electronReadFile" :loading="electronLoading"> 读取文件 </el-button>
          <div v-if="electronFileContent" class="file-content">
            <h5>文件内容：</h5>
            <el-input
              v-model="electronFileContent"
              type="textarea"
              :rows="6"
              readonly
              placeholder="文件内容将显示在这里"
            />
          </div>
        </div>

        <div class="operation-section">
          <h4>文件写入</h4>
          <el-input v-model="electronWritePath" placeholder="请输入写入文件路径" class="path-input" />
          <el-input
            v-model="electronWriteContent"
            type="textarea"
            :rows="4"
            placeholder="请输入要写入的内容"
            class="content-input"
          />
          <el-button type="success" @click="electronWriteFile" :loading="electronLoading"> 写入文件 </el-button>
        </div>

        <div class="operation-section">
          <h4>目录操作</h4>
          <el-input v-model="electronDirPath" placeholder="请输入目录路径" class="path-input" />
          <el-button type="warning" @click="electronReadDir" :loading="electronLoading"> 读取目录 </el-button>
          <el-button type="info" @click="electronCreateDir" :loading="electronLoading"> 创建目录 </el-button>
          <div v-if="electronDirContent.length > 0" class="file-content">
            <h5>目录内容：</h5>
            <el-tag
              v-for="item in electronDirContent"
              :key="item"
              class="dir-item"
              :type="item.includes('.') ? 'success' : 'warning'"
            >
              {{ item }}
            </el-tag>
          </div>
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
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Monitor, InfoFilled } from '@element-plus/icons-vue';

// 浏览器文件操作相关
const browserFileContent = ref('');

// Electron 文件操作相关
const electronFilePath = ref('');
const electronFileContent = ref('');
const electronWritePath = ref('');
const electronWriteContent = ref('');
const electronDirPath = ref('');
const electronDirContent = ref<string[]>([]);
const electronLoading = ref(false);

// 操作日志
const operationLogs = ref<Array<{ time: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

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

// 浏览器文件读取
const browserReadFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.json,.js,.ts,.vue,.html,.css,.md';

  input.onchange = e => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        browserFileContent.value = event.target?.result as string;
        addLog(`浏览器读取文件成功: ${file.name}`, 'success');
        ElMessage.success(`文件读取成功: ${file.name}`);
      };
      reader.onerror = () => {
        addLog(`浏览器读取文件失败: ${file.name}`, 'error');
        ElMessage.error('文件读取失败');
      };
      reader.readAsText(file);
    }
  };

  input.click();
};

// 浏览器文件下载
const browserDownloadFile = () => {
  const content = '这是一个通过浏览器下载的示例文件\n创建时间: ' + new Date().toLocaleString();
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'browser-example.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  addLog('浏览器下载文件成功', 'success');
  ElMessage.success('文件下载成功');
};

// Electron 文件读取
const electronReadFile = async () => {
  if (!electronFilePath.value) {
    ElMessage.warning('请输入文件路径');
    return;
  }

  electronLoading.value = true;
  try {
    // 检查 fileAPI 是否可用（仅在 Electron 环境中）
    if (typeof window !== 'undefined' && window.fileAPI) {
      const result = await window.fileAPI.read(electronFilePath.value);
      if (result.success) {
        electronFileContent.value = result.data || '';
        addLog(`Electron 读取文件成功: ${electronFilePath.value}`, 'success');
        ElMessage.success('文件读取成功');
      } else {
        addLog(`Electron 读取文件失败: ${result.error}`, 'error');
        ElMessage.error(`读取失败: ${result.error}`);
      }
    } else {
      addLog('当前不在 Electron 环境中，无法使用文件 API', 'error');
      ElMessage.error('当前不在 Electron 环境中');
    }
  } catch (error) {
    addLog(`Electron 读取文件异常: ${error}`, 'error');
    ElMessage.error('读取文件时发生异常');
  } finally {
    electronLoading.value = false;
  }
};

// Electron 文件写入
const electronWriteFile = async () => {
  if (!electronWritePath.value || !electronWriteContent.value) {
    ElMessage.warning('请输入文件路径和内容');
    return;
  }

  electronLoading.value = true;
  try {
    if (typeof window !== 'undefined' && window.fileAPI) {
      const result = await window.fileAPI.write(electronWritePath.value, electronWriteContent.value);
      if (result.success) {
        addLog(`Electron 写入文件成功: ${electronWritePath.value}`, 'success');
        ElMessage.success('文件写入成功');
        electronWriteContent.value = '';
      } else {
        addLog(`Electron 写入文件失败: ${result.error}`, 'error');
        ElMessage.error(`写入失败: ${result.error}`);
      }
    } else {
      addLog('当前不在 Electron 环境中，无法使用文件 API', 'error');
      ElMessage.error('当前不在 Electron 环境中');
    }
  } catch (error) {
    addLog(`Electron 写入文件异常: ${error}`, 'error');
    ElMessage.error('写入文件时发生异常');
  } finally {
    electronLoading.value = false;
  }
};

// Electron 读取目录
const electronReadDir = async () => {
  if (!electronDirPath.value) {
    ElMessage.warning('请输入目录路径');
    return;
  }

  electronLoading.value = true;
  try {
    if (typeof window !== 'undefined' && window.fileAPI) {
      const result = await window.fileAPI.readdir(electronDirPath.value);
      if (result.success) {
        electronDirContent.value = result.files || [];
        addLog(`Electron 读取目录成功: ${electronDirPath.value}`, 'success');
        ElMessage.success(`目录读取成功，共 ${result.files?.length || 0} 个项目`);
      } else {
        addLog(`Electron 读取目录失败: ${result.error}`, 'error');
        ElMessage.error(`读取目录失败: ${result.error}`);
      }
    } else {
      addLog('当前不在 Electron 环境中，无法使用文件 API', 'error');
      ElMessage.error('当前不在 Electron 环境中');
    }
  } catch (error) {
    addLog(`Electron 读取目录异常: ${error}`, 'error');
    ElMessage.error('读取目录时发生异常');
  } finally {
    electronLoading.value = false;
  }
};

// Electron 创建目录
const electronCreateDir = async () => {
  if (!electronDirPath.value) {
    ElMessage.warning('请输入目录路径');
    return;
  }

  electronLoading.value = true;
  try {
    if (typeof window !== 'undefined' && window.fileAPI) {
      const result = await window.fileAPI.mkdir(electronDirPath.value);
      if (result.success) {
        addLog(`Electron 创建目录成功: ${electronDirPath.value}`, 'success');
        ElMessage.success('目录创建成功');
      } else {
        addLog(`Electron 创建目录失败: ${result.error}`, 'error');
        ElMessage.error(`创建目录失败: ${result.error}`);
      }
    } else {
      addLog('当前不在 Electron 环境中，无法使用文件 API', 'error');
      ElMessage.error('当前不在 Electron 环境中');
    }
  } catch (error) {
    addLog(`Electron 创建目录异常: ${error}`, 'error');
    ElMessage.error('创建目录时发生异常');
  } finally {
    electronLoading.value = false;
  }
};
</script>

<style scoped>
.file-operations-container {
  padding: 20px;
  min-height: 100vh;
}

.operation-card {
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.browser-card,
.electron-card {
  margin-bottom: 20px;
}

.operation-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.operation-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.path-input,
.content-input {
  margin-bottom: 12px;
}

.file-content {
  margin-top: 16px;
}

.file-content h5 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.dir-item {
  margin: 4px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .file-operations-container {
    padding: 10px;
  }

  .operation-section {
    padding: 12px;
  }

  .log-item {
    flex-direction: column;
    gap: 4px;
  }

  .log-time {
    min-width: auto;
  }
}
</style>
