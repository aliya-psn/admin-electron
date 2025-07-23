<script setup lang="ts">
import { Search, Refresh, CirclePlus } from '@element-plus/icons-vue';
import { ref, reactive, onMounted, watch } from 'vue';
import { projectApi } from '@/api/project';
import { userApi } from '@/api/user';
import * as Project from '@/api/types/project';
import Pagination from '@/components/Pagination/index.vue';
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

const value = ref(false);

onMounted(() => {
  getList();
  getUserList();
});

// 用户列表展示
const options = ref<Array<{ key: number; label: string }>>([]);

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
      <el-table-column align="" label="更新时间" prop="updateTime" width="180" />
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
