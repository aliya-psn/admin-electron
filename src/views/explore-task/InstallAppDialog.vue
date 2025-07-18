<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="install-progress">
      <div v-if="errorMsg" class="install-error-msg">
        <el-alert type="error" show-icon :closable="false">
          <template #title>
            <div class="error-message-content" v-html="formatErrorMessage(errorMsg)"></div>
          </template>
        </el-alert>
      </div>
      <div class="progress-header">
        <div class="progress-info">
          <span>安装进度：{{ currentStep }} / {{ totalSteps }}</span>
          <el-progress
            :percentage="Math.round((currentStep / totalSteps) * 100)"
            :status="currentStep === totalSteps ? 'success' : undefined"
          />
        </div>
        <div class="current-command" v-if="currentCommand">
          <strong>当前操作：</strong>
          <code>{{ currentCommand }}</code>
        </div>
      </div>
      <div class="progress-logs">
        <h4>安装日志：</h4>
        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" class="log-item" :class="`log-${log.status}`">
            <div class="log-command">
              <el-icon v-if="log.status === 'running'" class="loading-icon">
                <Loading />
              </el-icon>
              <el-icon v-else-if="log.status === 'success'" class="success-icon">
                <SuccessFilled />
              </el-icon>
              <el-icon v-else-if="log.status === 'error'" class="error-icon">
                <CloseBold />
              </el-icon>
              <!-- 成功/失败 -->
              <span>{{ log.message }}</span>
            </div>
            <div v-if="log.output" class="log-output">
              <pre>{{ log.output }}</pre>
            </div>
            <div v-if="log.error" class="log-error">
              <pre>{{ log.error }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('close')" :type="currentStep === totalSteps ? 'primary' : 'default'">
        {{ currentStep === totalSteps ? '完成' : '关闭' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Loading, SuccessFilled, CloseBold } from '@element-plus/icons-vue';
import { defineProps, defineEmits, PropType, defineModel } from 'vue';

interface InstallLog {
  message: string;
  status: 'running' | 'success' | 'error';
  output?: string;
  error?: string;
  key?: string;
}

const visible = defineModel<boolean>('visible');

const props = defineProps({
  title: String,
  currentStep: {
    type: Number,
    default: 0
  },
  totalSteps: {
    type: Number,
    default: 1
  },
  currentCommand: String,
  logs: {
    type: Array as PropType<InstallLog[]>,
    default: () => []
  },
  errorMsg: String
});

defineEmits(['close', 'update:visible']);

// 格式化错误信息，将 \n 转换为 <br> 标签
const formatErrorMessage = (message: string) => {
  if (!message) return '';
  return message.replace(/\n/g, '<br>');
};
</script>

<style scoped lang="scss">
.install-progress {
  .install-error-msg {
    margin-bottom: 16px;
    .error-message-content {
      white-space: pre-line;
      line-height: 1.5;
      font-size: 13px;
    }
  }
  .progress-header {
    margin-bottom: 20px;
    .progress-info {
      margin-bottom: 10px;
      span {
        display: block;
        margin-bottom: 8px;
        color: #606266;
        font-size: 14px;
      }
    }
    .current-command {
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      border-left: 3px solid #409eff;
      code {
        font-family: 'Courier New', monospace;
        color: #409eff;
        font-size: 13px;
      }
    }
  }
  .progress-logs {
    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
    }
    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background-color: #fafafa;
      .log-item {
        padding: 8px 12px;
        border-bottom: 1px solid #f0f0f0;
        &:last-child {
          border-bottom: none;
        }
        .log-command {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          .loading-icon {
            color: #409eff;
            animation: rotate 1s linear infinite;
          }
          .success-icon {
            color: #67c23a;
          }
          .error-icon {
            color: #f56c6c;
          }
        }
        .log-output,
        .log-error {
          margin-top: 8px;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
          }
        }
        .log-output {
          background-color: #f0f9ff;
          border: 1px solid #e1f5fe;
        }
        .log-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        &.log-running {
          .log-command {
            color: #409eff;
          }
        }
        &.log-success {
          .log-command {
            color: #67c23a;
          }
        }
        &.log-error {
          .log-command {
            color: #f56c6c;
          }
        }
      }
    }
  }
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
