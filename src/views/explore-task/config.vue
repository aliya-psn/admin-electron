<template>
  <div class="explore-task-config">
    <div class="main-content">
      <el-card class="main-card">
        <el-steps :active="1" finish-status="success" align-center>
          <el-step title="创建任务" />
          <el-step title="执行测试" />
          <el-step title="查看报告" />
        </el-steps>

        <!-- 环境状态警告（支持 ADB 和 libimobiledevice） -->
        <el-alert
          v-if="adbStatus === 'error' && iosStatus === 'error'"
          type="warning"
          show-icon
          :closable="false"
          class="adb-warning"
        >
          <template #default>
            <div>未检测到可用的设备管理环境（Android/iOS），无法进行设备管理和应用安装。</div>
            <div class="alert-actions">
              <el-button type="primary" size="small" @click="showEnvironmentGuide">
                <el-icon class="mr-1">
                  <Tools />
                </el-icon>
                配置环境
              </el-button>
              <el-button type="default" size="small" @click="refreshDevices(true)">
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
                style="width: 420px"
                :loading="deviceLoading"
                :disabled="adbStatus !== 'success' && iosStatus !== 'success'"
                no-data-text="无可用设备，请检查设备连接"
              >
                <el-option v-for="item in deviceList" :key="item.id" :label="item.name" :value="item.id">
                  <div class="device-options">
                    <div class="device-name">
                      {{ item.name }}
                      <el-tag :type="getPlatformTagConfig(item.platform).type" size="small" class="platform-tag">
                        {{ getPlatformTagConfig(item.platform).text }}
                      </el-tag>
                    </div>
                    <div class="device-details">{{ item.model }} - API {{ item.apiLevel }}</div>
                  </div>
                </el-option>
              </el-select>
              <el-button
                type="primary"
                text
                @click="refreshDevices(true)"
                :loading="deviceLoading"
                :disabled="adbStatus !== 'success' && iosStatus !== 'success'"
              >
                <el-icon class="mr-1">
                  <Refresh />
                </el-icon>
                {{ deviceLoading ? '检测中...' : '刷新设备' }}
              </el-button>
            </div>
            <div v-if="adbStatus !== 'success' && iosStatus !== 'success'" class="form-item-tip">
              <el-icon class="tip-icon ml-1">
                <Warning />
              </el-icon>
              需要先配置可用的设备管理环境（Android/iOS）才能检测设备
            </div>
          </el-form-item>
          <el-form-item label="选择应用" prop="app">
            <div class="config-select-wrapper">
              <el-select v-model="form.app" placeholder="请选择应用" style="width: 420px" :loading="appListLoading">
                <el-option v-for="item in appList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>

              <el-button
                type="primary"
                text
                @click="installApp"
                :loading="installing"
                :disabled="adbStatus !== 'success' && iosStatus !== 'success'"
              >
                <el-icon class="mr-1" v-if="!installing">
                  <Plus />
                </el-icon>
                {{ installing ? '安装中...' : '安装新的应用' }}
              </el-button>
            </div>
            <div v-if="adbStatus !== 'success' && iosStatus !== 'success'" class="form-item-tip">
              <el-icon class="tip-icon ml-1">
                <Warning />
              </el-icon>
              需要先配置可用的设备管理环境（Android/iOS）才能安装应用
            </div>
            <div v-if="appListLoading" class="form-item-tip">
              <el-icon class="tip-icon ml-1">
                <Loading />
              </el-icon>
              正在获取应用列表...
            </div>
          </el-form-item>
          <el-divider>应用探索测试</el-divider>
          <el-form-item label="测试时长" prop="duration" style="max-width: 100%">
            <el-radio-group v-model="form.duration">
              <el-radio v-for="item in durationOptions" :key="item.value" :value="item.value">{{
                item.label
              }}</el-radio>
              <el-radio value="custom">自定义</el-radio>
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
              <el-radio v-for="item in intervalOptions" :key="item.value" :value="item.value">{{
                item.label
              }}</el-radio>
              <el-radio value="custom">自定义</el-radio>
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
          <div class="submit-form-item">
            <el-button type="primary" class="submit-btn" @click="submitForm">
              <el-icon class="mr-1">
                <Plus />
              </el-icon>
              创建任务
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>

    <!-- 设备和应用信息 -->
    <DeviceAppDetail
      :selected-device="selectedDevice"
      :selected-app="selectedApp"
      :adb-status="adbStatus"
      :adb-version="adbVersion"
      :ios-status="iosStatus"
      :ios-version="iosVersion"
    />

    <!-- 环境配置引导对话框 -->
    <EnvGuideDialog v-model:visible="showEnvDialog" @close="showEnvDialog = false" @goto-setup="goToEnvironmentSetup" />

    <!-- 应用安装进度对话框 -->
    <InstallAppDialog
      :visible="installDialog.visible"
      :title="installDialog.title"
      :current-step="installDialog.currentStep"
      :total-steps="installDialog.totalSteps"
      :current-command="installDialog.currentCommand"
      :logs="installDialog.logs"
      :error-msg="installDialog.errorMsg"
      @close="closeInstallDialog"
      @update:visible="val => (installDialog.visible = val)"
    />
  </div>
