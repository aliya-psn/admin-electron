<template>
    <div class="environment-setup">
        <div class="setup-header">
            <el-card>
                <div class="header-content">
                    <div class="header-info">
                        <h2>自动化测试环境配置</h2>
                        <p>引导您安装和配置Python、Appium等自动化测试必需的环境</p>
                        <div class="system-info">
                            <el-tag v-if="systemInfo.platform" :type="getSystemTagType() as any">
                                <el-icon class="mr-1">
                                    <Monitor />
                                </el-icon>
                                {{ getSystemDisplayName() }}
                            </el-tag>
                        </div>
                    </div>
                    <div class="header-actions">
                        <el-button type="primary" @click="checkAllEnvironments">
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
                    <div v-for="item in environmentItems" :key="item.name" class="status-item"
                        :class="{ 'status-checking': item.checking }">
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
                            <el-icon v-else class="warning-icon">
                                <QuestionFilled />
                            </el-icon>
                        </div>
                        <div class="status-info">
                            <div class="name">{{ item.name }}</div>
                            <div class="version" v-if="item.version">{{ item.version }}</div>
                            <div class="description">{{ item.description }}</div>
                        </div>
                        <div class="status-actions">
                            <el-button size="small" :type="item.status === 'success' ? 'success' : 'primary'"
                                @click="item.status === 'success' ? checkEnvironment(item) : installEnvironment(item)"
                                :loading="item.installing || item.checking" :disabled="item.checking">
                                {{ getActionButtonText(item) }}
                            </el-button>
                            <el-button size="small" @click="checkEnvironment(item)" :loading="item.checking"
                                :disabled="item.installing">
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
                    <el-collapse-item v-for="item in environmentItems" :key="item.key" :title="item.name"
                        :name="item.key">
                        <div class="guide-content">
                            <div class="guide-steps">
                                <h4>安装步骤：</h4>
                                <ol>
                                    <li v-for="step in item.installSteps" :key="step">{{ step }}</li>
                                </ol>
                            </div>
                            <div class="guide-commands" v-if="item.installCommands.length">
                                <h4>安装命令：</h4>
                                <div v-for="cmd in item.installCommands" :key="cmd" class="command-item">
                                    <el-input readonly :value="cmd" class="command-input">
                                        <template #append>
                                            <el-button @click="copyCommand(cmd)">复制</el-button>
                                            <el-button type="primary" @click="executeCommand(cmd)"
                                                :loading="cmd === executingCommand">
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
            <el-card class="result-card" v-if="commandResult">
                <template #header>
                    <div class="card-header">
                        <span>执行结果</span>
                        <el-button size="small" @click="clearResult">清空</el-button>
                    </div>
                </template>
                <div class="result-content">
                    <div class="result-command">
                        <strong>命令：</strong>{{ commandResult.command }}
                    </div>
                    <div class="result-status">
                        <strong>状态：</strong>
                        <el-tag :type="commandResult.success ? 'success' : 'danger'">
                            {{ commandResult.success ? '成功' : '失败' }}
                        </el-tag>
                    </div>
                    <div class="result-output" v-if="commandResult.stdout">
                        <strong>输出：</strong>
                        <pre>{{ commandResult.stdout }}</pre>
                    </div>
                    <div class="result-error" v-if="commandResult.stderr">
                        <strong>错误：</strong>
                        <pre>{{ commandResult.stderr }}</pre>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    Refresh,
    Monitor,
    Loading,
    SuccessFilled,
    CloseBold,
    QuestionFilled
} from '@element-plus/icons-vue';

// 使用类型断言避免与现有类型冲突

interface EnvironmentItem {
    key: string;
    name: string;
    description: string;
    checkCommand: string;
    installCommands: string[];
    installSteps: string[];
    notes?: string[];
    status: 'success' | 'error' | 'unknown';
    version?: string;
    checking: boolean;
    installing: boolean;
}

const activeGuides = ref<string[]>([]);
const executingCommand = ref<string>('');
const commandResult = ref<any>(null);
const systemInfo = ref<any>({});

