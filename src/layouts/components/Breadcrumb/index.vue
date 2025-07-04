<script lang="ts" setup>
import { ref } from 'vue';
import { type RouteLocationMatched, useRoute, useRouter } from 'vue-router';
import { useRouteListener } from '@/hooks/useRouteListener';
import { compile } from 'path-to-regexp';
import SelectProject from '../SelectProject/index.vue';

const route = useRoute();
const router = useRouter();
const { listenerRouteChange } = useRouteListener();

/** 定义响应式数据 breadcrumbs，用于存储面包屑导航信息 */
const breadcrumbs = ref<RouteLocationMatched[]>([]);

/** 获取面包屑导航信息 */
const getBreadcrumb = () => {
  breadcrumbs.value = route.matched.filter(item => item.meta?.title && item.meta?.breadcrumb !== false);
};

/** 编译路由路径 */
const pathCompile = (path: string) => {
  const toPath = compile(path);
  return toPath(route.params);
};

/** 处理面包屑导航点击事件 */
const handleLink = (item: RouteLocationMatched) => {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect as string);
    return;
  }
  router.push(pathCompile(path));
};

// 是否显示选择项目：如果router.meta.hidden则不显示
const hiddenSelectProject = ref(router.currentRoute.value.meta.hidden === true);

/** 监听路由变化，更新面包屑导航信息 */
listenerRouteChange(route => {
  getBreadcrumb();

  // 是否显示选择项目：如果router.meta.hidden则不显示
  hiddenSelectProject.value = route.meta.hidden === true;
}, true);
</script>

<template>
  <div class="flex justify-between items-center w-full h-full">
    <el-breadcrumb>
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
        <span v-if="item.redirect === 'noRedirect' || index === breadcrumbs.length - 1" class="no-redirect">
          {{ item.meta.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">
          {{ item.meta.title }}
        </a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <select-project v-if="!hiddenSelectProject" />
  </div>
</template>

<style lang="scss" scoped>
.el-breadcrumb {
  line-height: var(--v3-navigationbar-height);

  .no-redirect {
    color: var(--el-text-color-placeholder);
  }

  a {
    font-weight: normal;
  }
}
</style>