</template>

<script setup lang="ts">
/*
 * 探索任务配置页面
 *
 * 设备平台支持：
 * - Android设备：使用ADB工具进行设备检测、应用安装和管理
 * - iOS设备：使用libimobiledevice工具进行设备检测（应用安装功能暂不支持）
 *
 * 功能说明：
 * - 自动检测Android和iOS开发环境
 * - 支持同时显示多平台设备
 * - 应用安装功能当前仅支持Android设备
 */

import { ref, computed, watch, onMounted, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Loading, Refresh, Tools, Warning } from '@element-plus/icons-vue';
import { executeCommand } from '@/service/cmd';
import { useRouter } from 'vue-router';
import InstallAppDialog from './InstallAppDialog.vue';
import EnvGuideDialog from './EnvGuideDialog.vue';
import DeviceAppDetail from './DeviceAppDetail.vue';
const router = useRouter();

// ===== 类型定义 =====
type EnvironmentStatus = 'success' | 'error' | 'checking' | 'unknown';
type LogStatus = 'running' | 'success' | 'error';

interface AppInfo {
  id: string;
  name: string;
  package: string;
  version: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  apiLevel: string;
  cpu: string;
  platform: 'android' | 'ios'; // 新增：设备平台标识
  status?: 'device' | 'offline' | 'unauthorized';
}

// ===== 获取平台特定命令的函数 =====
function getPlatformCommand(baseCommand: string): string {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) {
    return `wsl ${baseCommand}`;
  }
  return baseCommand;
}

// ===== 设备命令集中管理 =====
// DEVICE_COMMANDS 统一管理 Android/iOS 相关的 shell 指令，便于维护和调用
const DEVICE_COMMANDS = {
  android: {
    // 获取设备列表
    listDevices: 'adb devices -l',
    // 检查设备连接
    checkConnection: 'adb devices',
    // 获取 Android 设备 API Level
    getApiLevel: (deviceId: string) => `adb -s ${deviceId} shell getprop ro.build.version.sdk`,
    // 获取 CPU 架构
    getCpu: (deviceId: string) => `adb -s ${deviceId} shell getprop ro.product.cpu.abi`,
    // 获取设备型号
    getModel: (deviceId: string) => `adb -s ${deviceId} shell getprop ro.product.model`,
    // 获取设备名称（Android 无）
    getName: undefined,
    // 获取已安装包名列表
    listPackages: (deviceId: string) => `adb -s ${deviceId} shell pm list packages`,
    // 获取指定包的版本号
    packageVersion: (deviceId: string, pkg: string) =>
      `adb -s ${deviceId} shell dumpsys package ${pkg} | grep versionName`,
    // 安装 APK
    installApk: (deviceId: string, apkPath: string) => `adb -s ${deviceId} install -r "${apkPath}"`,
    // 解析 APK 信息
    parseApk: (apkPath: string) => `aapt dump badging "${apkPath}"`
  },
  ios: {
    // 获取设备列表
    listDevices: getPlatformCommand('idevice_id -l'),
    // 检查设备连接
    checkConnection: getPlatformCommand('idevice_id -l'),
    // 获取 iOS 设备系统版本
    getApiLevel: (deviceId: string) => getPlatformCommand(`ideviceinfo -u ${deviceId} -k ProductVersion`),
    // 获取 CPU 架构
    getCpu: (deviceId: string) => getPlatformCommand(`ideviceinfo -u ${deviceId} -k CPUArchitecture`),
    // 获取设备型号
    getModel: (deviceId: string) => getPlatformCommand(`ideviceinfo -u ${deviceId} -k ProductType`),
    // 获取设备名称
    getName: (deviceId: string) => getPlatformCommand(`ideviceinfo -u ${deviceId} -k DeviceName`),
    // 获取已安装应用列表
    listApps: (deviceId: string) => getPlatformCommand(`ideviceinstaller -u ${deviceId} -l`)
  }
} as const;

