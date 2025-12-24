<template>
  <div class="console-container">
    <div class="welcome-box">
      <div class="welcome-text">
        <h3>早安,书砚🌞</h3>
        <p>今天是 {{ currentDate }}，准备好开始一天的工作了吗？</p>
      </div>
      <img
        src="https://element-plus.org/images/element-plus-logo.svg"
        class="welcome-img"
      />
    </div>

    <el-row :gutter="20" class="data-row">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <el-statistic :value="totalUsers">
            <template #title>
              <div class="stat-title">
                <el-icon><User /></el-icon> 总用户数
              </div>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <el-statistic :value="368">
            <template #title>
              <div class="stat-title">
                <el-icon><View /></el-icon> 今日访问
              </div>
            </template>

            <template #suffix>
              <span class="up-trend">↑ 12%</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <el-statistic :value="88460" prefix="¥">
            <template #title>
              <div class="stat-title">
                <el-icon><Money /></el-icon> 总销售额
              </div>
            </template>
          </el-statistic>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <el-statistic :value="12">
            <template #title>
              <div class="stat-title">
                <el-icon><Bell /></el-icon> 待办事项
              </div>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>最新注册用户</span>
              <el-button text bg size="small">查看全部</el-button>
            </div>
          </template>

          <el-table :data="userList" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="email" label="邮箱" min-width="150" />
            <el-table-column prop="phone" label="电话" />
            <el-table-column prop="company.name" label="公司" />
            <el-table-column label="状态">
              <template #default>
                <el-tag type="success" size="small">正常</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span>快捷入口</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" icon="Plus">新增用户</el-button>
            <el-button type="success" icon="DataLine">数据报表</el-button>
            <el-button type="warning" icon="Setting">系统设置</el-button>
            <el-button type="info" icon="Message">发送通知</el-button>
          </div>
        </el-card>

        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span>系统公告</span>
          </template>
          <ul class="notice-list">
            <li>🔥 Element Plus 版本更新至 2.5.0</li>
            <li>📢 周五系统维护通知</li>
            <li>🐛 修复了登录页的 Bug</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios"; // 这里我们直接用 axios 访问公共接口
import dayjs from "dayjs";
import {
  User,
  View,
  Money,
  Bell,
  Plus,
  DataLine,
  Setting,
  Message,
} from "@element-plus/icons-vue";

// 定义数据
const loading = ref(false);
const userList = ref([]); // 存放接口返回的用户列表
const totalUsers = ref(0);
const currentDate = new Date().toLocaleDateString();

// 获取数据的函数
const fetchData = async () => {
  loading.value = true;
  try {
    // 请求公共 API 获取 10 个用户
    const res = await axios.get("https://jsonplaceholder.typicode.com/users");
    if (res.status === 200) {
      // 只取前 5 个展示在首页
      userList.value = res.data.slice(0, 20);
      // 假装总数是接口返回的长度 * 123 (模拟一个大数字)
      totalUsers.value = res.data.length * 123;
    }
  } catch (error) {
    console.error("获取数据失败", error);
  } finally {
    loading.value = false;
  }
};

// 页面挂载完成后，立即请求数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 
.console-container {
  这里的 padding 已经在 Layout 的 el-main 设置过了，所以这里不需要设太大 
}*/

/* 顶部欢迎区 */
.welcome-box {
  background: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}
.welcome-text h3 {
  margin: 0 0 10px 0;
  color: #303133;
}
.welcome-text p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
.welcome-img {
  width: 100px;
  opacity: 0.8;
}

/* 数据卡片行 */
.data-row {
  margin-bottom: 20px;
}
.data-card {
  height: 100px; /* 固定高度让排版整齐 */
  display: flex;
  align-items: center; /* 垂直居中 */
}
/* 覆盖 element 默认样式，让 statistic 内容垂直居中 */
:deep(.el-card__body) {
  width: 100%;
  padding: 15px;
}

.stat-title {
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.up-trend {
  color: #f56c6c; /* 红色代表上升 */
  font-size: 12px;
  margin-left: 10px;
}

/* 表头两端对齐 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 快捷按钮网格 */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.quick-actions .el-button {
  margin-left: 0; /* 清除 element 默认的左边距 */
  width: 100%;
}

/* 公告列表 */
.notice-list {
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
}
</style>
