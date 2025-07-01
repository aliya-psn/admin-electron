<template>
  <div class="select_project_wraper ellipsis">
    <span class="choose_project">选择项目：</span>
    <el-dropdown trigger="click">
      <span class="el-dropdown-link">
        {{ title }}
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleCommand(item.id)" v-for="item in projectList" :key="item.id"
            >{{ item.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

export default {
  name: 'SelectProject',
  components: {},
  data() {
    return {
      title: '选择项目',
      projectList: [],

      steps: [
        {
          target: '.choose_project',
          content: '请先选择项目!'
        }
      ],
      myOptions: {
        useKeyboardNavigation: false,
        labels: {
          buttonStop: '我知道了'
        }
      },

      tourBgVisible: false,
      tourCallBack: {
        onFinish: this.closeTour
      }
    };
  },
  mounted() {
    this.getDropdownList();
  },
  methods: {
    closeTour() {
      this.tourBgVisible = false;
    },
    async getDropdownList() {
      this.projectList = userStore.projectList;

      const storedProjectId = window.sessionStorage.getItem('projectId');
      const project = storedProjectId ? this.projectList.find(dataKey => dataKey['id'] === storedProjectId) : null;

      if (project) {
        this.title = project['name'];
      } else if (this.title === '选择项目') {
        // 漫游引导
        if (this.projectList.length === 0) {
          this.tourBgVisible = true;
          return;
        }
        // 默认选中第一个项目
        const defaultProject = this.projectList[0];
        window.sessionStorage.setItem('projectId', defaultProject.id);
        location.reload();
      }
    },
    handleCommand(projectId) {
      window.sessionStorage.setItem('projectId', projectId);
      location.reload();
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.select_project_wraper {
  margin: 0 28px;
  display: flex;
  align-items: center;
  flex: 1;
  z-index: 99;

  .choose_project {
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.el-dropdown-link {
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.el-icon-arrow-down {
  font-size: 14px;
}
</style>
