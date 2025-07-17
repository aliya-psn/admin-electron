<template>
  <el-dialog v-model="visible" title="配置测试环境" width="500px" :close-on-click-modal="false">
    <div class="env-guide-content">
      <div class="env-guide-icon">
        <el-icon :size="60" color="#409eff">
          <Tools />
        </el-icon>
      </div>
      <h3>需要安装开发工具</h3>
      <p>为了进行设备管理和应用测试，需要安装相应的开发工具。</p>

      <div class="quick-install">
        <h4>Android设备支持 - ADB工具：</h4>
        <div class="install-steps">
          <div class="step-item">
            <span class="step-number">1</span>
            <span class="step-text">下载Android SDK Platform Tools</span>
          </div>
          <div class="step-item">
            <span class="step-number">2</span>
            <span class="step-text">解压到合适的目录</span>
          </div>
          <div class="step-item">
            <span class="step-number">3</span>
            <span class="step-text">将目录添加到系统PATH环境变量</span>
          </div>
        </div>

        <h4>iOS设备支持 - libimobiledevice工具：</h4>
        <div class="install-steps">
          <div class="step-item">
            <span class="step-number">1</span>
            <span class="step-text">macOS: 使用 brew install libimobiledevice</span>
          </div>
          <div class="step-item">
            <span class="step-number">2</span>
            <span class="step-text">Windows: 安装WSL后使用 sudo apt install libimobiledevice6</span>
          </div>
          <div class="step-item">
            <span class="step-number">3</span>
            <span class="step-text">确保idevice_id命令可用</span>
          </div>
        </div>

        <div class="step-item">
          <span class="step-number">4</span>
          <span class="step-text">重启应用并验证安装</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('close')">稍后配置</el-button>
        <el-button type="primary" @click="$emit('goto-setup')">
          <el-icon class="mr-1">
            <Setting />
          </el-icon>
          前往环境配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineEmits, defineModel } from 'vue';
import { Tools, Setting } from '@element-plus/icons-vue';

const visible = defineModel<boolean>('visible');
defineEmits(['close', 'goto-setup']);
</script>

<style scoped lang="scss">
.env-guide-content {
  text-align: center;
  .env-guide-icon {
    margin-bottom: 16px;
  }
  h3 {
    margin: 0 0 12px 0;
    color: #303133;
  }
  p {
    color: #606266;
    line-height: 1.5;
    margin-bottom: 20px;
  }
}
.quick-install {
  text-align: left;
  h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
  }
}
.install-steps {
  .step-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background-color: #409eff;
      color: white;
      border-radius: 50%;
      font-size: 12px;
      margin-right: 8px;
      flex-shrink: 0;
    }
    .step-text {
      color: #606266;
      font-size: 13px;
    }
  }
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
