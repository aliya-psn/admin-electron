<template>
  <div class="explore-report">
    <el-steps :active="3" finish-status="success" align-center>
      <el-step title="创建任务" />
      <el-step title="执行测试" />
      <el-step title="查看报告" />
    </el-steps>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-loading-spinner />
      <p>正在加载报告数据...</p>
    </div>

    <div class="report-content">
      <!-- 任务信息 -->
      <el-card class="task-card">
        <div class="task-info">
          <div class="task-basic">
            <div class="task-title">
              <el-icon><Document /></el-icon>
              <div>
                <div class="name">{{ taskInfo.name }}</div>
                <div class="type">{{ taskInfo.type }}</div>
              </div>
            </div>
            <div class="task-actions">
              <el-button type="primary" @click="exportReport">
                <el-icon><Download /></el-icon>
                导出报告
              </el-button>
              <el-button @click="showTaskDetail = true">查看详情</el-button>
              <el-button @click="showExecuteLog = true">执行日志</el-button>
              <el-button @click="goBack">返回执行</el-button>
            </div>
          </div>
          <div class="task-details">
            <div class="detail-group">
              <div class="label">应用信息</div>
              <div class="value">{{ taskInfo.appInfo }}</div>
            </div>
            <div class="detail-group">
              <div class="label">开始时间</div>
              <div class="value">{{ taskInfo.startTime }}</div>
            </div>
            <div class="detail-group">
              <div class="label">结束时间</div>
              <div class="value">{{ taskInfo.endTime }}</div>
            </div>
            <div class="detail-group">
              <div class="label">执行方式</div>
              <div class="value">{{ taskInfo.executionMethod }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 数据概览 -->
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <span>数据概览</span>
            <div class="header-actions">
              <el-icon><DataAnalysis /></el-icon>
              <el-button size="small" @click="updateOverviewStats">刷新数据</el-button>
            </div>
          </div>
        </template>
        <div class="overview-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="value">{{ overviewStats.totalDuration }}</div>
              <div class="label">总时长(小时)</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ overviewStats.caseTypeCount }}</div>
              <div class="label">用例类型数</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ overviewStats.actionCount }}</div>
              <div class="label">操作动作数</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ overviewStats.coverageCount }}</div>
              <div class="label">遍历覆盖</div>
            </div>
            <div class="stat-item">
              <div class="value">{{ overviewStats.issueCount }}</div>
              <div class="label">发现故障</div>
            </div>
          </div>
          <div class="model-path">
            <div class="path-info">
              <span class="path-label">模型包路径：</span>
              <span class="path-value" @click="copyPath" title="点击复制路径 (Ctrl+C)">{{ modelPackagePath }}</span>
            </div>
                          <div class="path-actions">
                <el-button size="small" type="info" :disabled="!modelPackagePath" @click="openTestPath">
                  <el-icon class="mr-1"><Open /></el-icon>
                  
                  打开路径</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="copyPath"
                >
                  <el-icon class="mr-1"><CopyDocument /></el-icon>
                  复制路径
                </el-button>
              </div>
          </div>
        </div>
      </el-card>

      <!-- 遍历路径地图 -->
      <el-card class="map-card">
        <template #header>
          <div class="card-header">
            <span>遍历路径地图</span>
            <div class="map-stats">
              <el-tag>节点: {{ nodes.length }}</el-tag>
              <el-tag>边: {{ edges.length }}</el-tag>
              <el-tag type="primary">总计: {{ nodes.length + edges.length }}</el-tag>
            </div>
          </div>
        </template>
        <div class="map-container">
          <div class="map-view">
            <PathMap :nodes="nodes" :edges="edges" :height="500" @node-click="onNodeClick" />
          </div>

          <div class="node-detail" v-if="selectedNode">
            <div class="detail-header">
              <span>节点信息</span>
              <el-button size="small" text @click="selectedNode = null">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="detail-body">
              <div class="detail-row">
                <span class="label">ID</span>
                <span class="value">{{ selectedNode.id }}</span>
              </div>
              <div class="detail-row">
                <span class="label">名称</span>
                <span class="value">{{ selectedNode.label }}</span>
              </div>
              <div class="detail-row">
                <span class="label">路径</span>
                <span class="value">{{ selectedNode.path || 'pages/Index' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">次数</span>
                <span class="value">{{ selectedNode.visitCount || 0 }}</span>
              </div>
            </div>
            <div class="detail-image" v-if="selectedNode.image">
              <img :src="selectedNode.image" alt="节点截图" />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 问题列表 -->
      <el-card class="issues-card">
        <template #header>
          <div class="card-header">
            <span>问题列表</span>
            <el-button size="small" type="primary" @click="refreshIssues">刷新列表</el-button>
          </div>
        </template>
        <el-table :data="issueList" border style="width: 100%" @sort-change="handleSortChange">
          <el-table-column prop="no" label="NO." width="80" sortable />
          <el-table-column prop="type" label="问题类型" width="140" :filters="typeFilters" :filter-method="filterType">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="subType" label="细分类型" min-width="160" sortable />
          <el-table-column prop="module" label="模块" min-width="240" sortable />
          <el-table-column prop="time" label="发现时间" width="160" sortable />
          <el-table-column prop="count" label="发生次数" width="120" sortable />
          <el-table-column label="概要信息" width="100">
            <template #default="{ row }">
              <el-link type="primary" @click="showIssueSummary(row)">查看</el-link>
            </template>
          </el-table-column>
          <el-table-column label="定位日志" width="100">
            <template #default="{ row }">
              <el-link type="primary" @click="openLogFolder(row)">查看</el-link>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" @click="markResolved(row)">标记已解决</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="showTaskDetail" title="任务详情" width="60%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务名称">{{ taskInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="设备信息">{{ taskInfo.deviceInfo }}</el-descriptions-item>
        <el-descriptions-item label="应用包名">{{ taskInfo.appPackage }}</el-descriptions-item>
        <el-descriptions-item label="应用版本">{{ taskInfo.appVersion }}</el-descriptions-item>
        <el-descriptions-item label="测试时长">{{ taskInfo.testDuration }}</el-descriptions-item>
        <el-descriptions-item label="截屏间隔">{{ taskInfo.screenshotInterval }}</el-descriptions-item>
        <el-descriptions-item label="模型选择">{{ taskInfo.modelSelection }}</el-descriptions-item>
        <el-descriptions-item label="归档包名">{{ taskInfo.archivePackage }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showTaskDetail = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 执行日志对话框 -->
    <el-dialog v-model="showExecuteLog" title="执行日志" width="70%">
      <el-input v-model="logContent" type="textarea" :rows="12" readonly placeholder="执行日志内容..." />
      <template #footer>
        <el-button @click="downloadLog">下载日志</el-button>
        <el-button @click="showExecuteLog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 故障概要对话框 -->
    <el-dialog v-model="showIssueSummaryDialog" title="故障概要信息" width="60%">
      <div class="issue-summary" v-if="currentIssue">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="故障类型">{{ currentIssue.type }}</el-descriptions-item>
          <el-descriptions-item label="细分类型">{{ currentIssue.subType }}</el-descriptions-item>
          <el-descriptions-item label="发生时间">{{ currentIssue.time }}</el-descriptions-item>
          <el-descriptions-item label="故障模块">{{ currentIssue.module }}</el-descriptions-item>
          <el-descriptions-item label="错误信息">
            <div class="error-message">{{ getErrorMessage(currentIssue.subType) }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showIssueSummaryDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Download, DataAnalysis, Close, CopyDocument, Open } from '@element-plus/icons-vue';
import PathMap from '@/components/PathMap/PathMap.vue';
import { copyTextToClipboard } from '@/utils';

const router = useRouter();

// 对话框状态
const showTaskDetail = ref(false);
const showExecuteLog = ref(false);
const showIssueSummaryDialog = ref(false);

// 加载状态
const loading = ref(false);

// 任务基本信息
const taskInfo = ref({
  id: 'Task-0731-081941',
  name: 'Task-0731-081941',
  type: '应用探索测试',
  appInfo: 'com.huawei.testmall v1.0.0',
  startTime: '2024-07-31 08:20:07',
  endTime: '2024-07-31 08:50:34',
  executionMethod: 'DevEco Testing',
  deviceInfo: '22M0****133g(HUAWEI Mate X5)',
  appPackage: 'com.huawei.testmall',
  appVersion: '1.0.0',
  testDuration: '0.5小时',
  screenshotInterval: '2秒',
  modelSelection: '无模型',
  archivePackage: 'testmall_1.0.0_Task-graph.zip'
});

// 数据概览统计
const overviewStats = ref({
  totalDuration: 0.5,
  caseTypeCount: 5,
  actionCount: 128,
  coverageCount: 21,
  issueCount: 8
});

// 模型包路径
const modelPackagePath = ref('D:\\apache-maven-3.8.4\\commons-codec\\041_graph.zip');

// 执行日志内容
const logContent = ref(`2024-07-31 08:20:07 Info 开始执行测试任务
2024-07-31 08:20:08 Info 启动应用: com.huawei.testmall
2024-07-31 08:20:10 Info 开始遍历应用界面
2024-07-31 08:20:15 Info 点击控件: [xpath]: /root/Column/Column/Row[0]/Image
2024-07-31 08:20:16 Info 页面跳转: pages/Index -> pages/Detail
2024-07-31 08:25:30 Info 检测到应用异常
2024-07-31 08:25:31 Error JS_ERROR: TypeError: Cannot read property 'data' of undefined
2024-07-31 08:30:45 Info 继续遍历...
2024-07-31 08:50:34 Info 测试任务完成`);

// 路径地图数据
type NodeType = {
  id: number | string;
  label: string;
  image?: string;
  type?: string;
  visitCount?: number;
  path?: string;
};

const nodes = ref<NodeType[]>([
  { id: 1, label: '入口A', image: '/images/file_1.png', type: '入口', path: 'pages/EntryA', visitCount: 15 },
  { id: 2, label: '页面2', image: '/images/file_2.png', type: '页面', path: 'pages/Page2', visitCount: 23 },
  { id: 3, label: '页面3', image: '/images/file_3.png', type: '页面', path: 'pages/Page3', visitCount: 18 },
  { id: 4, label: '出口A', image: '/images/file_4.png', type: '出口', path: 'pages/ExitA', visitCount: 8 },
  { id: 5, label: '入口B', image: '/images/file_5.png', type: '入口', path: 'pages/EntryB', visitCount: 12 },
  { id: 6, label: '页面6', image: '/images/file_6.png', type: '页面', path: 'pages/Page6', visitCount: 31 },
  { id: 7, label: '出口B', image: '/images/file_7.png', type: '出口', path: 'pages/ExitB', visitCount: 9 }
]);

const edges = ref([
  { from: 1, to: 2, label: 'A到2', color: { color: '#409eff' } },
  { from: 2, to: 3, label: '2到3', color: { color: '#409eff' } },
  { from: 3, to: 4, label: '3到出口A', color: { color: '#409eff' } },
  { from: 5, to: 6, label: 'B到6', color: { color: '#67c23a' } },
  { from: 6, to: 3, label: '6到3', color: { color: '#e6a23c' } },
  { from: 6, to: 7, label: '6到出口7', color: { color: '#67c23a' } },
  { from: 7, to: 6, label: '7到出口6', color: { color: '#67c23a' } }
]);

const selectedNode = ref<NodeType | null>(null);

function onNodeClick(nodeId: number | string) {
  const node = nodes.value.find(n => n.id === nodeId);
  if (node) {
    selectedNode.value = node;
  }
}

// 问题列表数据
const issueList = ref([
  {
    no: 1,
    type: '应用崩溃故障',
    subType: 'JS_ERROR',
    module: 'com.huawei.testmall',
    time: '2024-07-31 08:29:25',
    count: 1
  },
  {
    no: 2,
    type: '应用冻屏故障',
    subType: 'APP_FREEZE',
    module: 'com.huawei.testmall',
    time: '2024-07-31 08:33:42',
    count: 2
  },
  {
    no: 3,
    type: '进程崩溃',
    subType: 'CPP_CRASH',
    module: 'com.huawei.testmall',
    time: '2024-07-31 08:45:15',
    count: 1
  },
  {
    no: 4,
    type: '句柄泄漏故障',
    subType: 'HANDLE_LEAK',
    module: 'com.huawei.testmall.ui',
    time: '2024-07-31 08:50:22',
    count: 3
  },
  {
    no: 5,
    type: '线程泄漏故障',
    subType: 'THREAD_LEAK',
    module: 'com.huawei.testmall.network',
    time: '2024-07-31 08:55:18',
    count: 2
  },
  {
    no: 6,
    type: '内存泄漏故障',
    subType: 'MEMORY_LEAK',
    module: 'com.huawei.testmall.cache',
    time: '2024-07-31 09:01:33',
    count: 4
  },
  {
    no: 7,
    type: '应用崩溃故障',
    subType: 'NULL_POINTER',
    module: 'com.huawei.testmall.api',
    time: '2024-07-31 09:05:47',
    count: 1
  },
  {
    no: 8,
    type: '应用冻屏故障',
    subType: 'UI_BLOCK',
    module: 'com.huawei.testmall.main',
    time: '2024-07-31 09:12:15',
    count: 2
  }
]);

const typeFilters = ref([
  { text: '应用崩溃故障', value: '应用崩溃故障' },
  { text: '应用冻屏故障', value: '应用冻屏故障' },
  { text: '进程崩溃', value: '进程崩溃' },
  { text: '句柄泄漏故障', value: '句柄泄漏故障' },
  { text: '线程泄漏故障', value: '线程泄漏故障' },
  { text: '内存泄漏故障', value: '内存泄漏故障' }
]);

const currentIssue = ref<any>(null);

function getTypeTagType(type: string): 'danger' | 'warning' | 'info' | 'success' | 'primary' {
  const typeMap: { [key: string]: 'danger' | 'warning' | 'info' | 'success' | 'primary' } = {
    应用崩溃故障: 'danger',
    应用冻屏故障: 'warning',
    进程崩溃: 'danger',
    句柄泄漏故障: 'info',
    线程泄漏故障: 'info',
    内存泄漏故障: 'warning'
  };
  return typeMap[type] || 'info';
}

function filterType(value: string, row: any) {
  return row.type === value;
}

function handleSortChange(sortInfo: any) {
  console.log('排序变化:', sortInfo);
}

function showIssueSummary(row: any) {
  currentIssue.value = row;
  showIssueSummaryDialog.value = true;
}

function getErrorMessage(subType: string) {
  const messages: { [key: string]: string } = {
    JS_ERROR:
      "TypeError: Cannot read property 'data' of undefined\n    at pages/Index.js:45:12\n    at onClick (pages/Index.js:38:5)",
    APP_FREEZE: '应用主线程被阻塞超过5秒，可能由于主线程执行耗时操作导致',
    CPP_CRASH: 'SIGSEGV(信号11)段错误，访问了无效的内存地址',
    HANDLE_LEAK: '检测到句柄泄漏，当前进程句柄数量: 1024，超出正常范围',
    THREAD_LEAK: '检测到线程泄漏，活跃线程数: 156，部分线程未正确释放',
    MEMORY_LEAK: '检测到内存泄漏，内存使用量持续增长，当前占用: 512MB',
    NULL_POINTER:
      'NullPointerException: null对象引用\n    at com.huawei.testmall.api.ApiManager.getData(ApiManager.java:89)',
    UI_BLOCK: 'UI线程阻塞超过3秒，可能由于网络请求或数据库操作在主线程执行'
  };
  return messages[subType] || '暂无错误详情';
}

function openLogFolder(row: any) {
  ElMessage.info(`打开日志文件夹: faultlog_${row.subType}_${row.time.replace(/[:\s-]/g, '')}`);
}

function markResolved(row: any) {
  ElMessage.success(`问题 ${row.no} 已标记为已解决`);
}

// 模拟数据更新方法
function refreshIssues() {
  // 模拟刷新问题列表
  const newIssues = issueList.value.map(issue => ({
    ...issue,
    count: Math.floor(Math.random() * 10) + 1
  }));
  issueList.value = newIssues;
  ElMessage.success('问题列表已刷新');
}

// 模拟更新统计数据
function updateOverviewStats() {
  overviewStats.value = {
    totalDuration: Math.round((Math.random() * 2 + 0.1) * 10) / 10,
    caseTypeCount: Math.floor(Math.random() * 10) + 1,
    actionCount: Math.floor(Math.random() * 200) + 50,
    coverageCount: Math.floor(Math.random() * 50) + 10,
    issueCount: Math.floor(Math.random() * 15) + 1
  };
}

// 模拟更新任务信息
function updateTaskInfo() {
  const now = new Date();
  const startTime = new Date(now.getTime() - Math.random() * 3600000); // 随机开始时间
  
  taskInfo.value = {
    ...taskInfo.value,
    startTime: startTime.toLocaleString('zh-CN'),
    endTime: now.toLocaleString('zh-CN'),
    testDuration: `${Math.round((now.getTime() - startTime.getTime()) / 3600000 * 10) / 10}小时`
  };
}

// 模拟加载任务数据
function loadTaskData() {
  loading.value = true;
  // 这里可以调用API获取真实数据
  // 目前使用模拟数据
  console.log('加载任务数据...');
  
  // 模拟异步加载
  setTimeout(() => {
    updateTaskInfo();
    updateOverviewStats();
    loading.value = false;
    ElMessage.success('数据加载完成');
  }, 1000);
}

// 组件挂载时加载数据
onMounted(() => {
  loadTaskData();
  
  // 添加键盘快捷键监听
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl+C 复制路径
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      copyPath();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  // 组件卸载时移除监听器
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
});

function exportReport() {
  ElMessage.success('报告导出中...');
}

/** 打开路径 开始 */
// 验证路径格式
function validatePath(path: string): boolean {
  if (!path) return false;
  
  // 检查Windows路径格式
  const windowsPathRegex = /^[A-Za-z]:\\(?:[^<>:"/\\|?*]+\\)*[^<>:"/\\|?*]*$/;
  return windowsPathRegex.test(path);
}

// 获取父目录路径
function getParentDirectory(path: string): string | null {
  if (!path) return null;
  
  const lastSeparatorIndex = path.lastIndexOf('\\');
  if (lastSeparatorIndex === -1) return null;
  
  return path.substring(0, lastSeparatorIndex);
}

// 测试路径是否存在
async function openTestPath() {
  try {
    
    if (!validatePath(modelPackagePath.value)) {
      ElMessage.error('模型包路径格式无效');
      return;
    }
    
    if (typeof window !== 'undefined' && window.fileAPI) {
      const existsResult = await window.fileAPI.exists(modelPackagePath.value);
      if (existsResult.success && existsResult.exists) {
        ElMessage.success('模型包文件存在');
        window.externalAPI.openPath(modelPackagePath.value);
        
      } else {
        ElMessage.error('模型包文件不存在');
        
        // 检查父目录是否存在
        const parentDir = getParentDirectory(modelPackagePath.value);
        if (parentDir) {
          const parentExistsResult = await window.fileAPI.exists(parentDir);
          if (parentExistsResult.success && parentExistsResult.exists) {
            openParentDirectory(parentDir);
          }
        }
      }
    } else {
      ElMessage.info('当前环境不支持文件检查');
    }
  } catch (error) {
    ElMessage.error(`测试路径时发生错误: ${error}`);
  }
}

// 打开父目录的辅助函数
async function openParentDirectory(parentDir: string) {
  try {
    // 验证父目录路径格式
    if (!validatePath(parentDir)) {
      ElMessage.error('父目录路径格式无效');
      return;
    }
    const parentResult = await window.externalAPI.openPath(parentDir);
    if (parentResult.success) {
      ElMessage.info('已打开模型包所在目录');
    } else {
      ElMessage.error(`打开目录失败: ${parentResult.error}`);
    }
  } catch (error) {
    ElMessage.error(`打开父目录时发生错误: ${error}`);
  }
}
/** 打开路径 结束 */

// 复制路径到剪贴板
async function copyPath() {
  try {
    if (!modelPackagePath.value) {
      ElMessage.error('模型包路径不存在');
      return;
    }
    
    if (typeof window !== 'undefined' && window.clipboardAPI) {
      const result = await window.clipboardAPI.writeText(modelPackagePath.value);
      if (result.success) {
        ElMessage.success('路径已复制到剪贴板');
      } else {
        ElMessage.error(`复制失败: ${result.error}`);
      }
    } else {
      // 如果不在 Electron 环境中，使用浏览器 API
      copyTextToClipboard(modelPackagePath.value);
    }
  } catch (error) {
    ElMessage.error(`复制路径时发生错误: ${error}`);
  }
}

function downloadLog() {
  ElMessage.success('日志下载中...');
}

function goBack() {
  router.push('/explore-task/execute');
}
</script>

<style scoped lang="scss">
.explore-report {
  padding: 16px;
  min-height: 100vh;
  position: relative;

  :deep(.el-steps) {
    margin-bottom: 20px;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: 8px;

    p {
      margin-top: 16px;
      color: #606266;
      font-size: 14px;
    }
  }
}

.report-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

// 通用卡片样式
.task-card,
.overview-card,
.map-card,
.issues-card {
  :deep(.el-card__header) {
    padding: 12px 0;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      color: #303133;

      > span {
        margin-left: 6px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .map-stats {
        display: flex;
        gap: 6px;

        :deep(.el-tag) {
          font-size: 12px;
        }
      }
    }
  }

  :deep(.el-card__body) {
    padding: 16px;
  }
}

// 任务信息卡片
.task-card {
  grid-column: span 3;
}

.task-info {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
}

.task-basic {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 10px;

  .el-icon {
    font-size: 24px;
    color: #409eff;
  }

  .name {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 2px;
  }

  .type {
    font-size: 13px;
    color: #606266;
  }
}

.task-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.task-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 3px;

  .label {
    font-size: 12px;
    color: #909399;
    font-weight: 500;
  }

  .value {
    font-size: 14px;
    color: #303133;
    font-weight: 600;
  }
}

// 概览卡片
.overview-card {
  grid-column: span 3;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;

  .stat-item {
    text-align: center;
    padding: 10px 8px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .value {
      font-size: 24px;
      font-weight: 600;
      color: #409eff;
      margin-bottom: 6px;
    }

    .label {
      font-size: 13px;
      color: #606266;
      font-weight: 500;
    }
  }
}

.model-path {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;

  .path-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;

    .path-label {
      font-weight: 600;
      color: #303133;
      white-space: nowrap;
    }

    .path-value {
      color: #409eff;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      word-break: break-all;
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.3s ease;
      
      &:hover {
        color: #66b1ff;
      }
      
      &:active {
        color: #3a8ee6;
      }
    }
  }

  .path-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

// 地图卡片
.map-card {
  grid-column: span 3;
}

.map-container {
  display: flex;
  gap: 16px;

  .map-view {
    flex: 3;
    width: 100%;
    height: 100%;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background: #fafafa;
  }

  .node-detail {
    flex: 1;
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      background: #f8f9fa;
      color: #303133;
      border-bottom: 1px solid #e4e7ed;
    }

    .detail-body {
      padding: 12px;

      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 13px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #606266;
        }

        .value {
          color: #303133;
          font-weight: 600;
          text-align: right;
        }
      }
    }

    .detail-image {
      padding: 0 12px 12px;

      img {
        width: 100%;
        border-radius: 4px;
        border: 1px solid #e4e7ed;
      }
    }
  }
}

