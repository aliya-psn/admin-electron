<template>
  <div class="explore-task-config">
    <el-card class="main-card">
      <el-steps :active="1" finish-status="success" align-center>
        <el-step title="创建任务" />
        <el-step title="执行测试" />
        <el-step title="查看报告" />
      </el-steps>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="task-form">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" maxlength="80" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" maxlength="80" placeholder="请输入任务备注信息" />
        </el-form-item>
        <el-form-item label="测试设备" prop="device">
          <el-select v-model="form.device" placeholder="请选择测试设备">
            <el-option v-for="item in deviceList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择应用" prop="app">
          <el-select v-model="form.app" placeholder="请选择应用">
            <el-option v-for="item in appList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-button type="primary" text @click="installApp">安装新的应用</el-button>
        </el-form-item>
        <el-divider>应用探索测试</el-divider>
        <el-form-item label="测试时长" prop="duration">
          <el-radio-group v-model="form.duration">
            <el-radio v-for="item in durationOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
          <el-input
            v-if="form.duration === 'custom'"
            v-model.number="form.customDuration"
            type="number"
            min="1"
            max="1440"
            style="width: 100px; margin-left: 8px"
            suffix="分钟"
          />
        </el-form-item>
        <el-form-item label="模型选择" prop="model">
          <el-select v-model="form.model" placeholder="请选择模型">
            <el-option v-for="item in modelList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="截屏间隔" prop="interval">
          <el-radio-group v-model="form.interval">
            <el-radio v-for="item in intervalOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
          <el-input
            v-if="form.interval === 'custom'"
            v-model.number="form.customInterval"
            type="number"
            min="1"
            max="60"
            style="width: 100px; margin-left: 8px"
            suffix="秒"
          />
        </el-form-item>
        <el-form-item label="归档包名" prop="archiveName">
          <el-input v-model="form.archiveName" maxlength="100" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">创建任务</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="side-info">
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
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

// mock 数据
const deviceList = [
  { id: 'dev1', name: '22M0****133g(HUAWEI Mate X5)', model: 'ALT-AL10', apiLevel: '12', cpu: 'baltimore' },
  { id: 'dev2', name: '22M0****999x(HUAWEI P60)', model: 'MNA-AL00', apiLevel: '12', cpu: 'baltimore' }
];
const appList = [
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
];
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

function generateTaskName() {
  const now = new Date();
  return `Task-${now.getMonth() + 1}${now.getDate()}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
}

function generateArchiveName() {
  const app = appList.find(a => a.id === form.value.app);
  return app ? `${app.package}_${app.version}_Task-${generateTaskName()}_graph.zip` : '';
}

watch(
  () => form.value.app,
  _val => {
    form.value.archiveName = generateArchiveName();
  }
);

const selectedApp = computed(() => appList.find(a => a.id === form.value.app));
const selectedDevice = computed(() => deviceList.find(d => d.id === form.value.device));

function installApp() {
  ElMessage.info('安装新应用功能暂未实现');
}

const router = useRouter();

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('任务创建成功（mock）');
      router.push('/explore-task/execute');
    }
  });
}
</script>

<style scoped>
.explore-task-config {
  display: flex;
  flex-direction: row;
  gap: 24px;
}
.main-card {
  flex: 2;
}
.side-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-card {
  margin-bottom: 8px;
}
.task-form {
  margin-top: 24px;
  max-width: 600px;
}
</style>
