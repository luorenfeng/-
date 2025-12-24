<template>
  <div class="login-wrapper">
    <div class="login-box">
      <h2 class="title">欢迎登录</h2>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" status-icon>
        <el-form-item prop="username" label="用户">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            size="large"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
            size="large"
          >
            登录
          </el-button>

          <el-button type="primary" class="login-bt" @click="aaa" size="large">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import request from "../utils/request";
import { ElNotification, ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue"; // 引入图标
import { useRouter } from "vue-router"; //拿到路由组件的信息
// 定义变量
const loginFormRef = ref(null);
const loading = ref(false);

const router = useRouter(); //把路由的信息赋值给变量

const loginForm = reactive({
  username: "",
  password: "",
});

const rules = reactive({
  username: [
    { required: true, message: "用户名不能为空", trigger: "blur" },
    {
      min: 3,
      message: "用户名不能少于3位",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    { min: 3, message: "密码不能少于3位", trigger: "blur" },
  ],
});

const handleLogin = () => {
  if (!loginFormRef.value) return;

  //validate手动校验表单规则
  loginFormRef.value.validate((valid) => {
    //valid校验通过返回true
    if (valid) {
      //把登录按钮变成转圈状态，不可点击
      loading.value = true;

      request
        .post("/login", loginForm)
        .then((res) => {
          ElNotification({
            title: "登录成功",
            message: `欢迎回来${res.data.name}`,
            type: "success",
            duration: 2000,
          });
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.role);
          localStorage.setItem("name", res.data.name);

          router.push("/home");
        })
        .catch((err) => {
          console.error("登录流程被中断", err);
          aaa();
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
};

const aaa = () => {
  loginFormRef.value.resetFields();
};
</script>

<style scoped>
/* 背景全屏居中 */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("http://luoren.cc/wp-content/uploads/2024/11/wallhaven-p9ep13_1920x1200.png");
  background-repeat: no-repeat;
  /* 图片位置居中 */
  background-position: center;
  /* 铺满，覆盖屏幕 */
  background-size: cover;
}

/* 登录卡片样式 */
.login-box {
  width: 360px;
  padding: 60px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2); /* 加点阴影更有质感 */
  background: rgba(255, 255, 255, 0.4);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  font-weight: bold;
  color: #333;
}

.login-btn {
  width: 40%; /* 按钮宽度拉满 */
}
.login-bt {
  margin-left: 70px;
  width: 40%;
}
</style>
