<template>
  <div class="environment-setup">
    <div class="setup-header">
      <el-card>
        <div class="header-content">
          <div class="header-info">
            <div class="flex items-center mb-2">
              <h2>自动化测试环境配置</h2>
              <div class="ml-2">
                <el-tag v-if="systemInfo.platform" :type="getSystemTagType() as any">
                  <el-icon class="mr-1">
                    <Monitor />
                  </el-icon>
                  {{ getSystemDisplayName() }}
                </el-tag>
              </div>
            </div>
            <p>引导您安装和配置Python、Appium、Android ADB、iOS libimobiledevice等自动化测试必需的环境</p>
          </div>
          <div class="header-actions">
            <el-button type="warning" @click="checkAllEnvironments">
              <el-icon class="mr-1">
                <Refresh />
              </el-icon>
              检测环境
            </el-button>
            <el-button @click="openSystemTerminal">
              <el-icon class="mr-1">
                <Monitor />
              </el-icon>
              打开终端
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="setup-content">
      <!-- 环境检测状态 -->
      <el-card class="status-card">
        <template #header>
          <div class="card-header">
            <span>环境状态</span>
            <el-tag :type="overallStatus.type as any">{{ overallStatus.text }}</el-tag>
          </div>
        </template>
        <div class="status-grid">
          <div
            v-for="item in environmentItems"
            :key="item.name"
            class="status-item"
            :class="{ 'status-checking': item.checking }"
          >
            <div class="status-icon">
              <el-icon v-if="item.checking" class="loading-icon">
                <Loading />
              </el-icon>
              <el-icon v-else-if="item.status === 'success'" class="success-icon">
                <SuccessFilled />
              </el-icon>
              <el-icon v-else-if="item.status === 'error'" class="error-icon">
                <CloseBold />
              </el-icon>
              <el-icon v-else-if="item.status === 'unsupported'" class="unsupported-icon">
                <CircleCloseFilled />
              </el-icon>
              <el-icon v-else class="warning-icon">
                <QuestionFilled />
              </el-icon>
            </div>
            <div class="status-info">
              <div class="flex items-center mb-1">
                <div class="name">{{ item.name }}</div>
                <div class="version" v-if="item.version">{{ item.version }}</div>
              </div>
              <div class="description">{{ item.description }}</div>
            </div>
            <div class="status-actions">
              <el-button
                size="small"
                :type="item.status === 'success' ? 'success' : item.status === 'unsupported' ? 'info' : 'primary'"
                @click="item.status === 'success' ? null : handleActionButtonClick(item)"
                :loading="item.checking"
                :disabled="item.checking || item.status === 'unsupported'"
              >
                {{ getActionButtonText(item) }}
              </el-button>
              <el-button
                size="small"
                @click="checkEnvironment(item)"
                :loading="item.checking"
                :disabled="item.installing || item.status === 'unsupported'"
              >
                重新检测
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 安装指南 -->
      <el-card class="guide-card">
        <template #header>
          <div class="card-header">
            <span>安装指南</span>
          </div>
        </template>
        <el-collapse v-model="activeGuides">
          <el-collapse-item v-for="item in environmentItems" :key="item.key" :title="item.name" :name="item.key">
            <div class="guide-content">
              <div class="guide-check">
                <h4>检测命令：</h4>
                <div class="command-item">
                  <el-input readonly :value="item.checkCommand" class="command-input">
                    <template #append>
                      <el-button @click="copyCommand(item.checkCommand)">复制</el-button>
                      <el-button
                        type="success"
                        @click="executeCommand(item.checkCommand)"
                        :loading="item.checkCommand === executingCommand"
                      >
                        检测
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </div>
              <div class="guide-steps">
                <h4>安装步骤：</h4>
                <ol>
                  <li
                    v-for="step in item.installSteps"
                    :key="step"
                    class="install-step"
                    v-html="formatStepWithLinks(step)"
                  />
                </ol>
              </div>
              <div class="guide-commands" v-if="item.installCommands && item.installCommands.length > 0">
                <h4>安装命令：</h4>
                <div v-for="cmd in item.installCommands" :key="cmd" class="command-item">
                  <el-input readonly :value="cmd" class="command-input">
                    <template #append>
                      <el-button @click="copyCommand(cmd)">复制</el-button>
                      <el-button type="primary" @click="executeCommand(cmd)" :loading="cmd === executingCommand">
                        执行
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </div>
              <div class="guide-notes" v-if="item.notes">
                <h4>注意事项：</h4>
                <ul>
                  <li v-for="note in item.notes" :key="note">{{ note }}</li>
                </ul>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <!-- 命令执行结果 -->
      <el-card ref="resultCardRef" class="result-card" v-if="commandResult">
        <template #header>
          <div class="card-header">
            <span>执行结果</span>
            <el-button size="small" @click="clearResult">清空</el-button>
          </div>
        </template>
        <div class="result-content">
          <div class="result-command"><strong>命令：</strong>{{ commandResult.command }}</div>
          <div class="result-status">
            <strong>状态：</strong>
            <el-tag :type="commandResult.success === null ? 'warning' : commandResult.success ? 'success' : 'danger'">
              <el-icon v-if="commandResult.success === null" class="mr-1 loading-icon">
                <Loading />
              </el-icon>
              {{ commandResult.success === null ? '执行中' : commandResult.success ? '成功' : '失败' }}
            </el-tag>
          </div>
          <div class="result-output" v-if="commandResult.stdout">
            <strong>输出：</strong>
            <pre>{{ commandResult.stdout }}</pre>
          </div>
          <div class="result-error" v-if="commandResult.stderr">
            <strong>日志：</strong>
            <pre>{{ commandResult.stderr }}</pre>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 安装进度对话框 -->
    <el-dialog v-model="installDialog.visible" :title="installDialog.title" width="600px" :close-on-click-modal="false">
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
            <strong>当前执行：</strong>
            <code>{{ installDialog.currentCommand }}</code>
          </div>
        </div>

        <div class="progress-logs">
          <h4>执行日志：</h4>
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
                <code>{{ log.command }}</code>
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Refresh,
  Monitor,
  Loading,
  SuccessFilled,
  CloseBold,
  QuestionFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue';

