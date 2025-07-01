<script lang="ts" setup>
import { useLayoutMode } from '@/hooks/useLayoutMode';
import logo from '@/assets/logo/logo.png?url';
// import logoText from '@/assets/logo/logo-text.png?url'

const appName = import.meta.env.VITE_APP_NAME;

interface Props {
  collapse?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collapse: true
});

const { isTop } = useLayoutMode();
</script>

<template>
  <div class="layout-logo-container" :class="{ collapse: props.collapse, 'layout-mode-top': isTop }">
    <transition name="layout-logo-fade">
      <router-link v-if="props.collapse" key="collapse" to="/">
        <img :src="logo" class="layout-logo" />
      </router-link>
      <router-link v-else key="expand" to="/">
        <img :src="logo" class="layout-logo" />
        <div class="layout-logo-title">{{ appName }}</div>
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.layout-logo-container {
  position: relative;
  width: 100%;
  height: var(--v3-header-height);
  background-color: var(--v3-body-bg-color);

  a {
    display: flex;
    align-items: center;
    margin-left: 15px;
    height: 100%;
  }

  .layout-logo {
    height: 38px;
    width: 38px;
  }

  .layout-logo-title {
    margin-left: 10px;
    font-weight: 500;
    font-size: 18px;
    white-space: nowrap;
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 5px var(--el-color-primary-light-7);
  }
}

.layout-mode-top {
  height: var(--v3-navigationbar-height);
  line-height: var(--v3-navigationbar-height);
}

.collapse {
  .layout-logo {
    width: 32px;
    height: 32px;
  }
}
</style>
