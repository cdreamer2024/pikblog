<template>
  <div>
    <!-- 查询条件区域 -->
    <div style="margin-bottom: 16px">
      <a-space>
        <!-- 日期选择框 -->
        <a-date-picker
          v-model:value="selectedDate"
          placeholder="请选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 200px"
        />

        <!-- 类型选择框 -->
        <a-select
          v-model:value="selectedType"
          placeholder="请选择类型"
          style="width: 200px"
          :options="typeOptions"
        />

        <!-- 查询按钮 -->
        <a-button type="primary" @click="handleSearch">查询</a-button>

        <!-- 提交到下一级按钮 -->
        <a-button type="primary" @click="handleNextStep">提交到下一级</a-button>
      </a-space>
    </div>

    <!-- 表格 - 简化配置 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :row-selection="rowSelection"
      :pagination="pagination"
      size="middle"
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-button type="link" @click="handleDetail(record)">详情</a-button>
        </template>
      </template>
    </a-table>

    <!-- 详情下拉悬浮框 -->
    <a-drawer
      v-model:visible="detailVisible"
      title="文件管理"
      placement="right"
      width="800"
      :maskClosable="false"
    >
      <FileManager :record-id="currentRecordId" />
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import FileManager from "@/components/FileManage.vue";

// 类型定义
interface DataItem {
  key: number;
  name: string;
  age: number;
  address: string;
}

// 表格列定义 - 移除所有 fixed 属性
const columns: TableColumnsType = [
  { title: "姓名", dataIndex: "name", key: "name" },
  { title: "年龄", dataIndex: "age", key: "age" },
  { title: "地址", dataIndex: "address", key: "address" },
  { title: "操作", key: "operation", width: 100 },
];

// 类型选项
const typeOptions = ref([
  { label: "全部类型", value: "" },
  { label: "类型A", value: "typeA" },
  { label: "类型B", value: "typeB" },
  { label: "类型C", value: "typeC" },
  { label: "类型D", value: "typeD" },
]);

// 响应式数据
const selectedDate = ref<string>("");
const selectedType = ref<string>("");
const loading = ref(false);
const tableData = ref<DataItem[]>([]);
const selectedKeys = ref<number[]>([]);
const detailVisible = ref(false);
const currentRecordId = ref<number>(0);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  onChange: (page: number) => {
    pagination.current = page;
    fetchTableData();
  },
});

// 获取表格数据
const fetchTableData = async () => {
  try {
    loading.value = true;

    // 模拟数据
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        key: i,
        name: `用户 ${i + 1}`,
        age: 20 + Math.floor(Math.random() * 40),
        address: `地址 ${i + 1}`,
      });
    }

    // 简单过滤
    const filtered = data.filter((item) => {
      if (selectedType.value && !item.name.includes(selectedType.value)) {
        return false;
      }
      return true;
    });

    const start = (pagination.current - 1) * pagination.pageSize;
    tableData.value = filtered.slice(start, start + pagination.pageSize);
    pagination.total = filtered.length;
  } catch (error) {
    message.error("查询失败");
  } finally {
    loading.value = false;
  }
};

// 查询
const handleSearch = () => {
  pagination.current = 1;
  fetchTableData();
};

// 下一步
const handleNextStep = () => {
  if (selectedKeys.value.length === 0) {
    message.warning("请至少选择一项");
    return;
  }
  message.success(`选择了 ${selectedKeys.value.length} 项`);
};

// 详情
const handleDetail = (record: DataItem) => {
  currentRecordId.value = record.key;
  detailVisible.value = true;
};

// 行选择
const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: number[]) => {
    selectedKeys.value = keys;
  },
}));

// 初始化
onMounted(() => {
  fetchTableData();
});
</script>
