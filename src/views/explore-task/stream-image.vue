<template>
  <div style="padding: 32px; text-align: center">
    <h3>图片流</h3>
    <img
      :src="imgUrl || undefined"
      style="max-width: 80vw; max-height: 60vh; border: 1px solid #eee; box-shadow: 0 2px 8px #0001"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const imgUrl = ref<string | null>(null);
let lastUrl: string | null = null;

onMounted(() => {
  // @ts-ignore
  window.minicapAPI.onFrame(buf => {
    const blob = new Blob([buf], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    imgUrl.value = url;
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = url;
  });
  // 监听错误
  // @ts-ignore
  window.minicapAPI.onError(msg => {
    window.alert('minicap 错误: ' + msg);
  });
  // 监听关闭
  // @ts-ignore
  window.minicapAPI.onClosed(msg => {
    window.alert('minicap 连接关闭: ' + msg);
  });
});

onBeforeUnmount(() => {
  if (lastUrl) URL.revokeObjectURL(lastUrl);
});
</script>
