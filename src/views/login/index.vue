<script lang="ts" setup>
import { reactive, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { type FormInstance, type FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { type LoginRequestData } from '@/api/types/login';
import { useFocus } from './hooks/useFocus';

const router = useRouter();
const { handleBlur, handleFocus } = useFocus();

/** 登录表单元素的引用 */
const loginFormRef = ref<FormInstance | null>(null);

/** 登录按钮 Loading */
const loading = ref(false);

/** 登录表单数据 */
const loginFormData: LoginRequestData = reactive({
  username: 'fsl_liuyilan',
  password: 'swhy1234'
});
/** 登录表单校验规则 */
const loginFormRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' }
  ]
};
/** 登录逻辑 */
const handleLogin = () => {
  loginFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      loading.value = true;
      useUserStore()
        .login(loginFormData)
        .then(() => {
          nextTick(() => {
            router.push({ path: '/dashboard' });
          });
        })
        .catch(() => {
          loginFormData.password = '';
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      console.error('表单校验不通过', fields);
    }
  });
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-card">
        <div class="title">
          <img src="@/assets/logo/logo-text.png" />
        </div>
        <div class="content">
          <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
            <el-form-item prop="username">
              <el-input
                v-model.trim="loginFormData.username"
                placeholder="用户名"
                type="text"
                tabindex="1"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model.trim="loginFormData.password"
                placeholder="密码"
                type="password"
                tabindex="2"
                :prefix-icon="Lock"
                size="large"
                show-password
                @blur="handleBlur"
                @focus="handleFocus"
              />
            </el-form-item>
            <el-button :loading="loading" type="primary" size="large" class="login-button" @click.prevent="handleLogin">
              登 录
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('@/assets/login/login-bg.png') no-repeat center center;
    background-size: cover;
    opacity: 0.1;
    z-index: 0;
  }

  .login-box {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .login-card {
    width: 480px;
    max-width: 90%;
    margin: 0 auto;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .title {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 70px;
      margin: 20px 0;
      img {
        height: 100%;
        object-fit: contain;
      }
    }

    .content {
      padding: 20px 50px 50px 50px;

      :deep(.el-input) {
        --el-input-hover-border-color: #a1c4fd;
        --el-input-focus-border-color: #c2e9fb;

        .el-input__wrapper {
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          }
        }
      }

      .login-button {
        width: 100%;
        margin-top: 20px;
        height: 44px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        border: none;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(161, 196, 253, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

// 暗色主题适配
:deep(.dark) {
  .login-card {
    background: rgba(30, 30, 30, 0.95);
  }
}
</style>