// ===== 环境检测相关配置 =====
// ENVIRONMENT_CONFIG 用于环境检测的命令和正则
const ENVIRONMENT_CONFIG = {
  android: {
    checkCommand: 'adb version',
    versionRegex: /Android Debug Bridge version (\d+\.\d+\.\d+)/,
    name: 'Android ADB'
  },
  ios: {
    checkCommand: getPlatformCommand('idevice_id --version'),
    versionRegex: /idevice_id (\d+\.\d+\.\d+)/,
    name: 'iOS libimobiledevice'
  }
} as const;

// ===== 环境检测相关状态 =====
// Android ADB环境状态
const adbStatus = ref<'success' | 'error' | 'checking' | 'unknown'>('unknown');
const adbVersion = ref<string>('');
// iOS libimobiledevice环境状态
const iosStatus = ref<'success' | 'error' | 'checking' | 'unknown'>('unknown');
const iosVersion = ref<string>('');
// 环境配置引导
const showEnvDialog = ref(false);

// 设备相关状态
const deviceList = ref<DeviceInfo[]>([]);
const deviceLoading = ref(false);

// 应用相关
const appList = ref<AppInfo[]>([]);
const appListLoading = ref(false);

// 模型列表
const modelList = [{ id: 'qwen2.5-vl-72b', name: 'Qwen2.5-VL-72B' }];

// 测试时长
const durationOptions = [
  { value: '30', label: '0.5小时' },
  { value: '60', label: '1小时' },
  { value: '120', label: '2小时' },
  { value: '360', label: '6小时' },
  { value: '1440', label: '24小时' }
];
// 截屏间隔
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
  duration: durationOptions[0].value,
  customDuration: 30,
  model: modelList[0].id,
  interval: intervalOptions[0].value,
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

// ===== 通用工具函数 =====

// 提取版本信息的通用函数
function extractVersion(output: string, regex: RegExp, fallback: string = '已安装'): string {
  const match = output.match(regex);
  return match ? match[1] : fallback;
}

// 获取平台标签配置
function getPlatformTagConfig(platform: 'android' | 'ios') {
  return {
    type: platform === 'android' ? ('success' as const) : ('primary' as const),
    text: platform === 'android' ? 'Android' : 'iOS'
  };
}

// 任务名称
function generateTaskName() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 取年份后两位
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  return `Task-${year}${month}${day}-${hour}${minute}${second}`;
}

// 选择了应用
watch(
  () => form.value.app,
  _val => {
    // 生成归档包名
    const app = appList.value.find(a => a.id === form.value.app);
    console.log(app);
    form.value.archiveName = app ? `${app.package}_${app.version}_Task-${generateTaskName()}_graph.zip` : '';
  }
);

const selectedApp = computed(() => appList.value.find(a => a.id === form.value.app));
const selectedDevice = computed(() => deviceList.value.find(d => d.id === form.value.device));

// ===== 环境检测函数 =====
// 通用环境检测函数
async function checkEnvironment(
  platform: 'android' | 'ios',
  statusRef: Ref<EnvironmentStatus>,
  versionRef: Ref<string>
): Promise<boolean> {
  const config = ENVIRONMENT_CONFIG[platform];

  statusRef.value = 'checking';

  const result = await executeCommand(config.checkCommand, `${config.name}环境检测失败`);
  console.info(`${platform}检测环境`, result);

  if (result.success && result.stdout) {
    statusRef.value = 'success';
    versionRef.value = extractVersion(result.stdout, config.versionRegex);
    return true;
  } else {
    statusRef.value = 'error';
    versionRef.value = '';
    return false;
  }
}

// 检查Android ADB环境
const checkAdbEnvironment = (): Promise<boolean> => checkEnvironment('android', adbStatus, adbVersion);

