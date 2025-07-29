<template>
  <div style="padding: 32px; text-align: center">
    <h3>图片流</h3>

    <!-- 连接控制区域 -->
    <div style="margin-bottom: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px">
      <div style="margin-bottom: 16px">
        <label style="margin-right: 8px">端口:</label>
        <input
          v-model="port"
          type="number"
          style="width: 80px; padding: 4px 8px; margin-right: 16px"
          :disabled="isConnected"
        />
        <button
          @click="connectToStream"
          :disabled="isConnected"
          style="
            padding: 8px 16px;
            background: #4caf50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 8px;
          "
        >
          连接
        </button>
        <button
          @click="disconnectFromStream"
          :disabled="!isConnected"
          style="
            padding: 8px 16px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          断开
        </button>
      </div>

      <!-- 状态显示 -->
      <div style="font-size: 14px; color: #666">
        <span style="margin-right: 16px">
          状态:
          <span :style="{ color: isConnected ? '#4CAF50' : '#f44336' }">
            {{ isConnected ? '已连接' : '未连接' }}
          </span>
        </span>
        <span v-if="connectionStatus" style="margin-right: 16px"> 信息: {{ connectionStatus }} </span>
        <span v-if="frameCount > 0"> 帧数: {{ frameCount }} </span>
      </div>
    </div>

    <!-- 图片显示区域 -->
    <div v-if="imgUrl" style="margin-top: 20px">
      <img
        :src="imgUrl"
        style="max-width: 80vw; max-height: 60vh; border: 1px solid #eee; box-shadow: 0 2px 8px #0001"
      />
    </div>

    <!-- 无图片时的提示 -->
    <div v-else style="margin-top: 20px; padding: 40px; background: #f9f9f9; border-radius: 8px; color: #666">
      <p>请点击连接按钮开始接收图片流</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const imgUrl = ref<string | null>(null);
const isConnected = ref(false);
const connectionStatus = ref('');
const frameCount = ref(0);
const port = ref(9002);
let lastUrl: string | null = null;

// 连接状态监听器
let _statusListener: any = null;
let _errorListener: any = null;
let _closedListener: any = null;

// 手动连接到 net 流
const connectToStream = async () => {
  try {
    connectionStatus.value = '正在连接...';
    frameCount.value = 0;

    // 调用 minicapAPI 的连接方法
    // @ts-ignore
    const result = await window.minicapAPI.connect(port.value);

    if (result.success) {
      isConnected.value = true;
      connectionStatus.value = '连接成功';

      // 设置监听器
      setupListeners();
    } else {
      connectionStatus.value = `连接失败: ${result.error}`;
      console.error('连接失败:', result.error);
    }
  } catch (error) {
    connectionStatus.value = `连接失败: ${error}`;
    console.error('连接失败:', error);
  }
};

// 断开连接
const disconnectFromStream = async () => {
  try {
    // 调用 minicapAPI 的断开连接方法
    // @ts-ignore
    const result = await window.minicapAPI.disconnect();

    if (result.success) {
      isConnected.value = false;
      connectionStatus.value = '已断开连接';

      // 清理监听器
      cleanupListeners();

      // 清理图片
      if (lastUrl) {
        URL.revokeObjectURL(lastUrl);
        lastUrl = null;
      }
      imgUrl.value = null;
    } else {
      connectionStatus.value = `断开失败: ${result.error}`;
      console.error('断开失败:', result.error);
    }
  } catch (error) {
    connectionStatus.value = `断开失败: ${error}`;
    console.error('断开失败:', error);
  }
};

// 设置监听器
const setupListeners = () => {
  // 监听帧数据
  // @ts-ignore
  _statusListener = window.minicapAPI.onFrame((buf: ArrayBuffer) => {
    const blob = new Blob([buf], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    imgUrl.value = url;
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    lastUrl = url;
    frameCount.value++;
  });

  // 监听错误
  // @ts-ignore
  _errorListener = window.minicapAPI.onError((msg: string) => {
    connectionStatus.value = `错误: ${msg}`;
    console.error('minicap 错误:', msg);
  });

  // 监听关闭
  // @ts-ignore
  _closedListener = window.minicapAPI.onClosed((msg: string) => {
    isConnected.value = false;
    connectionStatus.value = `连接关闭: ${msg}`;
    console.log('minicap 连接关闭:', msg);
  });
};

// 清理监听器
const cleanupListeners = () => {
  // 由于 minicapAPI 的监听器是全局的，我们只需要重置引用
  _statusListener = null;
  _errorListener = null;
  _closedListener = null;
};

onMounted(() => {
  // 初始化时设置监听器（但不自动连接）
  setupListeners();
});

onBeforeUnmount(() => {
  // 清理资源
  cleanupListeners();
  if (lastUrl) URL.revokeObjectURL(lastUrl);
});
</script>