// 类型定义
// 只保留 win32 和 darwin
type PlatformType = 'win32' | 'darwin';
type EnvironmentStatus = 'success' | 'error' | 'unknown' | 'unsupported';
type LogStatus = 'running' | 'success' | 'error';

interface EnvironmentItem {
  key: string;
  name: string;
  description: string;
  checkCommand: string;
  installCommands: string[];
  installSteps: string[];
  notes?: string[];
  status: EnvironmentStatus;
  version?: string;
  checking: boolean;
  installing: boolean;
}

interface SystemInfo {
  platform: PlatformType;
  arch: string;
  version: string;
}

interface CommandResult {
  command: string;
  success: boolean | null;
  stdout: string;
  stderr: string;
  error?: string;
}

interface LogEntry {
  command: string;
  status: LogStatus;
  output?: string;
  error?: string;
}

interface InstallDialog {
  visible: boolean;
  title: string;
  currentStep: number;
  totalSteps: number;
  currentCommand: string;
  logs: LogEntry[];
}

// 响应式状态
const activeGuides = ref<string[]>([]);
const executingCommand = ref<string>('');
const commandResult = ref<CommandResult | null>(null);
const systemInfo = ref<Partial<SystemInfo>>({});
const resultCardRef = ref<any>(null);

// 安装进度对话框
const installDialog = ref<InstallDialog>({
  visible: false,
  title: '',
  currentStep: 0,
  totalSteps: 0,
  currentCommand: '',
  logs: []
});

// 环境配置数据
interface EnvironmentConfig {
  key: string;
  name: string;
  description: string;
  checkCommand: Record<PlatformType, string>;
  installCommands: Record<PlatformType, string[]>;
  installSteps: Record<PlatformType, string[]>;
  notes: Record<PlatformType, string[]>;
  unsupportedPlatforms?: PlatformType[];
}

