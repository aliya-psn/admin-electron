<template>
  <div class="explore-execute">
    <el-steps :active="2" finish-status="success" align-center>
      <el-step title="创建任务" />
      <el-step title="执行测试" />
      <el-step title="查看报告" />
    </el-steps>
    <div class="progress-bar">
      <div>已执行{{ progress.current }}/总时长{{ progress.total }}分</div>
      <el-progress :percentage="progress.percent" style="width: 300px" />
    </div>
    <div class="main-panels">
      <el-card class="panel path-map">
        <template #header>遍历路径地图</template>
        <PathMap :nodes="nodes" :edges="edges" @node-click="onNodeClick" />
        <div>节点数：{{ nodes.length }} 边数：{{ edges.length }}</div>
      </el-card>
      <el-card class="panel device-img">
        <template #header>设备镜像</template>
        <div class="mock-img">[Mock 设备截图]</div>
      </el-card>
      <el-card class="panel semantic">
        <template #header>
          语义分析
          <el-switch v-model="semanticOn" active-text="开启" inactive-text="暂停" style="margin-left: 8px" />
        </template>
        <div class="mock-img">[Mock 语义分析截图]</div>
        <div class="semantic-list">
          <div v-for="item in semanticList" :key="item.id" :class="{ active: item.active }">
            {{ item.id }}. {{ item.text }}
          </div>
        </div>
      </el-card>
    </div>
    <div class="bottom-bar">
      <div class="stat">
        分类统计：故障总数{{ errorCount }}个
        <el-button size="small" @click="showDetail = true">查看详情</el-button>
      </div>
      <div class="log">
        <el-select v-model="logLevel" size="small" style="width: 100px">
          <el-option label="Info" value="Info" />
          <el-option label="Warn" value="Warn" />
          <el-option label="Error" value="Error" />
        </el-select>
        <div class="log-list">
          <div v-for="log in logs" :key="log.time">{{ log.time }} {{ log.level }} {{ log.msg }}</div>
        </div>
      </div>
      <div class="actions">
        <el-button type="danger" @click="stopTask">停止任务</el-button>
        <el-button type="primary" @click="goReport">查看报告</el-button>
      </div>
    </div>
    <el-dialog v-model="showDetail" title="问题详情" width="60%">
      <el-table :data="errorList" border>
        <el-table-column prop="no" label="NO." width="50" />
        <el-table-column prop="type" label="问题类型" width="120" />
        <el-table-column prop="subType" label="细分类型" width="120" />
        <el-table-column prop="module" label="模块" width="180" />
        <el-table-column prop="time" label="发现时间" width="180" />
        <el-table-column prop="count" label="发生次数" width="100" />
        <el-table-column prop="summary" label="概要信息" width="100">
          <template #default>
            <el-link type="primary">查看</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="log" label="定位日志" width="100">
          <template #default>
            <el-link type="primary">查看</el-link>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showNodeDetail" title="节点详情" width="400px">
      <div v-if="currentNode">
        <div>节点ID：{{ currentNode.id }}</div>
        <div>名称：{{ currentNode.label }}</div>
        <div>类型：{{ currentNode.type || '页面' }}</div>
        <div v-if="currentNode.image"><img :src="currentNode.image" style="max-width: 100%" /></div>
      </div>
      <template #footer>
        <el-button @click="showNodeDetail = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PathMap from '@/components/PathMap/PathMap.vue';

const progress = ref({ current: 25, total: 30, percent: 80 });
const semanticOn = ref(true);
const semanticList = ref([
  { id: 7, text: '内容列表区', active: true },
  { id: 1, text: '内容列表区中的项', active: false },
  { id: 2, text: '内容列表区中的项', active: false },
  { id: 3, text: '内容列表区中的项', active: false },
  { id: 4, text: '内容列表区中的项', active: false }
]);
const errorCount = ref(2);
const showDetail = ref(false);
const errorList = ref([
  {
    no: 1,
    type: '应用崩溃故障',
    subType: 'JS_ERROR',
    module: 'com.huawei.testmall',
    time: '2024-07-31 08:29:25',
    count: 1,
    summary: '',
    log: ''
  },
  {
    no: 2,
    type: '应用冻屏故障',
    subType: 'APP_FREEZE',
    module: 'com.huawei.testmall',
    time: '2024-07-31 08:33:42',
    count: 2,
    summary: '',
    log: ''
  }
]);
const logLevel = ref('Info');
const logs = ref([
  {
    time: '2024-07-30 14:57:54',
    level: 'Info',
    msg: '点击控件, [xpath]: /root/Column/Column/Row[0]/Image, [坐标]: 100,221'
  },
  { time: '2024-07-30 14:57:54', level: 'Info', msg: '滑动控件, [坐标]: 从540,1829 到 540,547' },
  {
    time: '2024-07-30 14:57:54',
    level: 'Info',
    msg: '点击控件, [xpath]: /root/Column/Scroll/Common/Row[0]/Image, [坐标]: 100,221'
  }
]);

// mock 路径地图数据
type NodeType = {
  id: number | string;
  label: string;
  image?: string;
  type?: string;
};
const nodes = ref<NodeType[]>(
  Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    label: `页面${i + 1}`,
    image: `/images/file_${i + 1}.png`,
    type: '页面'
  }))
);
const edges = ref(
  Array.from({ length: 17 }, (_, i) => ({
    from: i + 1,
    to: i + 2,
    label: `跳转${i + 1}`,
    color: { color: '#409eff' }
  }))
);

const showNodeDetail = ref(false);
const currentNode = ref<NodeType | null>(null);
function onNodeClick(nodeId: number | string) {
  const node = nodes.value.find(n => n.id === nodeId);
  if (node) {
    currentNode.value = node;
    showNodeDetail.value = true;
  }
}

function stopTask() {
  // mock 停止
}
function goReport() {
  // mock 跳转报告
}
</script>

<style scoped>
.explore-execute {
  padding: 24px;
}
.progress-bar {
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 24px;
}
.main-panels {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.panel {
  flex: 1;
  min-height: 320px;
}
.mock-img {
  background: #f5f5f5;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  margin-bottom: 8px;
}
.semantic-list {
  margin-top: 8px;
}
.semantic-list .active {
  color: #409eff;
  font-weight: bold;
}
.bottom-bar {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-top: 16px;
}
.stat {
  flex: 1;
}
.log {
  flex: 2;
}
.log-list {
  background: #f8f8f8;
  min-height: 80px;
  max-height: 120px;
  overflow: auto;
  padding: 8px;
  font-size: 13px;
}
.actions {
  flex: 1;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
