<script setup lang="ts">
import { Search, Refresh, CirclePlus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, onMounted, watch } from 'vue';
import { projectApi } from '@/api/project';
import { userApi } from '@/api/user';
import * as Project from '@/api/types/project';
import Pagination from '@/components/Pagination/index.vue';
import { type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

const totalCount = ref(0);
const list = ref(Array<Project.ProjectModel>());
const listLoading = ref(false);
const listQuery = reactive<Project.ProjectParams>({
  pageNum: 1,
  pageSize: 10,
  user: userStore.userId?.toString() || '',
  projectName: ''
});

enum DialogStatus {
  create = 'create',
  update = 'update'
}
const textMap: Record<string, string> = {
  update: '编辑',
  create: '新建项目'
};
const dialogStatus = ref(DialogStatus.create);
const dialogFormVisible = ref(false);

const tempProject = reactive<Project.ProjectModel>({
  id: '',
  projectName: '',
  projectDesc: '',
  projectMember: '',
  projectMemberArr: []
});
const value = ref(false);
const loading = ref(false);

const createFormRef = ref<FormInstance | null>(null);
const formRules: FormRules = {
  id: [{ required: true, message: '请输入项目ID', trigger: 'blur' }],
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectDesc: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
  projectMemberArr: [{ required: true, message: '请选择项目成员', trigger: 'change' }]
};

onMounted(() => {
  getList();
  getUserList();
});

// 用户列表展示
const options = ref<Array<{ key: number; label: string }>>([]);

const leftDefaultChecked = ref<number[]>([]);
const rightDefaultChecked = ref<number[]>([]);

const getUserList = () => {
  const param = {
    pageNum: 1,
    pageSize: 1000
  };
  userApi.getUserList(param).then(resp => {
    if (resp.data.userList && resp.data.userList.length > 0) {
      options.value = resp.data.userList.map(user => ({
        key: Number(user.userId),
        label: user.nickname
      }));
    }
  });
};

// 监听tempProject.projectMemberArr变化，更新rightDefaultChecked
watch(
  () => dialogFormVisible.value,
  newVal => {
    if (newVal && dialogStatus.value === DialogStatus.update) {
      // 确保projectMemberArr中的值是数字类型
      if (tempProject.projectMemberArr) {
        rightDefaultChecked.value = tempProject.projectMemberArr.map(id => Number(id));
      }
    } else {
      rightDefaultChecked.value = [];
    }
  }
);

// Fetch project list
const getList = async () => {
  listLoading.value = true;
  const res = await projectApi.getProjectListWithPage(listQuery);
  const { data } = res;
  listLoading.value = false;
  list.value = data.projectList.map(project => ({
    ...project,
    projectMemberArr: project.projectMember ? JSON.parse(project.projectMember).map(Number) : []
  }));
  totalCount.value = data.totalNum;
};

const handleChangePage = ({ page, limit }: { page: number; limit: number }) => {
  listQuery.pageNum = page;
  listQuery.pageSize = limit;
  getList();
};

// Handle reset
const handleReset = () => {
  Object.assign(listQuery, {
    pageNum: 1,
    pageSize: 10,
    projectName: ''
  });
  getList();
};

const getIndex = ($index: number) => {
  return (listQuery.pageNum - 1) * listQuery.pageSize + $index + 1;
};

const showCreate = () => {
  Object.assign(tempProject, {
    id: '',
    projectName: '',
    projectDesc: '',
    projectMember: '',
    projectMemberArr: []
  });
  rightDefaultChecked.value = [];
  dialogStatus.value = DialogStatus.create;
  dialogFormVisible.value = true;
};

const showUpdate = ($index: number) => {
  const project = list.value[$index];

  tempProject.id = project.id;
  tempProject.projectName = project.projectName;
  tempProject.projectDesc = project.projectDesc;
  tempProject.projectMember = project.projectMember;
  if (project.projectMemberArr) {
    tempProject.projectMemberArr = project.projectMemberArr.map(Number) || [];

    // 设置右侧默认选中的项
    rightDefaultChecked.value = tempProject.projectMemberArr.map(Number);
  }

  dialogStatus.value = DialogStatus.update;
  dialogFormVisible.value = true;
};

// Create project
const createProject = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate();

  loading.value = true;
  tempProject.projectMember = JSON.stringify(tempProject.projectMemberArr);
  try {
    await projectApi.postAddProject(tempProject);
    getList();
    dialogFormVisible.value = false;
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

// Update project
const updateProject = async () => {
  if (!createFormRef.value) return;
  await createFormRef.value.validate();

  loading.value = true;
  tempProject.projectMember = JSON.stringify(tempProject.projectMemberArr);
  try {
    await projectApi.updateProject(tempProject);
    getList();
    dialogFormVisible.value = false;
    loading.value = false;
  } catch (err) {
    loading.value = false;
  }
};

const removeProject = ($index: number) => {
  const project = list.value[$index];
  ElMessageBox.confirm(`确认删除项目"${project.projectName}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      projectApi.deleteProject(project.id).then(() => {
        ElMessage.success('删除成功');
        getList();
      });
    })
    .catch(() => {});
};
</script>

<template>
  <div class="project-view">
    <div class="filter-container">
      <div>
        <el-button type="primary" plain :icon="CirclePlus" @click="showCreate"> 新建项目 </el-button>
      </div>
      <el-form ref="queryForm" :inline="true">
        <div class="search">
          <el-form-item prop="projectName" label="项目名称：">
            <el-input class="search-item" v-model="listQuery.projectName" placeholder="请输入项目名称搜索" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" plain :icon="Search" @click="getList"> 查询 </el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <el-table :data="list" v-loading="listLoading" fit highlight-current-row height="calc(100vh - 210px)">
      <el-table-column align="" label="序号" width="80">
        <template #default="scope">
          <span v-text="getIndex(scope.$index)" />
        </template>
      </el-table-column>
      <el-table-column align="" label="项目ID" prop="id" min-width="100" />
      <el-table-column align="" label="项目名称" prop="projectName" min-width="230" />
      <el-table-column align="" label="描述" prop="projectDesc" min-width="260" />
      <el-table-column align="" label="项目成员" prop="projectMemberArr" width="100">
        <template #default="scope">
          <span class="item-member">{{ scope.row.projectMemberArr && scope.row.projectMemberArr.length }}</span>
        </template>
      </el-table-column>
      <el-table-column align="" label="创建人" prop="createUser" width="100" />
      <!-- <el-table-column align="" label="更新人" prop="updateUser" width="100"></el-table-column>
      <el-table-column align="" label="创建时间" prop="createTime" width="180"></el-table-column> -->
      <el-table-column align="" label="更新时间" prop="updateTime" width="180" />

      <el-table-column align="" label="操作" width="140" fixed="right">
        <template #default="scope">
          <el-button type="primary" plain size="small" @click="showUpdate(scope.$index)">编 辑</el-button>
          <el-button type="danger" plain size="small" @click="removeProject(scope.$index)">删 除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" :image-size="120" />
      </template>
    </el-table>

    <pagination
      v-show="totalCount > 0"
      :total="totalCount"
      v-model:page="listQuery.pageNum"
      v-model:limit="listQuery.pageSize"
      layout="total, prev, pager, next"
      :hide-on-single-page="value"
      @pagination="handleChangePage"
    />

    <el-dialog :title="textMap[dialogStatus]" v-model="dialogFormVisible" width="750px">
      <el-form ref="createFormRef" :rules="formRules" :model="tempProject" label-position="left" label-width="120px">
        <el-form-item label="项目ID" required prop="id">
          <el-input
            type="text"
            v-model="tempProject.id"
            placeholder="请输入项目ID"
            :disabled="dialogStatus === DialogStatus.update"
          />
        </el-form-item>
        <el-form-item label="项目名称" required prop="projectName">
          <el-input
            type="text"
            v-model="tempProject.projectName"
            maxlength="50"
            show-word-limit
            clearable
            placeholder="请输入项目名称"
          />
        </el-form-item>
        <el-form-item label="项目描述" required prop="projectDesc">
          <el-input
            type="textarea"
            :rows="2"
            v-model="tempProject.projectDesc"
            maxlength="200"
            show-word-limit
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="项目成员" required prop="projectMemberArr">
          <el-transfer
            v-model="tempProject.projectMemberArr"
            :left-default-checked="leftDefaultChecked"
            :right-default-checked="rightDefaultChecked"
            :data="options"
            :titles="['未添加成员', '已添加成员']"
            :filterable="true"
            filter-placeholder="请输入成员名称"
          />
        </el-form-item>
      </el-form>

      <template v-slot:footer>
        <div style="text-align: center">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            v-if="dialogStatus === DialogStatus.create"
            type="primary"
            :loading="loading"
            @click="createProject"
          >
            创 建
          </el-button>
          <el-button type="primary" v-else :loading="loading" @click="updateProject">修 改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.project-view {
  .filter-container {
    display: flex;
    justify-content: space-between;
  }

  .search {
    margin: 5px 0;
  }

  .search-item {
    width: 200px;
  }

  .item-member {
    color: #409eff;
  }
}
</style>
