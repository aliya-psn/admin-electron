<script setup lang="ts">
import { Search, Refresh } from '@element-plus/icons-vue';
import { ref, reactive, onMounted } from 'vue';
import { userApi } from '@/api/user';
import { userMq } from '@/mysql/user';
import Pagination from '@/components/Pagination/index.vue';
import type { UserModel, UserListParams } from '@/api/types/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { isElectron } from '@/utils';

// Reactive properties
const totalCount = ref(0);
const list = ref<UserModel[]>([]);
const listLoading = ref(false);
const listQuery = reactive<UserListParams>({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  username: '',
  nickname: ''
});

const value = ref(false);

const activeTab = ref<'api' | 'mysql'>('api');

const getList = async () => {
  listLoading.value = true;
  let res;
  if (activeTab.value === 'api') {
    res = await userApi.getUserList(listQuery);
  } else {
    res = await userMq.getUserList(listQuery);
  }
  const { data } = res;
  listLoading.value = false;
  list.value = data.userList;
  totalCount.value = data.totalNum;
};

const handleChangePage = ({ page, limit }: { page: number; limit: number }) => {
  listQuery.pageNum = page;
  listQuery.pageSize = limit;
  getList();
};

const handleReset = () => {
  Object.assign(listQuery, {
    pageNum: 1,
    pageRow: 10,
    roleName: '',
    username: '',
    nickname: ''
  });
  getList();
};

const getIndex = ($index: number) => {
  return (listQuery.pageNum - 1) * (listQuery.pageSize || 10) + $index + 1;
};

// 全部角色列表
const roleArr = ref<Array<{ roleId: number; roleName: string }>>([]);
const getAllRoles = async () => {
  const res = await userApi.getAllRoles({});
  const data = res.data;
  roleArr.value = data.map(item => ({ roleId: item.roleId, roleName: item.roleName }));
};

onMounted(() => {
  if (!isElectron) {
    activeTab.value = 'api';
  }
  getList();
  getAllRoles();
});

// 更新用户信息
const updateDialogVisible = ref(false);
const selectedUser = ref<UserModel>({} as UserModel);
const selectedRole = ref('');

// 更新用户逻辑
const handleUpdate = async () => {
  try {
    const param = {
      userId: selectedUser.value.userId,
      roleId: roleArr.value.find(item => item.roleName === selectedRole.value)!.roleId
    };
    await userApi.postUpdateUser(param);
    // 关闭对话框并刷新列表
    updateDialogVisible.value = false;
    getList();
  } catch (error) {
    console.error('Failed to update user role:', error);
  }
};

const showUpdate = (index: number) => {
  const user = list.value[index];
  selectedUser.value = user;
  selectedRole.value = user.roles[0].roleName;
  updateDialogVisible.value = true;
};

// 删除用户
const handleDelete = async (index: number) => {
  const user = list.value[index];
  ElMessageBox.confirm(`确认删除用户"${user.nickname}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const userId = user.userId;
      userApi.deleteUser(userId).then(() => {
        ElMessage.success('删除成功');
        // 刷新列表
        getList();
      });
    })
    .catch(() => {});
};

const handleTabChange = (tab: string | number) => {
  activeTab.value = tab as 'api' | 'mysql';
  listQuery.pageNum = 1;
  getList();
};
</script>

<template>
  <div class="user-view">
    <template v-if="isElectron">
      <el-tabs v-model="activeTab" @update:model-value="handleTabChange">
        <el-tab-pane label="API" name="api" />
        <el-tab-pane label="MySQL" name="mysql" />
      </el-tabs>
    </template>
    <!-- 非 Electron 环境不显示 tab，activeTab 始终为 'api' -->
    <div class="filter-container">
      <div />
      <el-form ref="queryForm" :inline="true">
        <div class="search">
          <el-form-item prop="nickname" label="昵称：">
            <el-input class="search-item" v-model="listQuery.nickname" placeholder="请输入昵称搜索" clearable />
          </el-form-item>
          <el-form-item prop="username" label="用户名：">
            <el-input class="search-item" v-model="listQuery.username" placeholder="请输入用户名搜索" clearable />
          </el-form-item>
          <el-form-item prop="roleName" label="角色：">
            <el-select class="search-item" v-model="listQuery.roleName" placeholder="请选择角色">
              <el-option v-for="item in roleArr" :key="item.roleId" :label="item.roleName" :value="item.roleName" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" plain :icon="Search" @click="getList"> 查询 </el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <el-table :data="list" v-loading="listLoading" fit highlight-current-row max-height="580">
      <el-table-column align="" label="序号" width="80">
        <template #default="scope">
          <span v-text="getIndex(scope.$index)" />
        </template>
      </el-table-column>
      <!-- <el-table-column align="" label="ID" prop="userId"></el-table-column> -->
      <el-table-column align="" label="昵称" prop="nickname" />
      <el-table-column align="" label="用户名" prop="username" />
      <el-table-column align="" label="角色">
        <template #default="scope">
          <div style="margin-right: 4px; display: inline-block" v-for="(i, j) in scope.row.roles" :key="j">
            <el-tag type="success" v-if="i.roleId === 1">{{ i.roleName }}</el-tag>
            <el-tag type="primary" v-else>{{ i.roleName }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="" label="创建时间" prop="createTime" width="200" />
      <el-table-column align="" label="最近修改时间" prop="updateTime" width="200" />
      <el-table-column align="center" label="操作" width="140">
        <template #default="scope">
          <el-button type="primary" plain size="small" @click="showUpdate(scope.$index)">编 辑</el-button>
          <el-button type="primary" plain size="small" @click="handleDelete(scope.$index)">删 除</el-button>
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

    <el-dialog title="更新用户" v-model="updateDialogVisible" width="30%">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="selectedUser.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="selectedUser.nickname" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectedRole" placeholder="请选择角色">
            <el-option v-for="item in roleArr" :key="item.roleId" :label="item.roleName" :value="item.roleName" />
          </el-select>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div style="text-align: center">
          <el-button @click="updateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleUpdate">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.filter-container {
  display: flex;
  justify-content: space-between;
}

.search {
  margin: 5px 0;
}

.search-item {
  width: 180px;
}
</style>