const ENVIRONMENT_CONFIGS: EnvironmentConfig[] = [
  {
    key: 'python',
    name: 'Python',
    description: 'Python编程语言环境',
    checkCommand: {
      win32: 'python --version',
      darwin: 'python3 --version'
    },
    installCommands: {
      win32: ['winget install Python.Python.3.11', 'python -m pip install --upgrade pip'],
      darwin: ['brew install python@3.11', 'python3 -m pip install --upgrade pip']
    },
    installSteps: {
      win32: [
        '从官网下载Python 3.11或更高版本',
        '运行安装程序，确保勾选"Add Python to PATH"',
        '验证安装：python --version'
      ],
      darwin: [
        '运行 brew install python@3.11',
        '验证安装：python3 --version'
      ]
    },
    notes: {
      win32: ['推荐安装Python 3.11+', '安装时必须勾选"Add Python to PATH"'],
      darwin: ['推荐使用Homebrew安装', '确保PATH包含Python路径']
    }
  },
  {
    key: 'pip',
    name: 'Pip',
    description: 'Python包管理工具',
    checkCommand: {
      win32: 'pip --version',
      darwin: 'pip3 --version'
    },
    installCommands: {
      win32: ['python -m ensurepip --upgrade', 'python -m pip install --upgrade pip'],
      darwin: ['python3 -m ensurepip --upgrade', 'python3 -m pip install --upgrade pip']
    },
    installSteps: {
      win32: ['Pip通常随Python一起安装', '如果没有可使用 python -m ensurepip 安装'],
      darwin: ['Pip通常随Python一起安装', '如果没有可使用 python3 -m ensurepip 安装']
    },
    notes: {
      win32: ['Pip通常随Python一起安装', '如果没有可使用 python -m ensurepip 安装'],
      darwin: ['Pip通常随Python一起安装', '如果没有可使用 python3 -m ensurepip 安装']
    }
  },
  {
    key: 'nodejs',
    name: 'Node.js',
    description: 'JavaScript运行环境',
    checkCommand: {
      win32: 'node --version',
      darwin: 'node --version'
    },
    installCommands: {
      win32: ['winget install OpenJS.NodeJS'],
      darwin: ['brew install node']
    },
    installSteps: {
      win32: [
        '从官网下载Node.js LTS版本',
        '运行安装程序，使用默认设置',
        '验证安装：node --version 和 npm --version'
      ],
      darwin: [
        '使用Homebrew安装：brew install node',
        '验证安装：node --version 和 npm --version'
      ]
    },
    notes: {
      win32: ['推荐安装LTS版本', 'npm会一起安装'],
      darwin: ['推荐安装LTS版本', 'npm会一起安装']
    }
  },
  {
    key: 'appium',
    name: 'Appium',
    description: '跨平台移动应用自动化测试工具',
    checkCommand: {
      win32: 'appium --version',
      darwin: 'appium --version'
    },
    installCommands: {
      win32: ['npm install -g appium', 'appium driver install uiautomator2'],
      darwin: ['npm install -g appium', 'appium driver install uiautomator2']
    },
    installSteps: {
      win32: [
        '确保已安装Node.js和npm',
        '全局安装Appium：npm install -g appium',
        '安装UiAutomator2驱动',
        '验证安装：appium --version'
      ],
      darwin: [
        '确保已安装Node.js和npm',
        '全局安装Appium：npm install -g appium',
        '安装UiAutomator2驱动',
        '验证安装：appium --version'
      ]
    },
    notes: {
      win32: ['需要先安装Node.js', '建议安装UiAutomator2驱动'],
      darwin: ['需要先安装Node.js', '建议安装UiAutomator2驱动']
    }
  },
  {
    key: 'appium-python-client',
    name: 'Appium Python Client',
    description: 'Appium的Python客户端库',
    checkCommand: {
      win32: 'python -c "import appium; print(f\'appium {appium.__version__}\')" 2>nul || echo "模块未安装"',
      darwin: 'python3 -c "import appium; print(f\'appium {appium.__version__}\')" 2>/dev/null || echo "模块未安装"'
    },
    installCommands: {
      win32: ['pip install Appium-Python-Client'],
      darwin: ['pip3 install Appium-Python-Client']
    },
    installSteps: {
      win32: ['确保已安装Python和pip', '安装Appium Python客户端'],
      darwin: ['确保已安装Python和pip', '安装Appium Python客户端']
    },
    notes: {
      win32: ['需要先安装Python和pip', '用于编写Appium测试脚本'],
      darwin: ['需要先安装Python和pip', '用于编写Appium测试脚本']
    }
  },
  {
    key: 'adb',
    name: 'Android Debug Bridge (ADB)',
    description: 'Android调试桥工具',
    checkCommand: {
      win32: 'adb version',
      darwin: 'adb version'
    },
    installCommands: {
      win32: [], // Windows需要手动安装
      darwin: ['brew install android-platform-tools']
    },
    installSteps: {
      win32: [
        '前往Android官方网站下载Platform Tools：https://developer.android.com/studio/releases/platform-tools',
        '点击"Download SDK Platform-Tools for Windows"下载压缩包',
        '解压下载的zip文件到合适目录，例如：C:\\platform-tools',
        '配置环境变量（推荐）：\n• 在Windows搜索框输入"环境变量"\n• 选择"编辑系统环境变量"\n• 点击"环境变量..."\n• 在"系统变量"中找到Path，点击"编辑"\n• 点击"新建"，添加：C:\\platform-tools\n• 确认保存所有设置',
        '重新打开命令提示符或PowerShell',
        '验证安装：输入 adb version 命令'
      ],
      darwin: [
        '使用Homebrew安装：brew install android-platform-tools',
        '验证安装：adb version'
      ]
    },
    notes: {
      win32: ['配置环境变量后可在任何目录使用adb命令', '如果检测失败，建议重启电脑'],
      darwin: ['推荐使用包管理器安装', '确保命令行可以直接使用adb命令']
    }
  },
  {
    key: 'java',
    name: 'Java JDK',
    description: 'Java开发工具包',
    checkCommand: {
      win32: 'java -version',
      darwin: 'java -version'
    },
    installCommands: {
      win32: [], // Windows需要手动安装
      darwin: ['brew install openjdk@17']
    },
    installSteps: {
      win32: [
        '下载并安装JDK 17或更高版本',
        '配置JAVA_HOME环境变量',
        '将%JAVA_HOME%\\bin添加到PATH',
        '验证安装：java -version'
      ],
      darwin: [
        '使用Homebrew安装：brew install openjdk@17',
        '配置JAVA_HOME环境变量',
        '验证安装：java -version'
      ]
    },
    notes: {
      win32: ['推荐安装JDK 11或17 LTS版本', '需要正确配置JAVA_HOME环境变量'],
      darwin: ['推荐安装JDK 11或17 LTS版本', '需要正确配置JAVA_HOME环境变量']
    }
  },
  {
    key: 'libimobiledevice',
    name: 'libimobiledevice',
    description: 'iOS设备通信库 (iOS设备检测必需)',
    checkCommand: {
      win32: 'echo "平台不支持"',
      darwin: 'idevice_id --version 2>/dev/null || echo "未安装"'
    },
    installCommands: {
      win32: [],
      darwin: ['brew install libimobiledevice', 'brew install ideviceinstaller']
    },
    installSteps: {
      win32: [],
      darwin: [
        '安装libimobiledevice：brew install libimobiledevice',
        '安装iOS应用安装工具：brew install ideviceinstaller',
        '验证安装：idevice_id --version'
      ]
    },
    notes: {
      win32: [],
      darwin: ['确保iOS设备已启用"信任此电脑"', '首次连接设备时需要在设备上确认信任']
    },
    unsupportedPlatforms: ['win32']
  },
  {
    key: 'ios-deploy',
    name: 'ios-deploy',
    description: 'iOS应用部署工具 (可选)',
    checkCommand: {
      win32: 'echo "平台不支持"',
      darwin: 'ios-deploy --version 2>/dev/null || echo "未安装"'
    },
    installCommands: {
      win32: [],
      darwin: ['npm install -g ios-deploy']
    },
    installSteps: {
      win32: [],
      darwin: [
        '确保已安装Node.js和npm',
        '全局安装：npm install -g ios-deploy',
        '验证安装：ios-deploy --version'
      ]
    },
    notes: {
      win32: [],
      darwin: ['需要Xcode命令行工具支持', '用于直接部署iOS应用到设备']
    },
    unsupportedPlatforms: ['win32']
  },
  {
    key: 'xcrun',
    name: 'Xcode Command Line Tools',
    description: 'iOS开发命令行工具',
    checkCommand: {
      win32: 'echo "平台不支持"',
      darwin: 'xcrun --version 2>/dev/null || echo "未安装"'
    },
    installCommands: {
      win32: [],
      darwin: ['xcode-select --install']
    },
    installSteps: {
      win32: [],
      darwin: [
        '运行命令：xcode-select --install',
        '在弹出的对话框中点击"安装"',
        '等待下载和安装完成',
        '验证安装：xcrun --version'
      ]
    },
    notes: {
      win32: [],
      darwin: ['包含iOS开发必需的编译工具和SDK', '安装包较大，需要稳定的网络连接']
    },
    unsupportedPlatforms: ['win32']
  },
  {
    key: 'ios-device-connection',
    name: 'iOS设备连接测试',
    description: '测试是否能够检测到连接的iOS设备',
    checkCommand: {
      win32: 'echo "平台不支持"',
      darwin: 'idevice_id -l 2>/dev/null || echo "无设备连接"'
    },
    installCommands: {
      win32: [],
      darwin: []
    },
    installSteps: {
      win32: [],
      darwin: [
        '此项用于测试iOS设备连接状态',
        '确保已安装libimobiledevice工具',
        '使用USB连接iOS设备',
        '在iOS设备上信任此电脑',
        '点击"重新检测"查看连接状态'
      ]
    },
    notes: {
      win32: [],
      darwin: ['需要先安装libimobiledevice工具', '首次连接需要在设备上确认信任', '显示设备ID表示连接成功']
    },
    unsupportedPlatforms: ['win32']
  }
];