// 检查iOS libimobiledevice环境
const checkIosEnvironment = (): Promise<boolean> => checkEnvironment('ios', iosStatus, iosVersion);

// 显示环境配置引导
function showEnvironmentGuide() {
  showEnvDialog.value = true;
}

// 前往环境配置页面
function goToEnvironmentSetup() {
  showEnvDialog.value = false;
  router.push('/environment-setup/index');
}

// ===== 设备信息解析函数 =====
// 解析Android ADB设备信息
function parseDeviceInfo(deviceLine: string): DeviceInfo | null {
  try {
    // 解析 "adb devices -l" 的输出行
    // 格式: device_id	device	product:xxx model:xxx device:xxx transport_id:xxx || emulator-5554          device product:sdk_gphone64_x86_64 model:sdk_gphone64_x86_64 device:emu64xa transport_id:1
    const parts = deviceLine.trim().split(/\s+/);
    const deviceId = parts[0];
    const status = parts[1] as 'device' | 'offline' | 'unauthorized';

    if (parts.length < 2) return null;

    if (status !== 'device') {
      // 设备未就绪，但仍然显示
      return {
        id: deviceId,
        name: `${deviceId} (${status})`,
        model: 'Unknown',
        apiLevel: 'Unknown',
        cpu: 'Unknown',
        platform: 'android' as const, // Android设备
        status
      };
    }

    // 解析详细信息
    const details = parts.slice(2).join(' ');
    console.log(parts, details);

    const modelMatch = details.match(/model:([^\s]+)/);
    const productMatch = details.match(/product:([^\s]+)/);
    const device = details.match(/device:([^\s]+)/);

    const model = modelMatch ? modelMatch[1] : 'Unknown';
    const product = productMatch ? productMatch[1] : '';

    return {
      id: deviceId,
      name: `${deviceId}${product ? `(${product})` : ''}`,
      model: model,
      apiLevel: 'Unknown', // 需要额外查询
      cpu: 'Unknown', // 需要额外查询
      platform: 'android' as const, // Android设备
      status: 'device'
    };
  } catch (error) {
    console.error('解析Android设备信息失败:', error);
    return null;
  }
}

// 解析iOS设备信息
function parseIosDeviceInfo(deviceId: string, deviceName?: string): DeviceInfo | null {
  try {
    if (!deviceId || deviceId.trim() === '') {
      return null;
    }

    return {
      id: deviceId,
      name: deviceName || `iOS设备(${deviceId})`,
      model: 'Unknown', // 需要额外查询
      apiLevel: 'Unknown', // 需要额外查询
      cpu: 'Unknown', // 需要额外查询
      platform: 'ios' as const, // iOS设备
      status: 'device'
    };
  } catch (error) {
    console.error('解析iOS设备信息失败:', error);
    return null;
  }
}

// ===== 设备详细信息获取函数 =====
// 获取设备详细信息的通用函数
async function getDeviceDetails(deviceId: string, platform: 'android' | 'ios'): Promise<Partial<DeviceInfo>> {
  const details: Partial<DeviceInfo> = {};
  const commands = DEVICE_COMMANDS[platform];

  try {
    // 获取API级别/版本
    const apiResult = await executeCommand(commands.getApiLevel(deviceId));
    if (apiResult.success && apiResult.stdout) {
      details.apiLevel = apiResult.stdout.trim();
    }

    // 获取CPU架构
    const cpuResult = await executeCommand(commands.getCpu(deviceId));
    if (cpuResult.success && cpuResult.stdout) {
      details.cpu = cpuResult.stdout.trim();
    }

    // 获取设备型号
    const modelResult = await executeCommand(commands.getModel(deviceId));
    if (modelResult.success && modelResult.stdout) {
      const model = modelResult.stdout.trim();
      if (model && model !== 'Unknown') {
        details.model = model;

        // iOS设备还需要获取设备名称
        if (platform === 'ios' && commands.getName) {
          const nameResult = await executeCommand(commands.getName(deviceId));
          if (nameResult.success && nameResult.stdout) {
            const deviceName = nameResult.stdout.trim();
            details.name = `${deviceName}(${deviceId})`;
          }
        } else {
          details.name = `${deviceId}(${model})`;
        }
      }
    }
  } catch (error) {
    console.error(`获取${platform === 'android' ? 'Android' : 'iOS'}设备 ${deviceId} 详细信息失败:`, error);
  }

  return details;
}

