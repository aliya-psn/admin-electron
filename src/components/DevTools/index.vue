<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Monitor } from '@element-plus/icons-vue';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, data: any): void;
        on(channel: string, func: (...args: any[]) => void): void;
        removeListener(channel: string, func: (...args: any[]) => void): void;
      };
    };
  }
}

const isDevToolsOpen = ref(false);
const isDev = computed(() => import.meta.env.DEV);

const toggleDevTools = () => {
  isDevToolsOpen.value = !isDevToolsOpen.value;
  window.electron.ipcRenderer.send('toggle-devtools', isDevToolsOpen.value);
};
</script>

<template>
  <el-tooltip v-if="isDev" content="开发者工具" placement="bottom">
    <div class="dev-tools" @click="toggleDevTools">
      <el-icon :size="20">
        <Monitor />
      </el-icon>
    </div>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.dev-tools {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0 10px;
  height: 100%;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style>
