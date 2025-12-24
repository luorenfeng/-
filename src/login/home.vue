<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-menu">
      <div class="logo-box">
        <img
          src="https://element-plus.org/images/element-plus-logo.svg"
          alt="Logo"
          class="logo-img"
        />
        <span v-show="!isCollapse" class="logo-text">后台管理系统</span>
      </div>

      <el-menu
        active-text-color="#409EFF"
        background-color="#304156"
        text-color="#fff"
        :default-active="activeMenu"
        :collapse="isCollapse"
        :router="true"
        class="el-menu-vertical"
        unique-opened
      >
        <el-menu-item index="/home/console">
          <el-icon><Odometer /></el-icon><span>控制台</span>
        </el-menu-item>
        <el-sub-menu index="/home/user">
          <template #title
            ><el-icon><Setting /></el-icon><span>系统管理</span></template
          >
          <el-menu-item index="/home/user"
            ><el-icon><User /></el-icon>用户管理</el-menu-item
          >
          <el-menu-item index="/home/role"
            ><el-icon><UserFilled /></el-icon>角色管理</el-menu-item
          >
        </el-sub-menu>

        <el-sub-menu index="/goods" v-if="isSuperAdmin">
          <template #title
            ><el-icon><Goods /></el-icon><span>商品管理</span></template
          >
          <el-menu-item index="/home/list">商品列表</el-menu-item>
          <el-menu-item index="/home/manage">分类管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="trigger-icon" @click="toggleCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown>
            <div class="avatar-wrapper">
              <el-avatar
                size="small"
                src="http://luoren.cc/wp-content/uploads/2023/12/Image_1702531231022.jpg"
              />
              <span class="username">{{ name }}</span>
              <el-icon><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from "vue";
// ✨ 引入 useRouter 用于跳转，ElMessageBox/ElMessage 用于弹窗和提示
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import {
  Odometer,
  Setting,
  User,
  UserFilled,
  Goods,
  Expand,
  Fold,
  CaretBottom,
} from "@element-plus/icons-vue";

const route = useRoute(); //获取当前路由页面的信息，如地址，meta
const router = useRouter(); //跳转页面 router.replace('/login')替换当前页面，不能回退

const name = localStorage.getItem("name");

const isSuperAdmin = computed(() => {
  const aaa = localStorage.getItem("role");
  return aaa === "super_admin";
});

const isCollapse = ref(false);
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const activeMenu = computed(() => route.path);

// ✨✨ 核心逻辑 1：获取当前路由的标题
// 需要你在路由配置里写上 meta: { title: 'xxx' }
const currentTitle = computed(() => {
  return route.meta.title || "后台管理"; // 如果没配置title，默认显示后台管理
});

// ✨✨ 核心逻辑 2：退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 1. 清除本地存储的 token
      localStorage.removeItem("token");
      // 如果你存了 role 或 userInfo，也要记得一起清除
      localStorage.removeItem("role");

      // 2. 提示成功
      ElMessage.success("退出成功");

      // 3. 跳转回登录页 (使用 replace 防止用户点浏览器的后退按钮又回来了)
      router.replace("/login");
    })
    .catch(() => {
      // 用户点击了取消，什么都不做
    });
};
</script>

<style scoped>
/* 样式保持不变 */
.layout-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.aside-menu {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;
}
.el-menu-vertical {
  border-right: none;
}
.logo-box {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  color: #fff;
}
.logo-img {
  width: 30px;
  height: 30px;
}
.logo-text {
  margin-left: 10px;
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}
.header-left {
  display: flex;
  align-items: center;
}
.trigger-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
}
.header-right {
  cursor: pointer;
}
.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}
</style>
