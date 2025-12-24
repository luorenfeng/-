<template>
  <div style="padding: 20px">
    <el-card shadow="never">
      <el-button type="primary" icon="Plus" @click="openAddDialog"
        >新增用户</el-button
      >

      <el-table :data="tableData" border style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="name" label="姓名" />

        <el-table-column prop="role" label="角色">
          <template #default="scope">
            <el-tag :type="scope.row.role === '管理员' ? 'danger' : 'success'">
              {{ scope.row.role }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="openEditDialog(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.$index)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="400px"
    >
      <el-form :model="formData" label-width="60px">
        <el-form-item label="姓名">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="管理员" value="管理员" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

// --- 数据部分 ---

// 1. 表格数据 (先写死 2 条，方便你看效果)
const tableData = ref([
  { id: 1, name: "张三", role: "管理员" },
  { id: 2, name: "李四", role: "普通用户" },
]);

// 2. 弹窗开关
const dialogVisible = ref(false);
const isEdit = ref(false); // 标记当前是“新增”还是“编辑”

// 3. 表单数据模型
const formData = reactive({
  id: null,
  name: "",
  role: "",
});

// --- 逻辑部分 ---

// 打开“新增”弹窗
const openAddDialog = () => {
  isEdit.value = false; // 标记为新增模式
  formData.name = ""; // 清空表单
  formData.role = "普通用户"; // 默认角色
  dialogVisible.value = true; // 显示弹窗
};

// 打开“编辑”弹窗
const openEditDialog = (row) => {
  isEdit.value = true; // 标记为编辑模式
  // 把当前行的数据复制到表单里
  formData.id = row.id;
  formData.name = row.name;
  formData.role = row.role;
  dialogVisible.value = true;
};

// 点击“确定”按钮 (核心逻辑)
const handleSave = () => {
  // 简单校验：姓名不能为空
  if (!formData.name) {
    ElMessage.warning("请输入姓名");
    return;
  }

  if (isEdit.value) {
    // --- 编辑逻辑 ---
    // 找到数组里对应的那个用户，修改它的值
    const user = tableData.value.find((item) => item.id === formData.id);
    if (user) {
      user.name = formData.name;
      user.role = formData.role;
    }
    ElMessage.success("修改成功");
  } else {
    // --- 新增逻辑 ---
    // 创建一个新对象，推入数组
    tableData.value.push({
      id: Date.now(), // 用时间戳模拟唯一的 ID
      name: formData.name,
      role: formData.role,
    });
    ElMessage.success("新增成功");
  }

  // 关闭弹窗
  dialogVisible.value = false;
};

// 点击“删除”按钮
const handleDelete = (index) => {
  ElMessageBox.confirm("确定要删除这个用户吗？", "提示", {
    type: "warning",
  })
    .then(() => {
      // 根据索引删除数组里的一项
      tableData.value.splice(index, 1);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};
</script>
