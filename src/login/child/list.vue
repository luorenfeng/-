<template>
  <el-card>
    <!-- 顶部筛选区（真实后台常见） -->
    <div class="toolbar">
      <el-input
        v-model="q.keyword"
        placeholder="搜索商品名"
        clearable
        style="width: 220px"
        @keyup.enter="onSearch"
      />
      <el-select
        v-model="q.category"
        placeholder="分类"
        clearable
        style="width: 160px"
      >
        <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
      </el-select>

      <el-button type="primary" @click="onSearch">查询</el-button>
      <el-button @click="onReset">重置</el-button>

      <div class="spacer"></div>

      <el-button @click="loadProducts" :loading="loading">刷新</el-button>
      <el-button type="primary" @click="openAdd">新增商品</el-button>
    </div>

    <!-- 表格区 -->
    <el-table v-loading="loading" :data="pagedList" border row-key="id">
      <el-table-column
        prop="title"
        label="商品名"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column prop="category" label="分类" width="140" />
      <el-table-column prop="price" label="价格" width="100" align="right">
        <template #default="{ row }">￥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="90" align="center" />

      <el-table-column label="上架" width="110" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="() => onToggle(row)" />
        </template>
      </el-table-column>

      <el-table-column prop="updatedAt" label="更新时间" width="180" />

      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（真实后台必备） -->
    <div class="pager">
      <el-pagination
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        :total="filteredList.length"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </el-card>

  <!-- 新增 / 编辑弹窗 -->
  <el-dialog
    v-model="dlg.visible"
    :title="dlg.mode === 'add' ? '新增商品' : '编辑商品'"
    width="480px"
  >
    <el-form label-width="80px">
      <el-form-item label="商品名">
        <el-input v-model="form.title" placeholder="例如：无线鼠标" />
      </el-form-item>
      <el-form-item label="分类">
        <el-input v-model="form.category" placeholder="例如：electronics" />
      </el-form-item>
      <el-form-item label="价格">
        <el-input-number v-model="form.price" :min="0" :step="1" />
      </el-form-item>
      <el-form-item label="库存">
        <el-input-number v-model="form.stock" :min="0" :step="1" />
      </el-form-item>
      <el-form-item label="上架">
        <el-switch v-model="form.enabled" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dlg.visible = false">取消</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

const loading = ref(false);

// 筛选条件（真实项目就是一个 query 对象）
const q = reactive({
  keyword: "",
  category: "",
});

// 分页
const page = reactive({
  current: 1,
  size: 10,
});

// 商品列表（这里做“前端练手模拟数据库”）
const list = ref([]);

// 分类下拉（从数据里提取，真实开发也常这样做）
const categories = computed(() => {
  const set = new Set(list.value.map((p) => p.category).filter(Boolean));
  return Array.from(set);
});

// 过滤后的列表
const filteredList = computed(() => {
  const kw = q.keyword.trim().toLowerCase();
  return list.value.filter((p) => {
    const hitKw = !kw || p.title.toLowerCase().includes(kw);
    const hitCat = !q.category || p.category === q.category;
    return hitKw && hitCat;
  });
});

// 分页后的数据
const pagedList = computed(() => {
  const start = (page.current - 1) * page.size;
  return filteredList.value.slice(start, start + page.size);
});

// ========== “像真项目”的数据加载：拉公共接口 ==========
async function loadProducts() {
  loading.value = true;
  try {
    // DummyJSON 的 products 接口：用于练手非常方便
    const res = await fetch("https://dummyjson.com/products?limit=60&skip=0");
    const data = await res.json();

    // 统一成我们页面需要的字段（真实开发：接口适配层）
    list.value = (data.products || []).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
      stock: p.stock ?? 0,
      enabled: true, // 接口没这个字段，我们本地模拟“上架”
      updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    }));

    page.current = 1;
    ElMessage.success("加载商品成功");
  } catch {
    ElMessage.error("加载失败：请检查网络");
  } finally {
    loading.value = false;
  }
}

// 查询 / 重置
function onSearch() {
  page.current = 1;
}
function onReset() {
  q.keyword = "";
  q.category = "";
  page.current = 1;
}

// 上下架（练手：直接改本地数据）
function onToggle(row) {
  row.updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  ElMessage.success(row.enabled ? "已上架" : "已下架");
}

// ========== 新增 / 编辑 ==========
const dlg = reactive({ visible: false, mode: "add", editingId: null });
const form = reactive({
  id: null,
  title: "",
  category: "",
  price: 0,
  stock: 0,
  enabled: true,
});

function openAdd() {
  dlg.mode = "add";
  dlg.editingId = null;
  Object.assign(form, {
    id: null,
    title: "",
    category: "",
    price: 0,
    stock: 0,
    enabled: true,
  });
  dlg.visible = true;
}

function openEdit(row) {
  dlg.mode = "edit";
  dlg.editingId = row.id;
  Object.assign(form, { ...row });
  dlg.visible = true;
}

function onSave() {
  if (!form.title.trim()) return ElMessage.warning("商品名不能为空");
  if (!form.category.trim()) return ElMessage.warning("分类不能为空");

  if (dlg.mode === "add") {
    const maxId = list.value.reduce((m, p) => Math.max(m, p.id), 0);
    list.value.unshift({
      id: maxId + 1,
      title: form.title,
      category: form.category,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      enabled: !!form.enabled,
      updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    ElMessage.success("新增成功");
  } else {
    const idx = list.value.findIndex((p) => p.id === dlg.editingId);
    if (idx !== -1) {
      list.value[idx] = {
        ...list.value[idx],
        title: form.title,
        category: form.category,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        enabled: !!form.enabled,
        updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      ElMessage.success("保存成功");
    }
  }

  dlg.visible = false;
}

// 删除
async function onDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.title}」吗？`, "提示", {
    type: "warning",
  });
  list.value = list.value.filter((p) => p.id !== row.id);
  ElMessage.success("删除成功");
}

onMounted(loadProducts);
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.spacer {
  flex: 1;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