// 根据操作系统生成环境配置
function generateEnvironmentItems(platform: PlatformType): EnvironmentItem[] {
  // 只处理 win32/darwin
  const items: EnvironmentItem[] = ENVIRONMENT_CONFIGS.map(config => ({
    key: config.key,
    name: config.name,
    description: config.description,
    checkCommand: config.checkCommand[platform],
    installCommands: config.installCommands[platform],
    installSteps: config.installSteps[platform],
    notes: config.notes[platform],
    status: 'unknown' as EnvironmentStatus,
    checking: false,
    installing: false
  }));
  items.forEach(item => {
    const config = ENVIRONMENT_CONFIGS.find(c => c.key === item.key);
    if (config?.unsupportedPlatforms?.includes(platform)) {
      item.status = 'unsupported';
    }
  });
  return items;
}

const environmentItems = reactive<EnvironmentItem[]>([]);

// 优化的状态计算和分组
const environmentStats = computed(() => {
  const stats = {
    success: 0,
    error: 0,
    unknown: 0,
    unsupported: 0,
    checking: 0,
    installing: 0
  };

  environmentItems.forEach(item => {
    stats[item.status]++;
    if (item.checking) stats.checking++;
    if (item.installing) stats.installing++;
  });

  const available = stats.success + stats.error + stats.unknown;
  
  return {
    ...stats,
    total: environmentItems.length,
    available,
    progress: available > 0 ? (stats.success / available * 100) : 0
  };
});