// 根据操作系统生成环境配置
function generateEnvironmentItems(platform: string): EnvironmentItem[] {
    const isWindows = platform === 'win32';
    const isMac = platform === 'darwin';

    return [
        {
            key: 'python',
            name: 'Python',
            description: 'Python编程语言环境',
            checkCommand: isMac ? 'python3 --version' : 'python --version',
            installCommands: isWindows ? [
                'winget install Python.Python.3.11',
                'python -m pip install --upgrade pip'
            ] : isMac ? [
                'brew install python@3.11',
                'python3 -m pip install --upgrade pip'
            ] : [
                'sudo apt update',
                'sudo apt install python3 python3-pip',
                'python3 -m pip install --upgrade pip'
            ],
            installSteps: isWindows ? [
                '从官网下载Python 3.11或更高版本',
                '运行安装程序，确保勾选"Add Python to PATH"',
                '验证安装：打开命令提示符输入 python --version',
                '更新pip到最新版本'
            ] : isMac ? [
                '确保已安装Homebrew (https://brew.sh)',
                '运行 brew install python@3.11',
                '验证安装：python3 --version',
                '更新pip到最新版本'
            ] : [
                '更新系统包管理器',
                '安装Python3和pip',
                '验证安装：python3 --version',
                '更新pip到最新版本'
            ],
            notes: isWindows ? [
                '推荐安装Python 3.11或更高版本',
                '安装时必须勾选"Add Python to PATH"选项',
                '如果已安装但检测失败，请检查环境变量配置'
            ] : isMac ? [
                '推荐使用Homebrew安装Python',
                '确保PATH环境变量包含Python路径',
                'macOS自带Python2，建议安装Python3'
            ] : [
                '推荐安装Python 3.11或更高版本',
                '确保python3和pip3命令可用',
                '可能需要配置别名或符号链接'
            ],
            status: 'unknown',
            checking: false,
            installing: false
        },
        {
            key: 'pip',
            name: 'Pip',
            description: 'Python包管理工具',
            checkCommand: isMac ? 'pip3 --version' : 'pip --version',
            installCommands: isWindows ? [
                'python -m ensurepip --upgrade',
                'python -m pip install --upgrade pip'
            ] : [
                'python3 -m ensurepip --upgrade',
                'python3 -m pip install --upgrade pip'
            ],
            installSteps: [
                'Pip通常随Python一起安装',
                '如果没有pip，可以使用 python -m ensurepip 安装',
                '更新到最新版本'
            ],
            status: 'unknown',
            checking: false,
            installing: false
        },
        {
            key: 'nodejs',
            name: 'Node.js',
            description: 'JavaScript运行环境',
            checkCommand: 'node --version',
            installCommands: isWindows ? [
                'winget install OpenJS.NodeJS'
            ] : isMac ? [
                'brew install node'
            ] : [
                'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -',
                'sudo apt-get install -y nodejs'
            ],
            installSteps: isWindows ? [
                '从官网下载Node.js LTS版本',
                '运行安装程序，使用默认设置',
                '验证安装：node --version 和 npm --version'
            ] : isMac ? [
                '使用Homebrew安装：brew install node',
                '验证安装：node --version 和 npm --version'
            ] : [
                '添加NodeSource存储库',
                '安装Node.js LTS版本',
                '验证安装：node --version 和 npm --version'
            ],
            notes: [
                '推荐安装LTS长期支持版本',
                'npm会随Node.js一起安装'
            ],
            status: 'unknown',
            checking: false,
            installing: false
        },
        {
            key: 'appium',
            name: 'Appium',
            description: '跨平台移动应用自动化测试工具',
            checkCommand: 'appium --version',
            installCommands: [
                'npm install -g appium',
                'appium driver install uiautomator2'
            ],
            installSteps: [
                '确保已安装Node.js和npm',
                '全局安装Appium：npm install -g appium',
                '安装UiAutomator2驱动',
                '验证安装：appium --version'
            ],
            notes: [
                '需要先安装Node.js',
                '建议安装UiAutomator2驱动用于Android测试'
            ],
            status: 'unknown',
            checking: false,
            installing: false
        },
        {
            key: 'appium-python-client',
            name: 'Appium Python Client',
            description: 'Appium的Python客户端库',
            checkCommand: isMac ? 'python3 -c "import appium; print(appium.__version__)"' : 'python -c "import appium; print(appium.__version__)"',
            installCommands: isMac ? [
                'pip3 install Appium-Python-Client',
                'pip3 install selenium'
            ] : [
                'pip install Appium-Python-Client',
                'pip install selenium'
            ],
            installSteps: [
                '确保已安装Python和pip',
                '安装Appium Python客户端',
                '安装Selenium库',
                '验证安装'
            ],
            status: 'unknown',
            checking: false,
            installing: false
        },
        {
            key: 'adb',
            name: 'Android Debug Bridge (ADB)',
            description: 'Android调试桥工具',
            checkCommand: 'adb version',
            installCommands: isWindows ? [
                'winget install Google.PlatformTools'
            ] : isMac ? [
                'brew install android-platform-tools'
            ] : [
                'sudo apt update',
                'sudo apt install android-tools-adb'
            ],
            installSteps: isWindows ? [
                '下载Android SDK Platform Tools',
                '解压到合适的目录',
                '将目录添加到系统PATH环境变量',
                '验证安装：adb version'
            ] : isMac ? [
                '使用Homebrew安装：brew install android-platform-tools',
                '验证安装：adb version'
            ] : [
                '更新包管理器',
                '安装android-tools-adb包',
                '验证安装：adb version'
            ],
            notes: isWindows ? [
                '可以单独安装platform-tools或完整的Android Studio',
                '确保将ADB路径添加到环境变量中'
            ] : [
                '推荐使用包管理器安装ADB',
                '确保命令行可以直接使用adb命令'
            ],
            status: 'unknown',
            checking: false,
            installing: false
        },
        {
            key: 'java',
            name: 'Java JDK',
            description: 'Java开发工具包',
            checkCommand: 'java -version',
            installCommands: isWindows ? [
                'winget install Oracle.JDK.17'
            ] : isMac ? [
                'brew install openjdk@17'
            ] : [
                'sudo apt update',
                'sudo apt install openjdk-17-jdk'
            ],
            installSteps: isWindows ? [
                '下载并安装JDK 17或更高版本',
                '配置JAVA_HOME环境变量',
                '将%JAVA_HOME%\\bin添加到PATH',
                '验证安装：java -version'
            ] : isMac ? [
                '使用Homebrew安装：brew install openjdk@17',
                '配置JAVA_HOME环境变量',
                '验证安装：java -version'
            ] : [
                '更新包管理器',
                '安装OpenJDK 17',
                '配置JAVA_HOME环境变量',
                '验证安装：java -version'
            ],
            notes: [
                '推荐安装JDK 11或17 LTS版本',
                '正确配置JAVA_HOME环境变量很重要'
            ],
            status: 'unknown',
            checking: false,
            installing: false
        }
    ];
}

