<template>
  <div class="info-cards">
    <el-card class="info-card">
      <template #header>环境状态</template>
      <div class="env-status-item">
        <span>ADB工具(Android)：</span>
        <el-tag :type="adbStatusType" size="small">{{ adbStatusText }}</el-tag>
      </div>
      <div v-if="adbVersion" class="env-version">ADB版本：{{ adbVersion }}</div>
      <div class="env-status-item">
        <span>libimobiledevice(iOS)：</span>
        <el-tag :type="iosStatusType" size="small">{{ iosStatusText }}</el-tag>
      </div>
      <div v-if="iosVersion" class="env-version">iOS工具版本：{{ iosVersion }}</div>
    </el-card>

    <el-card class="info-card" v-if="selectedDevice">
      <template #header>设备信息</template>
      <div>设备标识：{{ selectedDevice.id }}</div>
      <div>设备名称：{{ selectedDevice.name }}</div>
      <div>设备型号：{{ selectedDevice.model }}</div>
      <div>
        设备平台：
        <el-tag :type="selectedDevice.platform === 'android' ? 'success' : 'primary'" size="small">
          {{ selectedDevice.platform === 'android' ? 'Android' : 'iOS' }}
        </el-tag>
      </div>
      <div>版本：{{ selectedDevice.apiLevel }}</div>
      <div>CPU类型：{{ selectedDevice.cpu }}</div>
    </el-card>

    <el-card class="info-card" v-if="selectedApp">
      <template #header>应用信息</template>
      <div>应用名：{{ selectedApp.name }}</div>
      <div>应用包名：{{ selectedApp.package }}</div>
      <div>应用版本：{{ selectedApp.version }}</div>
    </el-card>

    <el-card class="info-card">
      <template #header>注意事项</template>
      <div>1. 任务执行过程中，请避免PC进入休眠状态。</div>
      <div>2. 确保设备已连接并启用USB调试模式。</div>
      <div>3. 首次连接设备需要在设备上确认调试授权。</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { ElTag } from 'element-plus';

const props = defineProps({
  selectedDevice: Object,
  selectedApp: Object,
  adbStatus: String,
  adbVersion: String,
  iosStatus: String,
  iosVersion: String
});

const adbStatusText = computed(() => {
  switch (props.adbStatus) {
    case 'success':
      return '已安装';
    case 'error':
      return '未安装';
    case 'checking':
      return '检测中...';
    default:
      return '未知';
  }
});
const iosStatusText = computed(() => {
  switch (props.iosStatus) {
    case 'success':
      return '已安装';
    case 'error':
      return '未安装';
    case 'checking':
      return '检测中...';
    default:
      return '未知';
  }
});
const adbStatusType = computed(() =>
  props.adbStatus === 'success' ? 'success' : props.adbStatus === 'checking' ? 'warning' : 'danger'
);
const iosStatusType = computed(() =>
  props.iosStatus === 'success' ? 'success' : props.iosStatus === 'checking' ? 'warning' : 'danger'
);
</script>

<style scoped lang="scss">
.info-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  .info-card {
    :deep(.el-card__header) {
      padding: 12px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e4e7ed;
      font-weight: 600;
      color: #303133;
    }
    :deep(.el-card__body) {
      padding: 16px;
      > div {
        margin-bottom: 8px;
        color: #606266;
        font-size: 14px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    .env-status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .env-version {
      font-size: 13px !important;
      color: #e6a23c !important;
    }
  }
}
</style>
