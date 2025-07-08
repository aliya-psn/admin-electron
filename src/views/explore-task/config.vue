<template>
  <div class="explore-task-config">
    <div class="main-content">
      <el-card class="main-card">
        <el-steps :active="1" finish-status="success" align-center>
          <el-step title="创建任务" />
          <el-step title="执行测试" />
          <el-step title="查看报告" />
        </el-steps>

        <!-- ADB环境状态警告 -->
        <el-alert
          v-if="adbStatus === 'error'"
          type="warning"
          show-icon
          :closable="false"
          class="adb-warning"
        >
          <template #default>
            <div>检测到ADB环境不可用，无法进行设备管理和应用安装。</div>
            <div class="alert-actions">
              <el-button type="primary" size="small" @click="showEnvironmentGuide">
                <el-icon class="mr-1">
                  <Tools />
                </el-icon>
                配置环境
              </el-button>
              <el-button type="default" size="small" @click="checkAdbEnvironment">
                <el-icon class="mr-1">
                  <Refresh />
                </el-icon>
                重新检测
              </el-button>
            </div>
          </template>
        </el-alert>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="task-form">
          <el-form-item label="任务名称" prop="taskName">
            <el-input v-model="form.taskName" maxlength="80" />
          </el-form-item>
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark" maxlength="80" placeholder="请输入任务备注信息" />
          </el-form-item>
          <el-form-item label="测试设备" prop="device">
            <div class="config-select-wrapper">
              <el-select 
                v-model="form.device" 
                placeholder="请选择测试设备" 
                style="width: 360px"
                :loading="deviceLoading"
                :disabled="adbStatus !== 'success'"
                no-data-text="无可用设备，请检查设备连接"
              >
                <el-option 
                  v-for="item in deviceList" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id"
                >
                  <div class="device-option">
                    <div class="device-name">{{ item.name }}</div>
                    <div class="device-details">{{ item.model }} - API {{ item.apiLevel }}</div>
                  </div>
                </el-option>
              </el-select>
              <el-button 
                type="primary" 
                text 
                @click="refreshDevices" 
                :loading="deviceLoading"
                :disabled="adbStatus !== 'success'"
                title="刷新设备列表"
              >
                <el-icon class="mr-1">
                  <Refresh />
                </el-icon>
                {{ deviceLoading ? '检测中...' : '刷新设备' }}
              </el-button>
            </div>
            <div v-if="adbStatus !== 'success'" class="form-item-tip">
              <el-icon class="tip-icon ml-1">
                <Warning />
              </el-icon>
              需要先配置ADB环境才能检测设备
            </div>
          </el-form-item>
          <el-form-item label="选择应用" prop="app">
            <div class="config-select-wrapper">
              <el-select v-model="form.app" placeholder="请选择应用" style="width: 360px">
                <el-option v-for="item in appList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
              <el-button 
                type="primary" 
                text 
                @click="installApp" 
                :loading="installing"
                :disabled="adbStatus !== 'success'"
              >
                <el-icon class="mr-1" v-if="!installing">
                  <Plus />
                </el-icon>
                {{ installing ? '安装中...' : '安装新的应用' }}
              </el-button>
            </div>
            <div v-if="adbStatus !== 'success'" class="form-item-tip">
              <el-icon class="tip-icon ml-1">
                <Warning />
              </el-icon>
              需要先配置ADB环境才能安装应用
            </div>
          </el-form-item>
          <el-divider>应用探索测试</el-divider>
          <el-form-item label="测试时长" prop="duration" style="max-width: 100%">
            <el-radio-group v-model="form.duration">
              <el-radio v-for="item in durationOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
            <el-input
              v-if="form.duration === 'custom'"
              v-model.number="form.customDuration"
              type="number"
              min="1"
              max="1440"
              style="width: 100px; margin-left: 15px"
              suffix="分钟"
            />
          </el-form-item>
          <el-form-item label="模型选择" prop="model">
            <el-select v-model="form.model" placeholder="请选择模型">
              <el-option v-for="item in modelList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="截屏间隔" prop="interval" style="max-width: 100%">
            <el-radio-group v-model="form.interval">
              <el-radio v-for="item in intervalOptions" :key="item.value" :label="item.value">{{
                item.label
              }}</el-radio>
              <el-radio label="custom">自定义</el-radio>
            </el-radio-group>
            <el-input
              v-if="form.interval === 'custom'"
              v-model.number="form.customInterval"
              type="number"
              min="1"
              max="60"
              style="width: 100px; margin-left: 15px"
              suffix="秒"
            />
          </el-form-item>
          <el-form-item label="归档包名" prop="archiveName">
            <el-input v-model="form.archiveName" maxlength="100" />
          </el-form-item>
          <el-form-item class="submit-form-item">
            <el-button type="primary" class="submit-btn" @click="submitForm">
              <el-icon class="mr-1">
                <Plus />
              </el-icon>
              创建任务
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="side-content">
      <div class="info-cards">
        <!-- 环境状态卡片 -->
        <el-card class="info-card">
          <template #header>环境状态</template>
          <div class="env-status-item">
            <span>ADB工具：</span>
            <el-tag 
              :type="adbStatus === 'success' ? 'success' : adbStatus === 'checking' ? 'warning' : 'danger'"
              size="small"
            >
              {{ adbStatusText }}
            </el-tag>
          </div>
          <div v-if="adbVersion" class="env-version">版本：{{ adbVersion }}</div>
        </el-card>

        <el-card class="info-card" v-if="selectedApp">
          <template #header>应用信息</template>
          <div>应用包名：{{ selectedApp.package }}</div>
          <div>应用版本：{{ selectedApp.version }}</div>
          <div>API版本：{{ selectedApp.apiLevel }}</div>
          <div>分发类型：{{ selectedApp.channel }}</div>
          <div>开发厂商：{{ selectedApp.vendor }}</div>
          <div>虚拟设备号：{{ selectedApp.virtualId }}</div>
          <div>主Ability：{{ selectedApp.ability }}</div>
        </el-card>
        <el-card class="info-card" v-if="selectedDevice">
          <template #header>设备信息</template>
          <div>设备标识：{{ selectedDevice.id }}</div>
          <div>设备名称：{{ selectedDevice.name }}</div>
          <div>设备型号：{{ selectedDevice.model }}</div>
          <div>版本：{{ selectedDevice.apiLevel }}</div>
          <div>CPU类型：{{ selectedDevice.cpu }}</div>
        </el-card>
        <el-card class="info-card">
          <template #header>测试Tips</template>
          <div>1. 任务执行过程中，请避免PC进入休眠状态。</div>
          <div>2. 确保设备已连接并启用USB调试模式。</div>
          <div>3. 首次连接设备需要在设备上确认调试授权。</div>
        </el-card>
      </div>
    </div>

    <!-- 环境配置引导对话框 -->
    <el-dialog 
      v-model="showEnvDialog" 
      title="配置测试环境" 
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="env-guide-content">
        <div class="env-guide-icon">
          <el-icon :size="60" color="#409eff">
            <Tools />
          </el-icon>
        </div>
        <h3>需要安装ADB工具</h3>
        <p>为了进行Android设备管理和应用安装，需要先安装Android Debug Bridge (ADB)工具。</p>
        
        <div class="quick-install">
          <h4>快速安装指南：</h4>
          <div class="install-steps">
            <div class="step-item">
              <span class="step-number">1</span>
              <span class="step-text">下载Android SDK Platform Tools</span>
            </div>
            <div class="step-item">
              <span class="step-number">2</span>
              <span class="step-text">解压到合适的目录</span>
            </div>
            <div class="step-item">
              <span class="step-number">3</span>
              <span class="step-text">将目录添加到系统PATH环境变量</span>
            </div>
            <div class="step-item">
              <span class="step-number">4</span>
              <span class="step-text">重启应用并验证安装</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEnvDialog = false">稍后配置</el-button>
          <el-button type="primary" @click="goToEnvironmentSetup">
            <el-icon class="mr-1">
              <Setting />
            </el-icon>
            前往环境配置
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 应用安装进度对话框 -->
    <el-dialog 
      v-model="installDialog.visible" 
      :title="installDialog.title" 
      width="600px" 
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="install-progress">
        <div class="progress-header">
          <div class="progress-info">
            <span>安装进度：{{ installDialog.currentStep }} / {{ installDialog.totalSteps }}</span>
            <el-progress
              :percentage="Math.round((installDialog.currentStep / installDialog.totalSteps) * 100)"
              :status="installDialog.currentStep === installDialog.totalSteps ? 'success' : undefined"
            />
          </div>
          <div class="current-command" v-if="installDialog.currentCommand">
            <strong>当前操作：</strong>
            <code>{{ installDialog.currentCommand }}</code>
          </div>
        </div>

        <div class="progress-logs">
          <h4>安装日志：</h4>
          <div class="log-container">
            <div v-for="(log, index) in installDialog.logs" :key="index" class="log-item" :class="`log-${log.status}`">
              <div class="log-command">
                <el-icon v-if="log.status === 'running'" class="loading-icon">
                  <Loading />
                </el-icon>
                <el-icon v-else-if="log.status === 'success'" class="success-icon">
                  <SuccessFilled />
                </el-icon>
                <el-icon v-else-if="log.status === 'error'" class="error-icon">
                  <CloseBold />
                </el-icon>
                <span>{{ log.message }}</span>
              </div>
              <div v-if="log.output" class="log-output">
                <pre>{{ log.output }}</pre>
              </div>
              <div v-if="log.error" class="log-error">
                <pre>{{ log.error }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button 
          @click="closeInstallDialog" 
          :type="installDialog.currentStep === installDialog.totalSteps ? 'primary' : 'default'"
        >
          {{ installDialog.currentStep === installDialog.totalSteps ? '完成' : '最小化' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Loading, SuccessFilled, CloseBold, Refresh, Tools, Warning, Setting } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
const router = useRouter();

interface AppInfo {
  id: string;
  name: string;
  package: string;
  version: string;
  apiLevel: string;
  channel: string;
  vendor: string;
  virtualId: string;
  ability: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  apiLevel: string;
  cpu: string;
  status?: 'device' | 'offline' | 'unauthorized';
}

// 应用安装默认值配置
const APP_INSTALL_DEFAULTS = {
  version: '1.0.0',
  apiLevel: '30',
  channel: 'Custom',
  vendor: 'Unknown',
  virtualId: 'custom',
  ability: 'MainActivity',
  packagePrefix: 'com.example.',
  appName: 'Unknown App',
  fallbackPackage: 'com.unknown.app'
} as const;

// 环境相关状态
const adbStatus = ref<'success' | 'error' | 'checking' | 'unknown'>('unknown');
const adbVersion = ref<string>('');
const showEnvDialog = ref(false);

// 设备相关状态
const deviceList = ref<DeviceInfo[]>([]);
const deviceLoading = ref(false);

const appList = ref<AppInfo[]>([
  {
    id: 'app1',
    name: 'com.huawei.testmall',
    package: 'com.huawei.testmall',
    version: '1.0.0',
    apiLevel: '40000010',
    channel: 'Canary1',
    vendor: 'example',
    virtualId: 'ark9.0.0.0',
    ability: 'EntryAbility'
  }
]);

const modelList = [{ id: '', name: '无模型' }];

const durationOptions = [
  { value: '30', label: '0.5小时' },
  { value: '60', label: '1小时' },
  { value: '120', label: '2小时' },
  { value: '360', label: '6小时' },
  { value: '1440', label: '24小时' }
];
const intervalOptions = [
  { value: '2', label: '2秒' },
  { value: '4', label: '4秒' },
  { value: '6', label: '6秒' },
  { value: '8', label: '8秒' }
];

const formRef = ref();
const form = ref({
  taskName: generateTaskName(),
  remark: '',
  device: '',
  app: '',
  duration: '30',
  customDuration: 30,
  model: '',
  interval: '2',
  customInterval: 2,
  archiveName: ''
});

const rules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  device: [{ required: true, message: '请选择测试设备', trigger: 'change' }],
  app: [{ required: true, message: '请选择应用', trigger: 'change' }],
  duration: [{ required: true, message: '请选择测试时长', trigger: 'change' }],
  interval: [{ required: true, message: '请选择截屏间隔', trigger: 'change' }],
  archiveName: [{ required: true, message: '请输入归档包名', trigger: 'blur' }]
};

// 安装相关状态
const installing = ref(false);
const installDialog = ref({
  visible: false,
  title: '',
  currentStep: 0,
  totalSteps: 0,
  currentCommand: '',
  logs: [] as Array<{
    message: string;
    status: 'running' | 'success' | 'error';
    output?: string;
    error?: string;
  }>
});

// 计算属性
const adbStatusText = computed(() => {
  switch (adbStatus.value) {
    case 'success': return '已安装';
    case 'error': return '未安装';
    case 'checking': return '检测中...';
    default: return '未知';
  }
});

function generateTaskName() {
  const now = new Date();
  return `Task-${now.getMonth() + 1}${now.getDate()}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
}

function generateArchiveName() {
  const app = appList.value.find(a => a.id === form.value.app);
  return app ? `${app.package}_${app.version}_Task-${generateTaskName()}_graph.zip` : '';
}

watch(
  () => form.value.app,
  _val => {
    form.value.archiveName = generateArchiveName();
  }
);

const selectedApp = computed(() => appList.value.find(a => a.id === form.value.app));
const selectedDevice = computed(() => deviceList.value.find(d => d.id === form.value.device));

// 检查ADB环境
async function checkAdbEnvironment(): Promise<boolean> {
  if (!window.cmdAPI) {
    adbStatus.value = 'error';
    return false;
  }
  
  adbStatus.value = 'checking';
  
  try {
    const result = await window.cmdAPI.exec('adb version');
    
    if (result.success && result.stdout) {
      adbStatus.value = 'success';
      // 提取版本信息
      const versionMatch = result.stdout.match(/Android Debug Bridge version (\d+\.\d+\.\d+)/);
      if (versionMatch) {
        adbVersion.value = versionMatch[1];
      }
      return true;
    } else {
      adbStatus.value = 'error';
      adbVersion.value = '';
      return false;
    }
  } catch (error) {
    console.error('ADB环境检测失败:', error);
    adbStatus.value = 'error';
    adbVersion.value = '';
    return false;
  }
}

// 显示环境配置引导
function showEnvironmentGuide() {
  showEnvDialog.value = true;
}

// 前往环境配置页面
function goToEnvironmentSetup() {
  showEnvDialog.value = false;
  router.push('/environment-setup/index');
}

// 解析ADB设备信息
function parseDeviceInfo(deviceLine: string): DeviceInfo | null {
  try {
    // 解析 "adb devices -l" 的输出行
    // 格式: device_id	device	product:xxx model:xxx device:xxx transport_id:xxx
    const parts = deviceLine.trim().split('\t');
    if (parts.length < 2) return null;
    
    const deviceId = parts[0];
    const status = parts[1] as 'device' | 'offline' | 'unauthorized';
    
    if (status !== 'device') {
      // 设备未就绪，但仍然显示
      return {
        id: deviceId,
        name: `${deviceId} (${status})`,
        model: 'Unknown',
        apiLevel: 'Unknown',
        cpu: 'Unknown',
        status
      };
    }
    
    // 解析详细信息
    const details = parts.slice(2).join(' ');
    const modelMatch = details.match(/model:([^\s]+)/);
    const productMatch = details.match(/product:([^\s]+)/);
    
    const model = modelMatch ? modelMatch[1] : 'Unknown';
    const product = productMatch ? productMatch[1] : '';
    
    return {
      id: deviceId,
      name: `${deviceId}${product ? `(${product})` : ''}`,
      model: model,
      apiLevel: 'Unknown', // 需要额外查询
      cpu: 'Unknown', // 需要额外查询
      status: 'device'
    };
  } catch (error) {
    console.error('解析设备信息失败:', error);
    return null;
  }
}

// 获取设备详细信息
async function getDeviceDetails(deviceId: string): Promise<Partial<DeviceInfo>> {
  const details: Partial<DeviceInfo> = {};
  
  try {
    // 获取API级别
    const apiResult = await window.cmdAPI.exec(`adb -s ${deviceId} shell getprop ro.build.version.sdk`);
    if (apiResult.success && apiResult.stdout) {
      details.apiLevel = apiResult.stdout.trim();
    }
    
    // 获取CPU架构
    const cpuResult = await window.cmdAPI.exec(`adb -s ${deviceId} shell getprop ro.product.cpu.abi`);
    if (cpuResult.success && cpuResult.stdout) {
      details.cpu = cpuResult.stdout.trim();
    }
    
    // 获取更详细的型号信息
    const modelResult = await window.cmdAPI.exec(`adb -s ${deviceId} shell getprop ro.product.model`);
    if (modelResult.success && modelResult.stdout) {
      const fullModel = modelResult.stdout.trim();
      if (fullModel && fullModel !== 'Unknown') {
        details.model = fullModel;
        details.name = `${deviceId}(${fullModel})`;
      }
    }
    
  } catch (error) {
    console.error(`获取设备 ${deviceId} 详细信息失败:`, error);
  }
  
  return details;
}

// 刷新设备列表
async function refreshDevices() {
  // 先检查ADB环境
  if (adbStatus.value !== 'success') {
    const isAdbAvailable = await checkAdbEnvironment();
    if (!isAdbAvailable) {
      ElMessage.error('ADB环境不可用，请先配置ADB环境');
      showEnvironmentGuide();
      return;
    }
  }
  
  deviceLoading.value = true;
  
  try {
    // 执行 adb devices -l 获取设备列表
    const result = await window.cmdAPI.exec('adb devices -l');
    
    if (!result.success) {
      throw new Error(result.error || 'ADB命令执行失败');
    }
    
    const output = result.stdout || '';
    const lines = output.split('\n').filter((line: string) => 
      line.trim() && !line.includes('List of devices')
    );
    
    if (lines.length === 0) {
      deviceList.value = [];
      ElMessage.warning('未检测到连接的设备，请确保设备已连接并启用USB调试');
      return;
    }
    
    // 解析设备列表
    const devices: DeviceInfo[] = [];
    
    for (const line of lines) {
      const deviceInfo = parseDeviceInfo(line);
      if (deviceInfo) {
        // 如果设备状态正常，获取详细信息
        if (deviceInfo.status === 'device') {
          const details = await getDeviceDetails(deviceInfo.id);
          Object.assign(deviceInfo, details);
        }
        devices.push(deviceInfo);
      }
    }
    
    deviceList.value = devices;
    
    // 如果当前选择的设备不在新列表中，清空选择
    if (form.value.device && !devices.find(d => d.id === form.value.device)) {
      form.value.device = '';
    }
    
    ElMessage.success(`检测到 ${devices.length} 个设备`);
    
  } catch (error) {
    console.error('刷新设备列表失败:', error);
    ElMessage.error(`设备检测失败: ${error}`);
    deviceList.value = [];
  } finally {
    deviceLoading.value = false;
  }
}

// 添加日志条目
function addLog(message: string, status: 'running' | 'success' | 'error', output?: string, error?: string) {
  installDialog.value.logs.push({
    message,
    status,
    output,
    error
  });
}

// 检查设备连接状态
async function checkDeviceConnection(deviceId: string): Promise<boolean> {
  try {
    const result = await window.cmdAPI.exec('adb devices');
    if (result.success && result.stdout) {
      // 检查设备是否在连接的设备列表中
      const devices = result.stdout.split('\n').filter((line: string) => 
        line.trim() && !line.includes('List of devices') && line.includes('device')
      );
      return devices.some((line: string) => line.includes(deviceId));
    }
    return false;
  } catch (error) {
    console.error('检查设备连接失败:', error);
    return false;
  }
}

// 解析APK信息
async function parseApkInfo(apkPath: string): Promise<Partial<AppInfo> | null> {
  try {
    // 使用aapt或者其他工具解析APK信息
    const result = await window.cmdAPI.exec(`aapt dump badging "${apkPath}"`);
    if (result.success && result.stdout) {
      const packageMatch = result.stdout.match(/package: name='([^']+)'/);
      const versionMatch = result.stdout.match(/versionName='([^']+)'/);
      const apiLevelMatch = result.stdout.match(/targetSdkVersion:'([^']+)'/);
      
      if (packageMatch) {
        return {
          package: packageMatch[1],
          version: versionMatch ? versionMatch[1] : APP_INSTALL_DEFAULTS.version,
          apiLevel: apiLevelMatch ? apiLevelMatch[1] : APP_INSTALL_DEFAULTS.apiLevel,
          channel: APP_INSTALL_DEFAULTS.channel,
          vendor: APP_INSTALL_DEFAULTS.vendor,
          virtualId: APP_INSTALL_DEFAULTS.virtualId,
          ability: APP_INSTALL_DEFAULTS.ability
        };
      }
    }
    
    // 如果aapt不可用，从文件名提取基本信息
    const fileName = apkPath.split(/[/\\]/).pop() || 'unknown.apk';
    const baseName = fileName.replace('.apk', '');
    
    return {
      package: `${APP_INSTALL_DEFAULTS.packagePrefix}${baseName.toLowerCase()}`,
      version: APP_INSTALL_DEFAULTS.version,
      apiLevel: APP_INSTALL_DEFAULTS.apiLevel,
      channel: APP_INSTALL_DEFAULTS.channel,
      vendor: APP_INSTALL_DEFAULTS.vendor,
      virtualId: APP_INSTALL_DEFAULTS.virtualId,
      ability: APP_INSTALL_DEFAULTS.ability
    };
  } catch (error) {
    console.error('解析APK信息失败:', error);
    return null;
  }
}

// 安装应用主函数
async function installApp() {
  try {
    // 0. 检查ADB环境
    if (adbStatus.value !== 'success') {
      const isAdbAvailable = await checkAdbEnvironment();
      if (!isAdbAvailable) {
        ElMessage.error('ADB环境不可用，请先配置ADB环境');
        showEnvironmentGuide();
        return;
      }
    }

    // 1. 检查是否选择了设备
    if (!form.value.device) {
      ElMessage.warning('请先选择测试设备');
      return;
    }

    // 2. 打开文件选择对话框
    if (!window.dialogAPI) {
      ElMessage.error('当前环境不支持文件选择功能');
      return;
    }

    const fileResult = await window.dialogAPI.openFile([
      { name: 'Android 应用包', extensions: ['apk'] },
      { name: '所有文件', extensions: ['*'] }
    ]);

    if (!fileResult.success || !fileResult.data?.length) {
      ElMessage.info('未选择文件');
      return;
    }

    const apkPath = fileResult.data[0];
    
    // 3. 开始安装流程
    installing.value = true;
    
    // 初始化安装对话框
    installDialog.value = {
      visible: true,
      title: '安装应用',
      currentStep: 0,
      totalSteps: 4,
      currentCommand: '',
      logs: []
    };

    // 步骤1: 检查设备连接
    installDialog.value.currentStep = 1;
    installDialog.value.currentCommand = '检查设备连接状态...';
    addLog('检查设备连接状态', 'running');
    
    const isConnected = await checkDeviceConnection(form.value.device);
    if (!isConnected) {
      addLog('设备连接检查失败', 'error', '', '请确保设备已连接并启用USB调试');
      ElMessage.error('设备未连接或ADB不可用');
      return;
    }
    addLog('设备连接正常', 'success');

    // 步骤2: 解析APK信息
    installDialog.value.currentStep = 2;
    installDialog.value.currentCommand = '解析APK信息...';
    addLog('解析APK信息', 'running');
    
    const apkInfo = await parseApkInfo(apkPath);
    if (!apkInfo) {
      addLog('APK信息解析失败', 'error');
      ElMessage.error('APK文件信息解析失败');
      return;
    }
    addLog(`解析成功: ${apkInfo.package}`, 'success');

    // 步骤3: 安装APK
    installDialog.value.currentStep = 3;
    installDialog.value.currentCommand = `安装APK: ${apkPath}`;
    addLog('开始安装APK到设备', 'running');
    
    const installCommand = `adb -s ${form.value.device} install -r "${apkPath}"`;
    const installResult = await window.cmdAPI.exec(installCommand);
    
    if (!installResult.success || (installResult.stderr && installResult.stderr.includes('FAILED'))) {
      const errorMsg = installResult.stderr || installResult.error || '安装失败';
      addLog('APK安装失败', 'error', '', errorMsg);
      ElMessage.error('应用安装失败');
      return;
    }
    addLog('APK安装成功', 'success', installResult.stdout);

    // 步骤4: 更新应用列表
    installDialog.value.currentStep = 4;
    installDialog.value.currentCommand = '更新应用列表...';
    addLog('更新应用列表', 'running');
    
    // 生成新的应用ID
    const newAppId = `app_${Date.now()}`;
    const newApp: AppInfo = {
      id: newAppId,
      name: apkInfo.package || APP_INSTALL_DEFAULTS.appName,
      package: apkInfo.package || APP_INSTALL_DEFAULTS.fallbackPackage,
      version: apkInfo.version || APP_INSTALL_DEFAULTS.version,
      apiLevel: apkInfo.apiLevel || APP_INSTALL_DEFAULTS.apiLevel,
      channel: apkInfo.channel || APP_INSTALL_DEFAULTS.channel,
      vendor: apkInfo.vendor || APP_INSTALL_DEFAULTS.vendor,
      virtualId: apkInfo.virtualId || APP_INSTALL_DEFAULTS.virtualId,
      ability: apkInfo.ability || APP_INSTALL_DEFAULTS.ability
    };

    // 检查是否已存在相同包名的应用
    const existingIndex = appList.value.findIndex(app => app.package === newApp.package);
    if (existingIndex !== -1) {
      // 更新现有应用
      appList.value[existingIndex] = newApp;
      addLog('应用信息已更新', 'success');
    } else {
      // 添加新应用
      appList.value.push(newApp);
      addLog('新应用已添加到列表', 'success');
    }

    // 自动选择新安装的应用
    form.value.app = newAppId;
    
    ElMessage.success('应用安装完成！');
    addLog('应用安装流程完成', 'success');

  } catch (error) {
    console.error('安装应用时发生错误:', error);
    addLog('安装过程异常', 'error', '', String(error));
    ElMessage.error('安装过程中发生错误');
  } finally {
    installing.value = false;
    installDialog.value.currentStep = installDialog.value.totalSteps;
  }
}

// 关闭安装对话框
function closeInstallDialog() {
  installDialog.value.visible = false;
  
  // 如果安装已完成，清理状态
  if (installDialog.value.currentStep === installDialog.value.totalSteps) {
    setTimeout(() => {
      installDialog.value = {
        visible: false,
        title: '',
        currentStep: 0,
        totalSteps: 0,
        currentCommand: '',
        logs: []
      };
    }, 300);
  }
}


function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('任务创建成功');
      router.push('/explore-task/execute');
    }
  });
}

// 页面加载时检查环境和设备
onMounted(async () => {
  // 先检查ADB环境
  const isAdbAvailable = await checkAdbEnvironment();
  
  // 如果ADB可用，则尝试获取设备列表
  if (isAdbAvailable) {
    refreshDevices();
  }
});
</script>

<style scoped lang="scss">
.explore-task-config {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  min-height: 100vh;
  padding: 20px;
}

.main-content {
  min-width: 0; // 防止 grid 项溢出
}

.main-card {
  height: fit-content;
}

// ADB警告样式
.adb-warning {
  margin: 16px 0 24px 0;
  
  .alert-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
}

// 表单项提示样式
.form-item-tip {
  display: flex;
  align-items: center;
  margin-top: 4px;
  color: #e6a23c;
  font-size: 12px;
  
  .tip-icon {
    margin-right: 4px;
  }
}

.side-content {
  .info-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.info-card {
  :deep(.el-card__header) {
    padding: 12px 16px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 600;
    color: #303133;
  }

  :deep(.el-card__body) {
    padding: 16px;

    > div {
      margin-bottom: 8px;
      color: #606266;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 环境状态样式
.env-status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.env-version {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.env-action {
  margin-top: 8px;
}

// 环境引导对话框样式
.env-guide-content {
  text-align: center;
  
  .env-guide-icon {
    margin-bottom: 16px;
  }
  
  h3 {
    margin: 0 0 12px 0;
    color: #303133;
  }
  
  p {
    color: #606266;
    line-height: 1.5;
    margin-bottom: 20px;
  }
}

.quick-install {
  text-align: left;
  
  h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
  }
}

.install-steps {
  .step-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background-color: #409eff;
      color: white;
      border-radius: 50%;
      font-size: 12px;
      margin-right: 8px;
      flex-shrink: 0;
    }
    
    .step-text {
      color: #606266;
      font-size: 13px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.task-form {
  margin-top: 24px;

  :deep(.el-form-item) {
    max-width: 100%;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #303133;
  }

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
  }

  :deep(.el-radio) {
    margin-right: 0;
  }

  :deep(.el-radio__label) {
    font-size: 14px;
    padding-left: 8px;
  }

  :deep(.el-divider) {
    margin: 30px 0;
    border-color: #e4e7ed;
  }

  :deep(.el-divider__text) {
    background-color: #f8f9fa;
    color: #409eff;
    font-weight: 600;
    padding: 0 16px;
  }
}

.config-select-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;

  :deep(.el-select) {
    flex: 1;
  }

  :deep(.el-button) {
    white-space: nowrap;
  }
}

// 设备选项样式
.device-option {
  .device-name {
    font-weight: 500;
    color: #303133;
  }
  
  .device-details {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
}

.submit-form-item {
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
  text-align: center;
  margin-top: 16px;

  .submit-btn {
    height: 36px;
    font-weight: 600;
    border-radius: 8px;
    background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
    }

    :deep(.el-icon) {
      margin-right: 6px;
    }
  }
}

// 安装进度对话框样式
.install-progress {
  .progress-header {
    margin-bottom: 20px;
    
    .progress-info {
      margin-bottom: 10px;
      
      span {
        display: block;
        margin-bottom: 8px;
        color: #606266;
        font-size: 14px;
      }
    }
    
    .current-command {
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      border-left: 3px solid #409eff;
      
      code {
        font-family: 'Courier New', monospace;
        color: #409eff;
        font-size: 13px;
      }
    }
  }
  
  .progress-logs {
    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 16px;
    }
    
    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background-color: #fafafa;
      
      .log-item {
        padding: 8px 12px;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .log-command {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          
          .loading-icon {
            color: #409eff;
            animation: rotate 1s linear infinite;
          }
          
          .success-icon {
            color: #67c23a;
          }
          
          .error-icon {
            color: #f56c6c;
          }
        }
        
        .log-output, .log-error {
          margin-top: 8px;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          
          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
          }
        }
        
        .log-output {
          background-color: #f0f9ff;
          border: 1px solid #e1f5fe;
        }
        
        .log-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        
        &.log-running {
          .log-command {
            color: #409eff;
          }
        }
        
        &.log-success {
          .log-command {
            color: #67c23a;
          }
        }
        
        &.log-error {
          .log-command {
            color: #f56c6c;
          }
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 简单的响应式：只有一个断点
@media (max-width: 900px) {
  .explore-task-config {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .config-select-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}
</style>
