<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { usePermissionStore } from '@/store/modules/permission';
import { useSettingsStore } from '@/store/modules/settings';
import SidebarItem from './SidebarItem.vue';
import Logo from '../Logo/index.vue';
import { useDevice } from '@/hooks/useDevice';
import { useLayoutMode } from '@/hooks/useLayoutMode';
import { getCssVariableValue } from '@/utils';

const v3SidebarMenuBgColor = getCssVariableValue('--v3-sidebar-menu-bg-color');
const v3SidebarMenuTextColor = getCssVariableValue('--v3-sidebar-menu-text-color');
const v3SidebarMenuActiveTextColor = getCssVariableValue('--v3-sidebar-menu-active-text-color');

const { isMobile } = useDevice();
const { isLeft, isTop } = useLayoutMode();
const route = useRoute();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const activeMenu = computed(() => {
  const {
    meta: { activeMenu },
    path
  } = route;
  return activeMenu ? activeMenu : path;
});
const noHiddenRoutes = computed(() => permissionStore.routes.filter(item => !item.meta?.hidden));
const isCollapse = computed(() => !appStore.sidebar.opened);
const isLogo = computed(() => isLeft.value && settingsStore.showLogo);
const backgroundColor = computed(() => (isLeft.value ? v3SidebarMenuBgColor : undefined));
const textColor = computed(() => (isLeft.value ? v3SidebarMenuTextColor : undefined));
const activeTextColor = computed(() => (isLeft.value ? v3SidebarMenuActiveTextColor : undefined));
const sidebarMenuItemHeight = computed(() => {
  return !isTop.value ? 'var(--v3-sidebar-menu-item-height)' : 'var(--v3-navigationbar-height)';
});
const sidebarMenuHoverBgColor = computed(() => {
  return !isTop.value ? 'var(--v3-sidebar-menu-hover-bg-color)' : 'transparent';
});
const tipLineWidth = computed(() => {
  return !isTop.value ? '3px' : '0px';
});
</script>

<template>
  <div :class="{ 'has-logo': isLogo }">
    <Logo v-if="isLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse && !isTop"
        :background-color="backgroundColor"
        :text-color="textColor"
        :active-text-color="activeTextColor"
        :unique-opened="true"
        :collapse-transition="false"
        :mode="isTop && !isMobile ? 'horizontal' : 'vertical'"
      >
        <SidebarItem v-for="route in noHiddenRoutes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
%tip-line {
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: v-bind(tipLineWidth);
    height: 100%;
    background-color: var(--v3-sidebar-menu-tip-line-bg-color);
  }
}

.el-menu {
  border: none;
  min-height: 100%;
  width: 100% !important;
}

.el-menu--horizontal {
  height: v-bind(sidebarMenuItemHeight);
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title),
:deep(.el-sub-menu .el-menu-item),
:deep(.el-menu--horizontal .el-menu-item) {
  height: v-bind(sidebarMenuItemHeight);
  line-height: v-bind(sidebarMenuItemHeight);
  &.is-active,
  &:hover {
    background-color: v-bind(sidebarMenuHoverBgColor);

    /* CSS3 filter滤镜 https://www.zhangxinxu.com/sp/filter.html */
    .svg-icon {
      // #3e3e3f 转为 #3096fc
      filter: invert(47%) sepia(86%) saturate(499%) hue-rotate(173deg) brightness(95%) contrast(107%);
    }
  }
}

:deep(.el-sub-menu) {
  &.is-active {
    > .el-sub-menu__title {
      color: v-bind(activeTextColor) !important;
    }
  }
  &.is-opened {
    .item-icon {
      // #3e3e3f 转为 #3096fc
      filter: invert(47%) sepia(86%) saturate(499%) hue-rotate(173deg) brightness(95%) contrast(107%);
    }
  }
}

:deep(.el-menu-item.is-active) {
  @extend %tip-line;
}

.el-menu--collapse {
  :deep(.el-sub-menu.is-active) {
    .el-sub-menu__title {
      @extend %tip-line;
    }
  }
}
</style>
