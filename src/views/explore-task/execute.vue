<template>
  <div class="explore-execute">
    <el-steps :active="2" finish-status="success" align-center>
      <el-step title="创建任务" />
      <el-step title="执行测试" />
      <el-step title="查看报告" />
    </el-steps>
    <div class="main-content">
      <div class="top-view">
        <div class="stat">
          分类统计：故障总数{{ errorCount }}个
          <el-button size="small" @click="showDetail = true">查看详情</el-button>
        </div>
        <div class="progress-bar">
          <div>已执行{{ progress.current }}/总时长{{ progress.total }}分</div>
          <el-progress :percentage="progress.percent" style="width: 200px" />
        </div>

        <div class="progress-actions">
          <el-button type="danger" @click="stopTask">停止任务</el-button>
          <el-button type="primary" @click="goReport">查看报告</el-button>
        </div>
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
        <div class="log-title">
          <span> 日志级别：</span>
          <el-select v-model="logLevel" size="small" style="width: 160px">
            <el-option label="Info" value="Info" />
            <el-option label="Warn" value="Warn" />
            <el-option label="Error" value="Error" />
          </el-select>
        </div>
        <div class="log-list">
          <div v-for="log in logs" :key="log.time">{{ log.time }} {{ log.level }} {{ log.msg }}</div>
        </div>
      </div>
    </div>
    <el-dialog v-model="showDetail" title="问题详情" width="60%">
      <el-table :data="errorList" border>
        <el-table-column prop="no" label="NO." width="60" />
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
import { useRouter } from 'vue-router';
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
  Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    label: `页面${i + 1}`,
    image: `/images/file_${i + 1}.png`,
    type: '页面'
  }))
);
const edges = ref(
  Array.from({ length: 10 }, (_, i) => ({
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
const router = useRouter();

function goReport() {
  router.push('/explore-task/report');
}
</script>

<style scoped lang="scss">
.explore-execute {
  padding: 20px;

  :deep(.el-steps) {
    margin-bottom: 24px;
  }
}

.main-content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
}

.top-view {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  .stat {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }

  .progress-bar {
    display: flex;
    align-items: center;
    gap: 16px;

    > div:first-child {
      font-weight: 600;
      color: #303133;
      font-size: 14px;
      white-space: nowrap;
    }

    :deep(.el-progress) {
      width: 300px;
    }
  }
}

.main-panels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  .panel {
    min-height: 360px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    :deep(.el-card__header) {
      padding: 16px 20px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e4e7ed;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    :deep(.el-card__body) {
      padding: 20px;
      height: calc(100% - 58px);
      display: flex;
      flex-direction: column;
    }

    &.path-map {
      :deep(.el-card__body) {
        > div:last-child {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #f0f2f5;
          font-size: 14px;
          color: #606266;
        }
      }
    }

    &.semantic {
      .semantic-list {
        margin-top: 12px;
        flex: 1;
        overflow-y: auto;

        > div {
          padding: 8px 12px;
          margin-bottom: 4px;
          border-radius: 4px;
          font-size: 14px;
          color: #606266;
          transition: all 0.2s ease;

          &.active {
            color: #409eff;
            font-weight: 600;
            background-color: #f0f8ff;
            border-left: 3px solid #409eff;
          }

          &:hover {
            background-color: #f5f7fa;
          }
        }
      }
    }
  }
}

.mock-img {
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 6px;
  border: 1px dashed #ddd;
  margin-bottom: 12px;
  font-size: 14px;
}

.bottom-bar {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .log-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 14px;
    color: #303133;
    font-weight: 600;
  }

  .log-list {
    background: #f8f9fa;
    min-height: 100px;
    max-height: 140px;
    overflow-y: auto;
    padding: 12px;
    font-size: 13px;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    line-height: 1.5;

    > div {
      margin-bottom: 8px;
      color: #606266;

      &:last-child {
        margin-bottom: 0;
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
}

// 对话框样式
:deep(.el-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #e4e7ed;

    .el-dialog__title {
      font-weight: 600;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 20px 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px 20px;
    border-top: 1px solid #e4e7ed;
  }
}

// 表格样式
:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;

  .el-table__header th {
    background-color: #f8f9fa;
    color: #303133;
    font-weight: 600;
  }

  .el-link {
    font-weight: 500;
  }
}

// 简单的响应式：只有一个断点
@media (max-width: 900px) {
  .explore-execute {
    padding: 16px;
  }

  .top-view {
    grid-template-columns: 1fr;
    gap: 16px;
    text-align: center;

    .progress-bar {
      :deep(.el-progress) {
        width: 100%;
      }
    }

    .progress-actions {
      justify-self: center;
    }
  }

  .main-panels {
    grid-template-columns: 1fr;
    gap: 16px;

    .panel {
      min-height: 300px;
    }
  }

  .bottom-bar {
    padding: 16px;

    .log-title {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      :deep(.el-select) {
        width: 100%;
      }
    }
  }
}
</style>
