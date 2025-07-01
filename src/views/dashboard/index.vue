<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card stability-test-card">
          <div class="card-content">
            <div class="text-section">
              <div class="title-with-line">
                <span class="line" />
                <span class="title">稳定性测试</span>
              </div>
              <p class="description">
                基于智能测试模型及高效的遍历方式，发现应用稳定性问题，并给出测试报告及故障定位日志。
              </p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="projects-section">
      <el-col :span="24">
        <h2 class="section-title">我的项目</h2>
      </el-col>
      <el-col v-for="project in projects" :key="project.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
        <el-card class="box-card app-explore-project-card">
          <div class="card-content-explore">
            <div class="text-section-explore">
              <h3>{{ project.name }}</h3>
              <p class="description">{{ project.description }}</p>
              <div class="detail-link">
                <span>查看详情</span>
                <i class="el-icon-right" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Setting } from '@element-plus/icons-vue';

const projects = ref([
  {
    id: 1,
    name: '应用探索测试项目 A',
    description: '基于知识图谱及测试训练模型，推动智能遍历执行持续优化，辅助用户越测越高效。'
  },
  {
    id: 2,
    name: '应用探索测试项目 B',
    description: '提升测试效率，减少人工干预，自动化发现潜在问题，确保应用质量。'
  },
  {
    id: 3,
    name: '应用探索测试项目 C',
    description: '结合大数据分析，提供深度测试报告，帮助快速定位故障，优化开发流程。'
  },
  {
    id: 4,
    name: '应用探索测试项目 D',
    description: '利用机器学习算法，持续学习应用行为，智能生成测试用例，覆盖更多场景。'
  },
  {
    id: 5,
    name: '应用探索测试项目 E',
    description: '提供灵活的测试配置，支持多种测试环境，满足不同项目的个性化需求。'
  },
  {
    id: 6,
    name: '应用探索测试项目 F',
    description: '实时监控应用性能指标，发现性能瓶颈，提供优化建议，提升用户体验。'
  }
]);
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 15px;
}

.box-card {
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
  }
}

.stability-test-card {
  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-top: 10px;

    .text-section {
      flex: none;
      padding-right: 0;

      .title-with-line {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        .line {
          width: 4px;
          height: 20px;
          background-color: #409eff;
          margin-right: 6px;
          border-radius: 2px;
        }

        .title {
          font-size: 22px;
          font-weight: bold;
          color: #333;
        }
      }

      .description {
        font-size: 13px;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}

.projects-section {
  margin-top: 15px;

  .section-title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 12px;
  }
}

.app-explore-project-card {
  margin-bottom: 15px;
  .card-content-explore {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;
    height: 100%;
    justify-content: center;

    .text-section-explore {
      h3 {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        margin-bottom: 6px;
      }

      .description {
        font-size: 13px;
        color: #666;
        line-height: 1.4;
        margin-bottom: 10px;
      }

      .detail-link {
        display: flex;
        align-items: center;
        color: #409eff;
        font-size: 13px;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }

        .el-icon-right {
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