const overallStatus = computed(() => {
  const { success, available, unsupported, total, progress } = environmentStats.value;

  if (success === available && available > 0) {
    return { type: 'success', text: '环境完整', icon: 'SuccessFilled' };
  } else if (success > 0) {
    return { 
      type: 'warning', 
      text: `部分完成 ${Math.round(progress)}% (${success}/${available})`,
      icon: 'Warning' 
    };
  } else if (unsupported === total) {
    return { type: 'info', text: '当前平台暂不支持', icon: 'QuestionFilled' };
  } else {
    return { type: 'danger', text: '环境未配置', icon: 'CircleCloseFilled' };
  }
});

// 获取操作按钮文本
function getActionButtonText(item: EnvironmentItem): string {
  if (item.installing) return '查看进度';
  if (item.checking) return '检测中...';
  if (item.status === 'success') return '已安装';
  if (item.status === 'unsupported') return '不支持';
  if (!item.installCommands || item.installCommands.length === 0) return '查看指南';
  return '安装';
}

// 处理操作按钮点击
function handleActionButtonClick(item: EnvironmentItem) {
  if (item.installing) {
    // 正在安装，重新打开进度对话框
    if (installDialog.value.title === `安装 ${item.name}`) {
      installDialog.value.visible = true;
    }
  } else if (!item.installCommands || item.installCommands.length === 0) {
    // 没有安装命令，展开安装指南
    if (!activeGuides.value.includes(item.key)) {
      activeGuides.value.push(item.key);
    }
    // 显示提示
    ElMessage.info('请参考下方的详细安装指南进行手动安装');
  } else {
    // 未安装状态，开始安装
    installEnvironment(item);
  }
}



// 关闭安装进度对话框
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
    }, 300); // 延迟清理，确保对话框动画完成
  }
}

// 获取系统标签类型
function getSystemTagType(): string {
  const platform = systemInfo.value.platform;
  if (platform === 'darwin') return 'warning';
  if (platform === 'win32') return 'primary';
  return 'info';
}

// 获取系统显示名称
function getSystemDisplayName(): string {
  const platform = systemInfo.value.platform;
  if (platform === 'darwin') return 'macOS';
  if (platform === 'win32') return 'Windows';
  return '未知系统';
}

// 初始化系统信息时只考虑 win32/darwin
async function initializeSystem() {
  try {
    const result = await (window as any).systemAPI.getAll();
    if (result.success) {
      systemInfo.value = result.data;
      const newItems = generateEnvironmentItems(result.data.platform);
      environmentItems.splice(0, environmentItems.length, ...newItems);
    }
  } catch (error) {
    console.error('获取系统信息失败:', error);
    const defaultItems = generateEnvironmentItems('win32');
    environmentItems.splice(0, environmentItems.length, ...defaultItems);
  }
}

// 错误处理和用户反馈系统
interface ErrorContext {
  operation: string;
  item?: string;
  command?: string;
  originalError?: unknown;
}

// 错误类型映射和用户友好消息
const ERROR_MESSAGES = {
  '未安装': '环境未安装，请点击安装按钮进行安装',
  '无设备连接': '未检测到设备连接，请确保设备已连接并信任此电脑',
  '命令未找到': '命令未找到，可能未正确安装或未添加到PATH环境变量',
  '模块未安装': 'Python模块未安装，请使用pip安装相关模块',
  '权限不足': '权限不足，可能需要管理员权限执行',
  '网络错误': '网络连接失败，请检查网络连接后重试',
  '安装失败': '安装过程中出现错误，请查看详细日志'
};