// ===== 设备刷新函数 =====
// 刷新指定平台的设备列表
async function refreshPlatformDevices(platform: 'android' | 'ios'): Promise<DeviceInfo[]> {
  const devices: DeviceInfo[] = [];
  const commands = DEVICE_COMMANDS[platform];

  try {
    const result = await executeCommand(commands.listDevices, `${platform}设备检测失败`); // idevice_id -l || adb devices -l
    console.warn(`${platform}检测连接设备:`, result);

    if (!result.success || !result.stdout) {
      console.warn(`${platform}设备检测失败:`, result.error);
      return devices;
    }

    const output = result.stdout;

    if (platform === 'android') {
      const lines = output.split('\n').filter((line: string) => line.trim() && !line.includes('List of devices'));

      for (const line of lines) {
        const deviceInfo = parseDeviceInfo(line);
        if (deviceInfo) {
          if (deviceInfo.status === 'device') {
            const details = await getDeviceDetails(deviceInfo.id, platform);
            Object.assign(deviceInfo, details);
          }
          devices.push(deviceInfo);
        }
      }
    } else {
      // ios
      const deviceIds = output.split('\n').filter((id: string) => id.trim());

      for (const deviceId of deviceIds) {
        const deviceInfo = parseIosDeviceInfo(deviceId.trim());
        if (deviceInfo) {
          const details = await getDeviceDetails(deviceInfo.id, platform);
          Object.assign(deviceInfo, details);
          devices.push(deviceInfo);
        }
      }
    }

    console.log(`检测到 ${devices.length} 个${platform === 'android' ? 'Android' : 'iOS'}设备`);
  } catch (error) {
    console.error(`刷新${platform}设备列表失败:`, error);
  }

  return devices;
}

// 刷新所有设备列表
async function refreshDevices(forceCheckEnvironment?: boolean): Promise<void> {
  deviceLoading.value = true;

  try {
    let isAdbAvailable: boolean;
    let isIosAvailable: boolean;

    if (forceCheckEnvironment) {
      // 强制重新检查环境状态
      const [adbResult, iosResult] = await Promise.all([checkAdbEnvironment(), checkIosEnvironment()]);
      isAdbAvailable = adbResult;
      isIosAvailable = iosResult;
    } else {
      // 使用已缓存的环境状态，避免重复检查
      isAdbAvailable = adbStatus.value === 'success';
      isIosAvailable = iosStatus.value === 'success';
    }

    const allDevices: DeviceInfo[] = [];
    let androidDeviceCount = 0;
    let iosDeviceCount = 0;

    // 并行获取设备列表
    const devicePromises: Promise<DeviceInfo[]>[] = [];

    if (isAdbAvailable) {
      devicePromises.push(refreshPlatformDevices('android'));
    }

    if (isIosAvailable) {
      devicePromises.push(refreshPlatformDevices('ios'));
    }

    const deviceResults = await Promise.all(devicePromises);

    deviceResults.forEach((devices, index) => {
      allDevices.push(...devices);
      if (isAdbAvailable && (!isIosAvailable || index === 0)) {
        androidDeviceCount = devices.length;
      } else if (isIosAvailable) {
        iosDeviceCount = devices.length;
      }
    });

    deviceList.value = allDevices;

    // 清空无效的设备选择
    if (form.value.device && !allDevices.find(d => d.id === form.value.device)) {
      form.value.device = '';
    }

    // 显示检测结果
    showDeviceDetectionResult(allDevices.length, androidDeviceCount, iosDeviceCount, isAdbAvailable, isIosAvailable);
  } catch (error) {
    console.error('刷新设备列表失败:', error);
    ElMessage.error(`设备检测失败: ${error}`);
    deviceList.value = [];
  } finally {
    deviceLoading.value = false;
  }
}

// 显示设备检测结果
function showDeviceDetectionResult(
  totalCount: number,
  androidCount: number,
  iosCount: number,
  isAdbAvailable: boolean,
  isIosAvailable: boolean
): void {
  if (totalCount === 0) {
    if (!isAdbAvailable && !isIosAvailable) {
      ElMessage.warning('未检测到ADB和iOS开发环境，请先配置相关工具');
      showEnvironmentGuide();
    } else {
      ElMessage.warning('未检测到连接的设备，请确保设备已连接并启用调试模式');
    }
  } else {
    const messages = [];
    if (androidCount > 0) messages.push(`${androidCount}个Android设备`);
    if (iosCount > 0) messages.push(`${iosCount}个iOS设备`);
    ElMessage.success(`检测到 ${messages.join('、')}`);
  }
}

