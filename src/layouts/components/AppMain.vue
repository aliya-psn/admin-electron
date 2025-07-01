<script lang="ts" setup>
import { useTagsViewStore } from '@/store/modules/tags-view';
import { useSettingsStore } from '@/store/modules/settings';
import Footer from './Footer/index.vue';

const tagsViewStore = useTagsViewStore();
const settingsStore = useSettingsStore();
</script>

<template>
  <section class="app-main">
    <div class="app-scrollbar">
      <!-- key 采用 route.path 和 route.fullPath 有着不同的效果，大多数时候 path 更通用 -->
      <router-view v-slot="{ Component, route }">
        <transition name="el-fade-in" mode="out-in">
          <keep-alive :include="tagsViewStore.cachedViews">
            <component :is="Component" :key="route.path" class="app-container-grow" />
          </keep-alive>
        </transition>
      </router-view>
      <!-- 页脚 -->
      <Footer v-if="settingsStore.showFooter" />
    </div>
    <!-- 返回顶部 -->
    <el-backtop />
    <!-- 返回顶部（固定 Header 情况下） -->
    <el-backtop target=".app-scrollbar" />
  </section>
</template>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.app-main {
  width: 100%;
  display: flex;
  background: var(--el-light-bg-color);
}

.app-scrollbar {
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  .app-container-grow {
    flex-grow: 1;
    // background: var(--el-bg-color);
    margin: 12px;
    padding: 8px 16px 0 16px;
    overflow-y: auto;
  }
}
</style>