// 统一错误处理工具
function handleError(context: ErrorContext): string {
  const { operation, item, command, originalError } = context;
  
  // 记录详细错误日志
  console.error(`[${operation}] 操作失败:`, {
    item,
    command,
    error: originalError
  });

  // 根据错误类型返回用户友好消息
  const errorStr = String(originalError || '');
  
  for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorStr.includes(pattern) || errorStr.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }

  // 默认错误消息
  const baseMessage = item ? `${operation} ${item}` : operation;
  return `${baseMessage}失败，请检查系统环境或查看详细日志`;
}

// 用户消息显示工具
function showUserMessage(type: 'success' | 'error' | 'warning' | 'info', message: string) {
  switch (type) {
    case 'success':
      ElMessage.success(message);
      break;
    case 'error':
      ElMessage.error(message);
      break;
    case 'warning':
      ElMessage.warning(message);
      break;
    case 'info':
      ElMessage.info(message);
      break;
  }
}

// 工具函数
function isErrorOutput(output: string): { isError: boolean; errorType?: string } {
  const errorPatterns = [
    { pattern: '未安装', type: '未安装' },
    { pattern: '无设备连接', type: '无设备连接' },
    { pattern: 'command not found', type: '命令未找到' },
    { pattern: '不是内部或外部命令', type: '命令未找到' },
    { pattern: 'No module named', type: '模块未安装' },
    { pattern: '模块未安装', type: '模块未安装' }
  ];

  for (const { pattern, type } of errorPatterns) {
    if (output.includes(pattern)) {
      return { isError: true, errorType: type };
    }
  }
  return { isError: false };
}

function extractVersion(output: string): string {
  const versionMatch = output.match(/\d+\.\d+\.\d+|\d+\.\d+/);
  return versionMatch ? versionMatch[0] : '已安装';
}

function parseIosDeviceConnection(output: string): { status: EnvironmentStatus; version: string } {
  const deviceIds = output
    .split('\n')
    .filter(line => line.trim().length > 0 && !line.includes('无设备连接'));

  if (deviceIds.length > 0) {
    return { status: 'success', version: `${deviceIds.length}个设备已连接` };
  } else {
    return { status: 'error', version: '无设备连接' };
  }
}

function parseCommandOutput(item: EnvironmentItem, output: string): { status: EnvironmentStatus; version?: string } {
  const trimmedOutput = output.trim();

  const errorCheck = isErrorOutput(trimmedOutput);
  if (errorCheck.isError) {
    return { 
      status: 'error', 
      version: errorCheck.errorType === '无设备连接' ? '无设备连接' : 
               errorCheck.errorType === '模块未安装' ? '模块未安装' : undefined
    };
  }

  if (trimmedOutput) {
    if (item.key === 'ios-device-connection') {
      return parseIosDeviceConnection(trimmedOutput);
    }
    return { status: 'success', version: extractVersion(trimmedOutput) };
  }

  return { status: 'error' };
}

// 检测单个环境
async function checkEnvironment(item: EnvironmentItem) {
  if (item.status === 'unsupported') return;
  
  item.checking = true;
  item.status = 'unknown';
  item.version = undefined;

  try {
    const result = await (window as any).cmdAPI.exec(item.checkCommand);
    
    if (result.success) {
      const output = result.stdout || result.stderr || '';
      const parseResult = parseCommandOutput(item, output);
      
      item.status = parseResult.status;
      if (parseResult.version) {
        item.version = parseResult.version;
      }
    } else {
      item.status = 'error';
    }
  } catch (error) {
    item.status = 'error';
    handleError({
      operation: '检测',
      item: item.name,
      command: item.checkCommand,
      originalError: error
    });
  } finally {
    item.checking = false;
  }
}

// 批量并行检测环境
async function checkAllEnvironments() {
  showUserMessage('info', '开始检测环境...');

  try {
    const batchSize = 4;
    const batches = [];
    
    for (let i = 0; i < environmentItems.length; i += batchSize) {
      const batch = environmentItems.slice(i, i + batchSize);
      batches.push(batch);
    }

    for (const batch of batches) {
      const promises = batch.map(item => checkEnvironment(item));
      await Promise.all(promises);
    }

    showUserMessage('success', '环境检测完成');
  } catch (error) {
    const errorMessage = handleError({
      operation: '批量环境检测',
      originalError: error
    });
    showUserMessage('error', errorMessage);
  }
}