/*******  检查设备连接状态  开始 ***** */
// 检查Android设备连接状态
async function checkAndroidDeviceConnection(deviceId: string): Promise<boolean> {
  try {
    const result = await executeCommand(DEVICE_COMMANDS.android.checkConnection);
    if (result.success && result.stdout) {
      // 检查设备是否在连接的设备列表中
      const devices = result.stdout
        .split('\n')
        .filter((line: string) => line.trim() && !line.includes('List of devices') && line.includes('device'));
      return devices.some((line: string) => line.includes(deviceId));
    }
    return false;
  } catch (error) {
    console.error('检查Android设备连接失败:', error);
    return false;
  }
}

// 检查iOS设备连接状态
async function checkIosDeviceConnection(deviceId: string): Promise<boolean> {
  try {
    const result = await executeCommand(DEVICE_COMMANDS.ios.checkConnection);
    if (result.success && result.stdout) {
      // 检查设备是否在连接的设备列表中
      const devices = result.stdout.split('\n').filter((id: string) => id.trim());
      return devices.includes(deviceId);
    }
    return false;
  } catch (error) {
    console.error('检查iOS设备连接失败:', error);
    return false;
  }
}

// 检查设备连接状态（统一接口）
async function checkDeviceConnection(deviceId: string, platform: 'android' | 'ios'): Promise<boolean> {
  if (platform === 'android') {
    return await checkAndroidDeviceConnection(deviceId);
  } else {
    return await checkIosDeviceConnection(deviceId);
  }
}
/*******  检查设备连接状态  结束 ***** */

/****** 安装安卓应用 开始 ******/

// 安卓应用安装相关状态
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
    key?: string;
  }>,
  errorMsg: '' // 新增：失败时的错误提示
});

// 安装 app 添加日志条目
function installAppLog(message: string, status: LogStatus, output?: string, error?: string, key?: string): void {
  if (key) {
    const idx = installDialog.value.logs.findIndex(log => log.key === key);
    if (idx !== -1) {
      installDialog.value.logs[idx] = { ...installDialog.value.logs[idx], message, status, output, error };
      return;
    }
  }
  installDialog.value.logs.push({ message, status, output, error, key });
}

