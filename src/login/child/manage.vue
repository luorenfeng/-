<template>
  <div class="app-container">
    <el-card shadow="never" class="table-card">
      <div class="filter-container">
        <div class="left-panel">
          <el-input
            v-model="keyword"
            placeholder="请输入分类名称"
            style="width: 200px; margin-right: 10px"
            clearable
            prefix-icon="Search"
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" icon="Search" @click="handleSearch"
            >搜索</el-button
          >
          <el-button icon="RefreshRight" @click="resetQuery">重置</el-button>
        </div>

        <div class="right-panel">
          <el-button type="primary" icon="Plus" @click="handleAddRoot"
            >新增一级分类</el-button
          >
          <el-button type="info" plain icon="Sort" @click="toggleExpandAll"
            >展开/折叠</el-button
          >
        </div>
      </div>

      <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="categoryList"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
      >
        <el-table-column prop="name" label="分类名称" min-width="200" />

        <el-table-column label="图标" width="100" align="center">
          <template #default="scope">
            <el-icon v-if="!scope.row.icon" :size="18"><Folder /></el-icon>
            <component
              v-else
              :is="scope.row.icon"
              style="width: 18px; height: 18px"
            />
          </template>
        </el-table-column>

        <el-table-column prop="sort" label="排序" width="100" align="center" />

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="启用"
              inactive-text="停用"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="创建时间"
          prop="createTime"
          width="180"
          align="center"
        />

        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              link
              type="primary"
              icon="Plus"
              @click="handleAddChild(scope.row)"
              >新增子级</el-button
            >
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="title"
      v-model="open"
      width="500px"
      append-to-body
      @close="cancel"
    >
      <el-form
        ref="categoryFormRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级分类">
          <el-input
            v-model="form.parentName"
            disabled
            placeholder="无（作为一级分类）"
          />
        </el-form-item>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="显示排序" prop="sort">
          <el-input-number
            v-model="form.sort"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="分类状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  RefreshRight,
  Plus,
  Sort,
  Edit,
  Delete,
  Folder,
  Monitor,
  Iphone,
  ColdDrink,
} from "@element-plus/icons-vue";

// --- 模拟数据 (树形结构) ---
const mockData = [
  {
    id: 1,
    name: "电子数码",
    icon: "Monitor",
    sort: 1,
    status: 1,
    createTime: "2023-01-01",
    children: [
      {
        id: 11,
        name: "手机",
        icon: "Iphone",
        sort: 1,
        status: 1,
        createTime: "2023-01-02",
      },
      {
        id: 12,
        name: "电脑",
        icon: "Monitor",
        sort: 2,
        status: 1,
        createTime: "2023-01-02",
      },
      {
        id: 13,
        name: "耳机",
        icon: "Headset",
        sort: 3,
        status: 0,
        createTime: "2023-01-03",
      },
    ],
  },
  {
    id: 2,
    name: "家用电器",
    icon: "ColdDrink",
    sort: 2,
    status: 1,
    createTime: "2023-02-01",
    children: [
      {
        id: 21,
        name: "冰箱",
        icon: "",
        sort: 1,
        status: 1,
        createTime: "2023-02-05",
      },
      {
        id: 22,
        name: "洗衣机",
        icon: "",
        sort: 2,
        status: 1,
        createTime: "2023-02-06",
      },
    ],
  },
  {
    id: 3,
    name: "生鲜水果",
    icon: "Apple",
    sort: 3,
    status: 1,
    createTime: "2023-03-01",
  },
];

// --- 响应式状态 ---
const loading = ref(false);
const refreshTable = ref(true); // 用于强制刷新表格（折叠/展开时用）
const isExpandAll = ref(true); // 默认展开状态
const categoryList = ref([...mockData]); // 表格数据
const keyword = ref("");

const open = ref(false);
const title = ref("");
const categoryFormRef = ref(null);

const data = reactive({
  form: {},
  rules: {
    name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
    sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
  },
});

const { form, rules } = toRefs(data);

// --- 交互方法 ---

// 搜索 (模拟前端过滤)
const handleSearch = () => {
  if (!keyword.value) {
    categoryList.value = [...mockData];
    return;
  }
  // 简单模拟：只搜第一层，实际应该是后端搜完返回树结构
  categoryList.value = mockData.filter((item) =>
    item.name.includes(keyword.value)
  );
  ElMessage.success("搜索完成");
};

// 重置
const resetQuery = () => {
  keyword.value = "";
  categoryList.value = [...mockData];
};

// 展开/折叠 切换
const toggleExpandAll = () => {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  // 技巧：通过 v-if 销毁并重建表格，触发展开/折叠属性生效
  nextTick(() => {
    refreshTable.value = true;
  });
};

// 重置表单
const resetForm = () => {
  form.value = {
    id: undefined,
    parentId: 0,
    parentName: "无", // 默认为顶级
    name: undefined,
    sort: 0,
    status: 1,
  };
};

// 新增一级分类
const handleAddRoot = () => {
  resetForm();
  open.value = true;
  title.value = "新增一级分类";
};

// 新增子分类
const handleAddChild = (row) => {
  resetForm();
  form.value.parentId = row.id;
  form.value.parentName = row.name; // 回显父级名称，体验更好
  open.value = true;
  title.value = "新增子分类";
};

// 编辑
const handleEdit = (row) => {
  resetForm();
  form.value = { ...row };
  // 这里为了简单，编辑时没去查父级名字，实际开发需要查
  form.value.parentName = row.children ? "无" : "上级分类";
  open.value = true;
  title.value = "编辑分类";
};

// 提交
const submitForm = () => {
  categoryFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success("模拟提交成功！");
      open.value = false;
      // 这里应该调后端 API 刷新列表
    }
  });
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '是否确认删除名称为"' + row.name + '"的分类项?',
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    ElMessage.success("删除成功");
    // 实际需调用删除接口
  });
};

// 状态开关
const handleStatusChange = (row) => {
  const text = row.status === 1 ? "启用" : "停用";
  ElMessage.success(`已${text} "${row.name}"`);
};

const cancel = () => {
  open.value = false;
  resetForm();
};
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between; /* 左右贴边 */
  align-items: center;
}

/* 按钮组微调 */
.left-panel,
.right-panel {
  display: flex;
  align-items: center;
  gap: 10px; /* 按钮之间的间距 */
}

.table-card {
  min-height: 500px;
}
</style>
