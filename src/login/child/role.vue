<template>
  <el-card>
    <div style="display: flex; gap: 8px; align-items: center">
      <el-input
        v-model="keyword"
        placeholder="搜索角色名"
        clearable
        style="width: 200px"
      />
      <el-button type="primary" @click="openAdd">新增</el-button>
      <el-button @click="loadDemo">用公共接口生成演示数据</el-button>
    </div>

    <el-table :data="filteredRoles" style="margin-top: 12px" border>
      <el-table-column prop="name" label="角色名" />
      <el-table-column prop="desc" label="描述" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="removeRole(row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog
    v-model="dlgVisible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="420px"
  >
    <el-form label-width="70px">
      <el-form-item label="角色名">
        <el-input v-model="form.name" placeholder="比如：管理员" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.desc" placeholder="比如：可管理用户" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dlgVisible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const roles = ref([
  { id: 1, name: "管理员", desc: "管理系统设置" },
  { id: 2, name: "访客", desc: "只能查看" },
]);

const keyword = ref("");

// 对话框状态
const dlgVisible = ref(false);
const isEdit = ref(false);

// 表单数据
const form = reactive({ id: null, name: "", desc: "" });

// 搜索过滤（最简单的练手）
const filteredRoles = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return roles.value;
  return roles.value.filter((r) => r.name.includes(kw));
});

function openAdd() {
  isEdit.value = false;
  form.id = null;
  form.name = "";
  form.desc = "";
  dlgVisible.value = true;
}

function openEdit(row) {
  isEdit.value = true;
  form.id = row.id;
  form.name = row.name;
  form.desc = row.desc;
  dlgVisible.value = true;
}

function save() {
  if (!form.name.trim()) {
    ElMessage.warning("角色名不能为空");
    return;
  }

  if (isEdit.value) {
    const idx = roles.value.findIndex((r) => r.id === form.id);
    if (idx !== -1)
      roles.value[idx] = { id: form.id, name: form.name, desc: form.desc };
    ElMessage.success("编辑成功");
  } else {
    const maxId = roles.value.reduce((m, r) => Math.max(m, r.id), 0);
    roles.value.unshift({ id: maxId + 1, name: form.name, desc: form.desc });
    ElMessage.success("新增成功");
  }

  dlgVisible.value = false;
}

async function removeRole(id) {
  await ElMessageBox.confirm("确定删除这个角色吗？", "提示", {
    type: "warning",
  });
  roles.value = roles.value.filter((r) => r.id !== id);
  ElMessage.success("删除成功");
}

/**
 * 可选：从公共接口生成一些数据（练手用）
 * 我这里用 dummyjson users，把用户的 department 当成“角色名”
 */
async function loadDemo() {
  try {
    const res = await fetch("https://dummyjson.com/users?limit=30");
    const data = await res.json();

    const set = new Set();
    for (const u of data.users || []) {
      const dept = u?.company?.department;
      if (dept) set.add(dept);
    }

    roles.value = Array.from(set)
      .slice(0, 10)
      .map((name, i) => ({
        id: i + 1,
        name,
        desc: "来自公共接口生成",
      }));

    ElMessage.success("已生成演示数据");
  } catch {
    ElMessage.error("加载失败：请检查网络");
  }
}
</script>