const environmentItems = reactive<EnvironmentItem[]>([]);

const overallStatus = computed(() => {
    const successCount = environmentItems.filter(item => item.status === 'success').length;
    const totalCount = environmentItems.length;

    if (successCount === totalCount) {
        return { type: 'success', text: '环境完整' };
    } else if (successCount > 0) {
        return { type: 'warning', text: `部分完成 (${successCount}/${totalCount})` };
    } else {
        return { type: 'danger', text: '未配置' };
    }
});

// 获取操作按钮文本
function getActionButtonText(item: EnvironmentItem): string {
    if (item.installing) return '安装中...';
    if (item.checking) return '检测中...';
    if (item.status === 'success') return '已安装';
    return '安装';
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
    if (platform === 'linux') return 'Linux';
    return '未知系统';
}

// 获取系统信息并初始化环境项
async function initializeSystem() {
    try {
        const result = await (window as any).systemAPI.getAll();
        if (result.success) {
            systemInfo.value = result.data;
            // 根据操作系统重新生成环境配置
            const newItems = generateEnvironmentItems(result.data.platform);
            environmentItems.splice(0, environmentItems.length, ...newItems);
        }
    } catch (error) {
        console.error('获取系统信息失败:', error);
        // 使用默认配置（Windows）
        const defaultItems = generateEnvironmentItems('win32');
        environmentItems.splice(0, environmentItems.length, ...defaultItems);
    }
}

// 检测单个环境
async function checkEnvironment(item: EnvironmentItem) {
    item.checking = true;
    item.status = 'unknown';
    item.version = undefined;

    try {
        const result = await (window as any).cmdAPI.exec(item.checkCommand);

        if (result.success && result.stdout) {
            item.status = 'success';
            // 提取版本信息
            const versionMatch = result.stdout.match(/\d+\.\d+\.\d+|\d+\.\d+/);
            if (versionMatch) {
                item.version = versionMatch[0];
            }
        } else {
            item.status = 'error';
        }
    } catch (error) {
        item.status = 'error';
        console.error(`检测 ${item.name} 失败:`, error);
    } finally {
        item.checking = false;
    }
}

// 检测所有环境
async function checkAllEnvironments() {
    ElMessage.info('开始检测环境...');

    for (const item of environmentItems) {
        await checkEnvironment(item);
    }

    ElMessage.success('环境检测完成');
}

// 安装环境
async function installEnvironment(item: EnvironmentItem) {
    const result = await ElMessageBox.confirm(
        `确定要安装 ${item.name} 吗？这可能需要一些时间。`,
        '确认安装',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).catch(() => false);

    if (!result) return;

    item.installing = true;

    try {
        for (const command of item.installCommands) {
            ElMessage.info(`正在执行: ${command}`);
            const result = await (window as any).cmdAPI.exec(command);

            if (!result.success) {
                throw new Error(`命令执行失败: ${result.stderr || result.error}`);
            }
        }

        ElMessage.success(`${item.name} 安装完成`);

        // 重新检测
        setTimeout(() => {
            checkEnvironment(item);
        }, 1000);

    } catch (error) {
        ElMessage.error(`${item.name} 安装失败: ${error}`);
    } finally {
        item.installing = false;
    }
}

// 执行命令
async function executeCommand(command: string) {
    executingCommand.value = command;

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
        ElMessage.error(`执行命令失败: ${error}`);
    } finally {
        executingCommand.value = '';
    }
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

// 打开系统终端
async function openSystemTerminal() {
    try {
        const platform = systemInfo.value.platform;
        const command = platform === 'darwin' ? 'open -a Terminal' :
            platform === 'win32' ? 'start cmd' :
                'gnome-terminal';

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

            .system-info {
                margin-top: 8px;
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
            margin-bottom: 4px;
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

    .guide-steps {
        ol {
            margin: 0;
            padding-left: 20px;

            li {
                margin-bottom: 4px;
                color: #606266;
                line-height: 1.5;
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
}
</style>