// 问题列表卡片
.issues-card {
  grid-column: span 3;
}

// 表格样式
:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;

  .el-table__header th {
    background-color: #f8f9fa;
    color: #303133;
    font-weight: 600;
  }

  .el-tag {
    border-radius: 3px;
    font-weight: 500;
  }

  .el-link {
    font-weight: 500;
  }
}

// 对话框样式
:deep(.el-dialog) {
  border-radius: 6px;

  .el-dialog__header {
    padding: 16px 20px 12px;
    border-bottom: 1px solid #e4e7ed;

    .el-dialog__title {
      font-weight: 600;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 16px 20px;
  }

  .el-dialog__footer {
    padding: 12px 20px 16px;
    border-top: 1px solid #e4e7ed;
  }
}

.error-message {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-line;
  color: #e74c3c;
}

// 响应式设计
@media (max-width: 900px) {
  .explore-report {
    padding: 12px;
  }

  .report-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .task-card,
  .overview-card,
  .map-card,
  .issues-card {
    grid-column: span 1;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .task-info {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .task-actions {
    justify-content: center;

    :deep(.el-button) {
      flex: 1;
      min-width: calc(50% - 4px);
    }
  }

  .task-details {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .stat-item {
      padding: 12px 8px;

      .value {
        font-size: 20px;
      }
    }
  }

  .model-path {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .path-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .map-container {
    min-height: 280px;
    flex-direction: column;

    .map-view {
      height: 200px;
    }

    .node-detail {
      max-height: 200px;
      overflow-y: auto;
    }
  }
}
</style>
