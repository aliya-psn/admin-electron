<script lang="ts" setup>
import { watchEffect, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/store/modules/settings';
import { useLayoutMode } from '@/hooks/useLayoutMode';
import { resetConfigLayout } from '@/utils';
import { getDefaultThemeByEnv, applyTheme, saveThemeToStorage, loadThemeFromStorage, isElectronEnv } from '@/utils/env-theme';
import SelectLayoutMode from './SelectLayoutMode.vue';
import { Refresh } from '@element-plus/icons-vue';

const { isLeft } = useLayoutMode();
const settingsStore = useSettingsStore();

/** 使用 storeToRefs 将提取的属性保持其响应性 */
const {
  showTagsView,
  showLogo,
  fixedHeader,
  showFooter,
  showScreenfull,
  showSearchMenu,
  cacheTagsView,
  showWatermark,
  showGreyMode,
  showColorWeakness
} = storeToRefs(settingsStore);

/** 主题切换功能 */
const currentUITheme = ref('default')

// 根据环境显示不同的主题选项
const getUIThemes = () => {
  const baseThemes = [
    { key: 'default', label: 'Element Plus 默认' },
    { key: 'client', label: '客户端风格' },
    { key: 'dark', label: '暗色主题' }
  ]
  
  // 为当前环境的默认主题添加标识
  const envDefault = isElectronEnv() ? 'client' : 'default'
  
  return baseThemes.map(theme => ({
    ...theme,
    label: theme.key === envDefault ? `${theme.label} (推荐)` : theme.label
  }))
}

const uiThemes = getUIThemes()

const handleUIThemeChange = (themeKey: string) => {
  currentUITheme.value = themeKey
  applyTheme(themeKey)
  saveThemeToStorage(themeKey)
}

// 在组件挂载时同步主题状态
onMounted(() => {
  // 主题系统已经在 main.ts 中初始化，这里只需要同步状态
  const savedTheme = loadThemeFromStorage()
  if (savedTheme) {
    currentUITheme.value = savedTheme
  } else {
    // 如果没有保存的主题，使用环境默认主题
    const defaultTheme = getDefaultThemeByEnv()
    currentUITheme.value = defaultTheme
  }
})

/** 定义 switch 设置项 */
const switchSettings = {
  显示标签栏: showTagsView,
  '显示 Logo': showLogo,
  '固定 Header': fixedHeader,
  '显示页脚 Footer': showFooter,
  显示全屏按钮: showScreenfull,
  显示搜索按钮: showSearchMenu,
  是否缓存标签栏: cacheTagsView,
  开启系统水印: showWatermark,
  显示灰色模式: showGreyMode,
  显示色弱模式: showColorWeakness
};

/** 非左侧模式时，Header 都是 fixed 布局 */
watchEffect(() => {
  !isLeft.value && (fixedHeader.value = true);
});
</script>

<template>
  <div class="setting-container">
    <h4>布局配置</h4>
    <SelectLayoutMode />
    <el-divider />
    <h4>UI主题配置</h4>
    <div class="env-info">
      <el-alert 
        :title="`当前运行环境: ${isElectronEnv() ? 'Electron 客户端' : 'Web 浏览器'}`" 
        :type="isElectronEnv() ? 'success' : 'info'"
        :description="`推荐使用: ${isElectronEnv() ? '客户端风格' : 'Element Plus 默认'}主题以获得最佳体验`"
        show-icon
        :closable="false"
      />
    </div>
    <div class="setting-item">
      <span class="setting-name">界面主题</span>
      <el-select v-model="currentUITheme" @change="handleUIThemeChange" style="width: 140px;">
        <el-option
          v-for="theme in uiThemes"
          :key="theme.key"
          :label="theme.label"
          :value="theme.key"
        />
      </el-select>
    </div>
    <el-divider />
    <h4>功能配置</h4>
    <div class="setting-item" v-for="(settingValue, settingName, index) in switchSettings" :key="index">
      <span class="setting-name">{{ settingName }}</span>
      <el-switch v-model="settingValue.value" :disabled="!isLeft && settingName === '固定 Header'" />
    </div>
    <el-button type="danger" :icon="Refresh" @click="resetConfigLayout">重 置</el-button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.setting-container {
  padding: 20px;
  .setting-item {
    font-size: 14px;
    color: var(--el-text-color-regular);
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .setting-name {
      @extend %ellipsis;
    }
  }
  .el-button {
    margin-top: 40px;
    width: 100%;
  }
  
  .env-info {
    margin-bottom: 16px;
    
    :deep(.el-alert) {
      padding: 12px;
      border-radius: 6px;
      
      .el-alert__title {
        font-size: 13px;
        font-weight: 500;
      }
      
      .el-alert__description {
        font-size: 12px;
        margin-top: 4px;
      }
    }
  }
}
</style>