// 安装环境
async function installEnvironment(item: EnvironmentItem) {
  // 跳过不支持的环境项
  if (item.status === 'unsupported') {
    ElMessage.warning('此环境在当前平台不受支持');
    return;
  }

  const result = await ElMessageBox.confirm(`确定要安装 ${item.name} 吗？这可能需要一些时间。`, '确认安装', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).catch(() => false);

  if (!result) return;

  // 初始化安装进度对话框
  installDialog.value = {
    visible: true,
    title: `安装 ${item.name}`,
    currentStep: 0,
    totalSteps: item.installCommands.length,
    currentCommand: '',
    logs: []
  };

  item.installing = true;

  try {
    for (let i = 0; i < item.installCommands.length; i++) {
      const command = item.installCommands[i];

      // 更新当前命令和步骤
      installDialog.value.currentCommand = command;
      installDialog.value.currentStep = i;

      // 添加日志条目
      const logEntry = {
        command,
        status: 'running' as 'running' | 'success' | 'error',
        output: '',
        error: ''
      };
      installDialog.value.logs.push(logEntry);

      try {
        const result = await (window as any).cmdAPI.exec(command);

        if (result.success) {
          // 命令执行成功
          logEntry.status = 'success';
          logEntry.output = result.stdout || '执行成功';
        } else {
          // 命令执行失败
          logEntry.status = 'error';
          logEntry.error = result.stderr || result.error || '执行失败';
          throw new Error(`命令执行失败: ${result.stderr || result.error}`);
        }
      } catch (error) {
        logEntry.status = 'error';
        logEntry.error = String(error);
        throw error;
      }
    }

    // 所有命令执行完成
    installDialog.value.currentStep = item.installCommands.length;
    installDialog.value.currentCommand = '';

    ElMessage.success(`${item.name} 安装完成`);

    // 重新检测
    setTimeout(() => {
      checkEnvironment(item);
    }, 1000);
  } catch (error) {
    const errorMessage = handleError({
      operation: '安装',
      item: item.name,
      originalError: error
    });
    showUserMessage('error', errorMessage);

    // 安装失败时，显示失败状态但不自动关闭对话框
    installDialog.value.currentCommand = '安装失败';
  } finally {
    item.installing = false;
  }
}

// 执行命令
async function executeCommand(command: string) {
  executingCommand.value = command;
  commandResult.value = {
    command,
    success: null,
    stdout: '正在执行命令，请稍候...',
    stderr: '',
    error: ''
  };

  scrollToResult();

  try {
    const result = await (window as any).cmdAPI.exec(command);
    commandResult.value = {
      command,
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error
    };

    if (result.success) {
      ElMessage.success('命令执行成功');
    } else {
      ElMessage.error('命令执行失败');
    }
  } catch (error) {
    commandResult.value = {
      command,
      success: false,
      stdout: '',
      stderr: '',
      error: `执行命令失败: ${error}`
    };
    ElMessage.error(`执行命令失败: ${error}`);
  } finally {
    executingCommand.value = '';
  }
}