// 安装应用主函数
async function installApp() {
  try {
    // 1. 检查是否选择了设备
    if (!form.value.device) {
      ElMessage.warning('请先选择测试设备');
      return;
    }

    // 获取选中设备的平台信息
    const selectedDevice = deviceList.value.find(d => d.id === form.value.device);
    if (!selectedDevice) {
      ElMessage.error('设备信息不完整');
      return;
    }

    // 2. 判断设备平台
    if (selectedDevice.platform === 'ios') {
      ElMessage.error('暂不支持 iOS 设备的应用安装');
      return;
    }

    // 3. 检查 ADB 环境（仅 Android）
    if (adbStatus.value !== 'success') {
      const isAdbAvailable = await checkAdbEnvironment();
      if (!isAdbAvailable) {
        ElMessage.error('ADB环境不可用，请先配置ADB环境');
        showEnvironmentGuide();
        return;
      }
    }

    // 4. 打开文件选择对话框
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

    // 5. 开始安装流程
    installing.value = true;

    // 初始化安装对话框
    Object.assign(installDialog.value, {
      visible: true,
      title: '安装应用',
      currentStep: 0,
      totalSteps: 4,
      currentCommand: '',
      logs: [],
      errorMsg: ''
    });

    // 步骤1: 检查设备连接
    installDialog.value.currentStep = 1;
    installDialog.value.currentCommand = '检查设备连接状态...';
    installAppLog('检查设备连接状态', 'running', '', '', 'check-device');

    const isConnected = await checkDeviceConnection(form.value.device, selectedDevice.platform);
    if (!isConnected) {
      installAppLog(
        '设备连接检查失败',
        'error',
        '',
        `请确保${selectedDevice.platform === 'android' ? 'Android' : 'iOS'}设备已连接并启用调试模式`,
        'check-device'
      );
      installDialog.value.errorMsg = `设备未连接或相关工具不可用，请确保${selectedDevice.platform === 'android' ? 'Android' : 'iOS'}设备已连接并启用调试模式`;
      ElMessage.error('设备未连接或相关工具不可用');
      return;
    }
    installAppLog('设备连接正常', 'success', '', '', 'check-device');

    // 步骤2: 解析APK信息
    installDialog.value.currentStep = 2;
    installDialog.value.currentCommand = '解析APK信息...';
    installAppLog('解析APK信息', 'running', '', '', 'parse-apk');

    const apkInfo = await parseApkInfo(apkPath);
    if (!apkInfo) {
      installAppLog('APK信息解析失败', 'error', '', '', 'parse-apk');
      installDialog.value.errorMsg = 'APK文件信息解析失败，请检查APK文件是否有效';
      ElMessage.error('APK文件信息解析失败');
      return;
    }
    installAppLog(`解析成功: ${apkInfo.package}`, 'success', '', '', 'parse-apk');

    // 步骤3: 安装APK
    installDialog.value.currentStep = 3;
    installDialog.value.currentCommand = `安装APK: ${apkPath}`;
    installAppLog('开始安装APK到设备', 'running', '', '', 'install-apk');

    const installCommand = DEVICE_COMMANDS.android.installApk(form.value.device, apkPath);
    const installResult = await executeCommand(installCommand);

    if (!installResult.success || (installResult.stderr && installResult.stderr.includes('FAILED'))) {
      const errorMsg = installResult.stderr || installResult.error || '安装失败';
      installAppLog('APK安装失败', 'error', '', errorMsg, 'install-apk');
      installDialog.value.errorMsg = '应用安装失败，请检查设备存储空间或APK兼容性';
      ElMessage.error('应用安装失败');
      return;
    }
    installAppLog('APK安装成功', 'success', installResult.stdout, '', 'install-apk');

    // 步骤4: 更新应用列表
    installDialog.value.currentStep = 4;
    installDialog.value.currentCommand = '更新应用列表...';
    installAppLog('更新应用列表', 'running', '', '', 'update-app-list');

    // 生成新的应用ID
    const newAppId = `app_${Date.now()}`;
    // 安装新应用时，组装 AppInfo 对象
    const newApp: AppInfo = {
      id: newAppId,
      name: apkInfo.package || '', // 这里可根据实际 APK 解析结果补充更多字段
      package: apkInfo.package || '',
      version: apkInfo.version || ''
    };

    // 检查是否已存在相同包名的应用
    const existingIndex = appList.value.findIndex(app => app.package === newApp.package);
    if (existingIndex !== -1) {
      // 更新现有应用
      appList.value[existingIndex] = newApp;
      installAppLog('应用信息已更新', 'success', '', '', 'update-app-list');
    } else {
      // 添加新应用
      appList.value.push(newApp);
      installAppLog('新应用已添加到列表', 'success', '', '', 'update-app-list');
    }

    // 自动选择新安装的应用
    form.value.app = newAppId;

    ElMessage.success('应用安装完成！');
    installAppLog('应用安装流程完成', 'success', '', '', 'install-flow');
  } catch (error) {
    console.error('安装应用时发生错误:', error);
    installAppLog('安装过程异常', 'error', '', String(error), 'install-flow');
    installDialog.value.errorMsg = '安装过程中发生未知错误，请重试或联系管理员';
    ElMessage.error('安装过程中发生错误');
  } finally {
    installing.value = false;
    // 判断是否全部完成
    if (installDialog.value.logs.some(log => log.key === 'install-flow' && log.status === 'success')) {
      installDialog.value.currentStep = installDialog.value.totalSteps;
    }
  }
}

// 解析APK信息
async function parseApkInfo(apkPath: string): Promise<Partial<AppInfo> | null> {
  try {
    // 使用 aapt 或其他工具解析 APK 信息
    const cmdResult = await executeCommand(DEVICE_COMMANDS.android.parseApk(apkPath));
    if (cmdResult.success && cmdResult.stdout) {
      const packageMatch = cmdResult.stdout.match(/package: name='([^']+)'/);
      const versionMatch = cmdResult.stdout.match(/versionName='([^']+)'/);
      return {
        package: packageMatch ? packageMatch[1] : '',
        version: versionMatch ? versionMatch[1] : ''
      };
    }
    // 如果 aapt 不可用，返回 null
    return null;
  } catch (error) {
    console.error('解析APK信息失败:', error);
    return null;
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
        logs: [],
        errorMsg: ''
      };
    }, 300);
  }
}

