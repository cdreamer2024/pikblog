<template>
  <div>
    <div style="margin-bottom: 16px">
      <a-button type="primary" style="margin-left: 8px" @click="handleNextStep"
        >提交到下一级</a-button
      >
    </div>
    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="data"
      :scroll="{ x: 1200, y: 800 }"
      :row-selection="rowSelection"
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
import { ref, computed, h } from "vue";
import type { TableColumnsType } from "ant-design-vue";
import FileManager from "../components/FileManage.vue";

interface DataItem {
  key: number;
  name: string;
  age: number;
  address: string;
}

const columns: TableColumnsType = [
  {
    title: "Full Name",
    width: 100,
    dataIndex: "name",
    key: "name",
    fixed: "left",
  },
  { title: "Age", width: 100, dataIndex: "age", key: "age", fixed: "left" },
  { title: "Address", dataIndex: "address", key: "address", width: 100 },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
    width: 100,
  },
];

const data: DataItem[] = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

// 全选状态
const selectAll = ref(false);
// 当前选中的行
const selectedKeys = ref<number[]>([]);
// 当前页数据
const currentPageData = ref<DataItem[]>([]);
// 详情框显示状态
const detailVisible = ref(false);
// 当前操作的记录ID
const currentRecordId = ref<number>(0);

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: data.length,
  onChange: (page: number, pageSize: number) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    updateCurrentPageData();
  },
});

// 更新当前页数据
const updateCurrentPageData = () => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  currentPageData.value = data.slice(start, end);
};
updateCurrentPageData();

// 下一步按钮点击事件
const handleNextStep = () => {
  alert(`确认选择了 ${selectedKeys.value.length} 项`);
};

// 详情按钮点击事件
const handleDetail = (record: DataItem) => {
  currentRecordId.value = record.key;
  detailVisible.value = true;
};

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: number[]) => {
    selectedKeys.value = keys;
    const currentKeys = currentPageData.value.map((item) => item.key);
    selectAll.value = currentKeys.every((key) =>
      selectedKeys.value.includes(key)
    );
  },
}));
</script>