// 滚动到执行结果区域
function scrollToResult() {
  nextTick(() => {
    if (resultCardRef.value?.$el) {
      resultCardRef.value.$el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
}

// 复制命令
async function copyCommand(command: string) {
  try {
    await (window as any).clipboardAPI.writeText(command);
    ElMessage.success('命令已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
}

// 清空结果
function clearResult() {
  commandResult.value = null;
}

// 格式化步骤文本，将URL转换为可点击的链接
function formatStepWithLinks(step: string): string {
  // URL正则表达式
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // 替换URL为可点击的链接
  return step.replace(urlRegex, '<a href="$1" target="_blank" class="step-link">$1</a>');
}

// 打开系统终端
async function openSystemTerminal() {
  try {
    const platform = systemInfo.value.platform;
    const command = platform === 'darwin' ? 'open -a Terminal' : platform === 'win32' ? 'start cmd' : 'gnome-terminal';

    await (window as any).cmdAPI.exec(command);
    ElMessage.success('已打开系统终端');
  } catch (error) {
    ElMessage.error('打开终端失败');
  }
}

// 页面加载时初始化系统信息和检测环境
onMounted(async () => {
  await initializeSystem();
  checkAllEnvironments();
});
</script>

<style scoped lang="scss">
.environment-setup {
  padding: 16px;
}

.setup-header {
  margin-bottom: 16px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-info {
      h2 {
        margin: 0 0 8px 0;
        color: #303133;
        font-size: 20px;
      }

      p {
        margin: 0 0 8px 0;
        color: #606266;
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;

      :deep(.el-button) {
        width: 100px;
      }
    }
  }
}

.setup-content {
  display: grid;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;

  :deep(.el-button) {
    width: 100px;
  }
}

// 状态卡片
.status-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }

  &.status-checking {
    border-color: #409eff;
    background-color: #f0f8ff;
  }

  .status-icon {
    flex-shrink: 0;

    .loading-icon {
      color: #409eff;
      animation: rotating 2s linear infinite;
    }

    .success-icon {
      color: #67c23a;
    }

    .error-icon {
      color: #f56c6c;
    }

    .unsupported-icon {
      color: #909399;
    }

    .warning-icon {
      color: #e6a23c;
    }
  }

  .status-info {
    flex: 1;

    .name {
      font-weight: 600;
      color: #303133;
      margin-bottom: 2px;
    }

    .version {
      font-size: 12px;
      color: #67c23a;
      margin-left: 8px;
      min-width: 40px;
    }

    .description {
      font-size: 13px;
      color: #606266;
    }
  }

  .status-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    min-width: 100px;

    :deep(.el-button) {
      width: 100px;
      text-align: center;
    }
  }
}

// 指南卡片
.guide-card {
  :deep(.el-card__body) {
    padding: 16px;
  }

  :deep(.el-collapse-item__header) {
    font-weight: 600;
  }
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 16px;

  h4 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 14px;
  }

  .guide-check {
    padding: 12px;
    background-color: #f0f9ff;
    border-radius: 6px;
    border-left: 4px solid #67c23a;
    margin-bottom: 10px;

    h4 {
      margin: 0 0 8px 0 !important;
      color: #67c23a;
      font-weight: 600;
    }

    .command-item {
      margin-bottom: 0;

      .command-input {
        :deep(.el-input__inner) {
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        :deep(.el-input-group__append) {
          .el-button {
            width: auto;
            min-width: 60px;
            margin-left: 0;

            &:not(:last-child) {
              margin-right: 8px;
            }
          }
        }
      }
    }
  }

  .guide-steps {
    ol {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;
        color: #606266;
        line-height: 1.5;

        &.install-step {
          white-space: pre-line;

          :deep(.step-link) {
            color: #409eff;
            text-decoration: none;
            transition: color 0.3s ease;

            &:hover {
              color: #66b1ff;
              text-decoration: underline;
            }

            &:visited {
              color: #409eff;
            }
          }
        }
      }
    }
  }

  .guide-commands {
    .command-item {
      margin-bottom: 8px;

      .command-input {
        :deep(.el-input__inner) {
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        :deep(.el-input-group__append) {
          .el-button {
            width: auto;
            min-width: 60px;
            margin-left: 0;

            &:not(:last-child) {
              margin-right: 8px;
            }
          }
        }
      }
    }
  }

  .guide-notes {
    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;
        color: #e6a23c;
        line-height: 1.5;
      }
    }
  }
}

.result-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .result-command,
  .result-status {
    font-size: 14px;

    strong {
      color: #303133;
    }
  }

  .result-output,
  .result-error {
    strong {
      color: #303133;
    }

    pre {
      margin: 8px 0 0 0;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      overflow-x: auto;
    }
  }

  .result-error pre {
    background-color: #fef0f0;
    color: #f56c6c;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 安装进度对话框样式
.install-progress {
  .progress-header {
    margin-bottom: 20px;

    .progress-info {
      margin-bottom: 12px;

      span {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #303133;
      }
    }

    .current-command {
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      border-left: 4px solid #409eff;

      strong {
        color: #303133;
        margin-right: 8px;
      }

      code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #409eff;
        background-color: transparent;
      }
    }
  }

  .progress-logs {
    h4 {
      margin: 0 0 12px 0;
      color: #303133;
      font-size: 14px;
      font-weight: 600;
    }

    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background-color: #fafafa;
    }

    .log-item {
      padding: 8px 12px;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }

      &.log-running {
        background-color: #ecf5ff;
        border-left: 4px solid #409eff;
      }

      &.log-success {
        background-color: #f0f9ff;
        border-left: 4px solid #67c23a;
      }

      &.log-error {
        background-color: #fef0f0;
        border-left: 4px solid #f56c6c;
      }

      .log-command {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .loading-icon {
          color: #409eff;
          animation: rotating 2s linear infinite;
        }

        .success-icon {
          color: #67c23a;
        }

        .error-icon {
          color: #f56c6c;
        }

        code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #303133;
          background-color: transparent;
          padding: 0;
        }
      }

      .log-output,
      .log-error {
        margin-top: 8px;

        pre {
          margin: 0;
          padding: 8px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }

      .log-error pre {
        background-color: rgba(245, 108, 108, 0.1);
        color: #f56c6c;
      }
    }
  }
}

// 工具类
.mr-1 {
  margin-right: 4px;
}

// 响应式设计
@media (max-width: 900px) {
  .environment-setup {
    padding: 12px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .status-item {
    .status-actions {
      flex-direction: row;
      gap: 8px;

      :deep(.el-button) {
        width: 100px;
        flex-shrink: 0;
      }
    }
  }

  .install-progress {
    .log-container {
      max-height: 200px;
    }

    .current-command {
      code {
        font-size: 12px;
        word-break: break-all;
      }
    }
  }
}
</style>
