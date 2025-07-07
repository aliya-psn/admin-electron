<template>
  <div class="path-map-wrapper">
    <div class="path-map-toolbar">
      <el-button size="small" @click="zoomIn">+</el-button>
      <el-button size="small" @click="zoomOut">-</el-button>
    </div>
    <div ref="container" class="path-map-container" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Network, DataSet, Node, Edge } from 'vis-network/standalone';

const props = defineProps<{
  nodes: Node[];
  edges: Edge[];
}>();
const emit = defineEmits(['node-click']);

const container = ref<HTMLElement | null>(null);
let network: Network | null = null;
let nodesDS: DataSet<Node>;
let edgesDS: DataSet<Edge>;

const options = {
  autoResize: true,
  height: '400px',
  width: '100%',
  nodes: {
    shape: 'image',
    size: 40,
    font: { size: 14 },
    borderWidth: 2
  },
  edges: {
    arrows: 'to',
    color: { color: '#444', highlight: '#409eff' },
    width: 2,
    smooth: true,
    dashes: false
  },
  physics: {
    enabled: true,
    stabilization: false
  },
  interaction: {
    navigationButtons: false,
    zoomView: true,
    dragView: true
  }
};

const zoomIn = () => {
  if (network) network.moveTo({ scale: (network.getScale() || 1) * 1.2 });
};
const zoomOut = () => {
  if (network) network.moveTo({ scale: (network.getScale() || 1) / 1.2 });
};

onMounted(() => {
  nodesDS = new DataSet(props.nodes);
  edgesDS = new DataSet(props.edges);
  network = new Network(container.value!, { nodes: nodesDS, edges: edgesDS }, options);
  network.on('click', params => {
    if (params.nodes.length) emit('node-click', params.nodes[0]);
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
  height: 400px;
  border: 1px solid #eee;
  background: #fafbfc;
  border-radius: 6px;
}
</style>
