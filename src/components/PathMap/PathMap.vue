<template>
  <div class="path-map-wrapper">
    <div class="path-map-toolbar">
      <el-button size="small" @click="zoomIn">+</el-button>
      <el-button size="small" @click="zoomOut">-</el-button>
      <el-button size="small" @click="resetView">还原</el-button>
    </div>
    <div ref="container" class="path-map-container" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue';
import { Network, DataSet, Node, Edge } from 'vis-network/standalone';

const props = defineProps<{
  nodes: Node[];
  edges: Edge[];
  height?: string | number;
}>();
const emit = defineEmits(['node-click']);

const container = ref<HTMLElement | null>(null);
let network: Network | null = null;
let nodesDS: DataSet<Node>;
let edgesDS: DataSet<Edge>;

const options = {
  autoResize: true, // 自动适应容器大小
  height: props.height ? (typeof props.height === 'number' ? props.height + 'px' : props.height) : '400px', // 画布高度
  width: '100%', // 画布宽度
  nodes: {
    shape: 'image', // 节点形状为图片
    size: 40, // 节点大小
    font: { size: 14 }, // 节点文字大小
    borderWidth: 2 // 节点边框宽度
  },
  edges: {
    arrows: {
      to: { enabled: false, scaleFactor: 2 } // 不显示箭头，scaleFactor 仅作保留
    },
    color: { color: '#444', highlight: '#409eff' }, // 线条颜色及高亮色
    width: 2, // 线条宽度
    smooth: true, // 线条平滑
    dashes: false // 线条为实线
  },
  physics: {
    enabled: true, // 启用物理引擎
    solver: 'repulsion', // 使用 repulsion（斥力）算法，节点间距更大
    stabilization: false, // 不做稳定动画，直接渲染
    repulsion: {
      nodeDistance: 150, // 节点间最小距离，适中，越大越稀疏
      centralGravity: 0.2, // 吸向中心的重力系数，略大，可改为 0.1
      springLength: 150, // 弹簧长度，适中，影响线的长度
      springConstant: 0.05 // 弹簧系数，略紧凑，越小越松散
    }
  },
  interaction: {
    navigationButtons: false, // 不显示导航按钮
    zoomView: true, // 允许缩放
    dragView: true // 允许拖动画布
  }
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const DEFAULT_SCALE = 1;

const zoomIn = () => {
  if (network) {
    const current = network.getScale() || 1;
    const next = Math.min(current * 1.2, MAX_SCALE);
    network.moveTo({ scale: next });
  }
};
const zoomOut = () => {
  if (network) {
    const current = network.getScale() || 1;
    const next = Math.max(current / 1.2, MIN_SCALE);
    network.moveTo({ scale: next });
  }
};

function resetView() {
  if (network) {
    network.moveTo({
      position: { x: 0, y: 0 },
      scale: DEFAULT_SCALE,
      animation: { duration: 400, easingFunction: 'easeInOutQuad' }
    });
  }
}

const pathMapHeight = computed(() =>
  props.height ? (typeof props.height === 'number' ? props.height + 'px' : props.height) : '400px'
);

onMounted(() => {
  nodesDS = new DataSet(props.nodes);
  edgesDS = new DataSet(props.edges);
  network = new Network(container.value!, { nodes: nodesDS, edges: edgesDS }, options);
  network.on('click', params => {
    if (params.nodes.length) {
      emit('node-click', params.nodes[0]);
      // 居中显示被点击的节点
      network!.focus(params.nodes[0], {
        scale: network!.getScale(),
        animation: { duration: 400, easingFunction: 'easeInOutQuad' }
      });
    }
  });
  // 限制鼠标滚轮缩放范围
  network.on('zoom', _params => {
    if (!network) return;
    const scale = network.getScale();
    if (scale < MIN_SCALE) {
      network.moveTo({ scale: MIN_SCALE });
    } else if (scale > MAX_SCALE) {
      network.moveTo({ scale: MAX_SCALE });
    }
  });
});

watch(
  () => props.nodes,
  val => {
    nodesDS && nodesDS.update(val);
  },
  { deep: true }
);
watch(
  () => props.edges,
  val => {
    edgesDS && edgesDS.update(val);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  network && network.destroy();
});
</script>

<style scoped>
.path-map-wrapper {
  position: relative;
}
.path-map-toolbar {
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 2;
  display: flex;
  gap: 8px;
}
.path-map-container {
  width: 100%;
  height: v-bind(pathMapHeight);
  border: 1px solid #eee;
  background: #fafbfc;
  border-radius: 6px;
}
.path-map-container img {
  pointer-events: none;
}
</style>
