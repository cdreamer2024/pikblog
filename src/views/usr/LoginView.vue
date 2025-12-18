<template>
  <div class="main">
    <a-form
      class="form"
      :model="formState"
      name="basic"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
      ref="loginFormRef"
    >
      <h2 class="form-title">用户登录</h2>

      <a-form-item
        label="用户名"
        name="username"
        :rules="[{ required: true, message: '请输入用户名!' }]"
      >
        <a-input
          v-model:value="formState.username"
          placeholder="请输入用户名"
        />
      </a-form-item>

      <a-form-item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '请输入密码!' }]"
      >
        <a-input-password
          v-model:value="formState.password"
          placeholder="请输入密码"
          @keyup.enter="onSubmit"
        />
      </a-form-item>

      <a-form-item name="remember" :wrapper-col="{ offset: 6, span: 16 }">
        <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 6, span: 16 }">
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          class="submit-btn"
        >
          登录
        </a-button>
        <a-button @click="reset" class="reset-btn"> 重置 </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { message, type FormInstance } from "ant-design-vue";
import { useRouter } from "vue-router";
import useUserStore from "../../store/index";
import { getToken, type LoginParams } from "../../http/index";

interface FormState {
  username: string;
  password: string;
  remember: boolean;
}

const fetchToken = async (formData: {
  username: string;
  password: string;
}): Promise<string | null> => {
  try {
    // 直接 await 获取结果，不需要访问 .token 属性
    const token = await getToken(formData as LoginParams);

    // 根据你的 API 实际返回结构处理
    if (token && typeof token === "string") {
      return token;
    } else {
      console.error("无效的token响应:", token);
      return null;
    }
  } catch (error) {
    console.error("获取token失败:", error);
    return null;
  }
};

const router = useRouter();
// const userStore = useUserStore(); // 实际项目中使用的状态管理

const formState = reactive<FormState>({
  username: "",
  password: "",
  remember: true,
});

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const onFinish = async (values: any) => {
  await onSubmit();
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
  message.error("表单验证失败，请检查输入");
};

const onSubmit = async () => {
  try {
    // 手动触发表单验证
    await loginFormRef.value?.validate();

    loading.value = true;

    // 请求登录接口获取token
    const token: string | null = await fetchToken({
      username: formState.username,
      password: formState.password,
    });

    if (token) {
      message.success("登录成功");
      useUserStore().$patch((state) => {
        (state.Token = token),
          //每次重新登录之后重置无感刷新storetoken次数
          (state.RefreshTokenNum = 0);
      });

      // 存储token到状态管理或localStorage
      // userStore.setToken(token);
      //localStorage.setItem("token", token);

      // 如果勾选了"记住我"，将用户名存储到localStorage
      if (formState.remember) {
        localStorage.setItem("rememberedUsername", formState.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      // 跳转到首页或其他受保护的路由
      router.push("/voucher/todo");
    } else {
      message.error("用户名或密码错误");
    }
  } catch (error) {
    console.log("Validation failed:", error);
    message.error("请正确填写表单");
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  loginFormRef.value?.resetFields();
};

// 组件挂载时检查是否有记住的用户名
// onMounted(() => {
//   const rememberedUsername = localStorage.getItem('rememberedUsername');
//   if (rememberedUsername) {
//     formState.username = rememberedUsername;
//   }
// });
</script>

<style lang="scss" scoped>
.main {
  background-image: url("/public/bg.png");
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.form {
  width: 450px;
  background: rgba(232, 246, 232, 0.9);
  padding: 40px 30px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .form-title {
    text-align: center;
    margin-bottom: 30px;
    color: #1890ff;
    font-weight: 600;
  }

  .submit-btn {
    margin-right: 12px;
    width: 80px;
  }

  .reset-btn {
    width: 80px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .form {
    width: 90%;
    padding: 30px 20px 15px;
  }
}
</style>