/****** 安装安卓应用 结束 ******/

// 创建任务
async function submitForm() {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 获取应用和设备详细信息
      const app = appList.value.find(a => a.id === form.value.app);
      const device = deviceList.value?.find?.(d => d.id === form.value.device);
      const params = {
        platform: device?.platform, // 'android' | 'ios'
        deviceName: device?.name,
        package: app?.package,
        // appActivity: app?.mainActivity, // Android
        bundleId: app?.package // iOS
      };

      router.push('/explore-task/execute');

      // 调用主进程 Appium 任务
      const result = await window.electronAppiumAPI.runAppiumTask(params);
      if (result?.success) {
        ElMessage.success('自动化任务执行成功');
        router.push('/explore-task/execute');
      } else {
        ElMessage.error('自动化任务失败');
      }
    }
  });
}

// 页面加载时检查环境和设备
onMounted(async () => {
  // 同时检查Android和iOS环境
  const [isAdbAvailable, isIosAvailable] = await Promise.all([checkAdbEnvironment(), checkIosEnvironment()]);

  // 如果任一环境可用，则尝试获取设备列表
  if (isAdbAvailable || isIosAvailable) {
    refreshDevices(false); // 使用缓存的环境状态
  }
});

/**
 * 当前设备获取应用列表
 * @param deviceId 设备
 * @param platform 平台
 */
async function fetchDeviceApps(deviceId: string, platform: 'android' | 'ios'): Promise<AppInfo[]> {
  const apps: AppInfo[] = [];
  appListLoading.value = true;
  try {
    if (platform === 'android') {
      // 获取所有包名
      const listResult = await executeCommand(DEVICE_COMMANDS.android.listPackages(deviceId));
      if (!listResult.success || !listResult.stdout) return apps;
      const packageNames = listResult.stdout
        .split('\n')
        .map(line => line.replace('package:', '').trim())
        .filter(Boolean)
        .slice(1); // 跳过第一行标题
      for (const pkg of packageNames) {
        // 获取版本号等信息
        // const versionResult = await executeCommand(DEVICE_COMMANDS.android.packageVersion(deviceId, pkg));
        // const version =
        //   versionResult.success && versionResult.stdout
        //     ? versionResult.stdout.match(/versionName=([\S]+)/)?.[1] || '未知'
        //     : '未知';
        apps.push({
          id: pkg,
          name: pkg,
          package: pkg,
          version: '-'
        });
      }
    } else if (platform === 'ios') {
      const listResult = await executeCommand(DEVICE_COMMANDS.ios.listApps(deviceId)); // ideviceinstaller -u 00008020-0019349A3651002E -l
      if (!listResult.success || !listResult.stdout) return apps;
      const lines = listResult.stdout.split('\n').filter(Boolean).slice(1); // 跳过第一行标题
      for (const line of lines) {
        // cn.com.10jqka.IHexin, "11.60.81", "同花顺"
        const [pkg, versionRaw, nameRaw] = line.split(',');
        // 去除引号和空格
        const version = versionRaw?.replace(/[" ]/g, '') || '';
        const name = nameRaw?.replace(/[" ]/g, '') || pkg;

        apps.push({
          id: pkg,
          name,
          package: pkg,
          version
        });
      }
    }
  } catch (error) {
    console.error('获取设备应用列表失败:', error);
  } finally {
    appListLoading.value = false;
  }
  return apps;
}

// 监听设备切换，自动刷新 appList
watch(
  () => form.value.device,
  async deviceId => {
    appList.value = [];
    form.value.app = '';

    if (!deviceId) return;
    const device = deviceList.value.find(d => d.id === deviceId);
    console.info('获取到设备信息:', device);
    if (!device) return;
    appList.value = await fetchDeviceApps(deviceId, device.platform);
  }
);
</script>

<style scoped lang="scss">
.explore-task-config {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
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
.device-options {
  .device-name {
    font-weight: 500;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;

    .platform-tag {
      font-size: 10px;
      height: 16px;
      padding: 0 6px;
      line-height: 16px;
    }
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
    height: 38px;
    width: 160px;
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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
