<template>
  <a-card class="box-card">
    <div class="table-operations">
      <a-space>
        <a-input
          v-model:value="searchVal"
          placeholder="请输入"
          @change="Search"
          style="width: 200px"
        />
        <a-button type="primary" @click="Search">查询</a-button>
        <a-button type="primary" @click="open">新增</a-button>
      </a-space>
    </div>

    <a-table
      :dataSource="tableData"
      :columns="columns"
      :pagination="pagination"
      :scroll="{ y: '65vh' }"
      bordered
      rowKey="Id"
      :row-selection="rowSelection"
      @change="handleTableChange"
      style="margin-top: 16px"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'Image'">
          <a-image width="40" :src="record.Image || '01.jpeg'" />
        </template>
        <template v-else-if="column.key === 'IsEnable'">
          <a-switch v-model:checked="record.IsEnable" disabled />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" @click="handleEdit(record)">编辑</a-button>
            <a-button
              size="small"
              type="primary"
              danger
              @click="handleDelete(record)"
              >删除</a-button
            >
          </a-space>
        </template>
      </template>
    </a-table>

    <add
      :isShow="isShow"
      :info="info"
      @closeAdd="closeAdd"
      @success="success"
    />
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message, Modal } from "ant-design-vue";
import { delFlowHandler, getFlowHandlers } from "@/http";
import add from "./AddView.vue";

const tableData = ref<any[]>([]);
const total = ref(0);
const searchVal = ref("");
const selectedRowKeys = ref<string[]>([]);

// 根据后端接口添加 PageIndex 和 PageSize 参数
const parms = ref({
  Id: "",
  Office: searchVal.value || "",
  DocType: "",
  IsEnable: true,
  PageIndex: 1,
  PageSize: 10,
  Flex1: "",
  Flex2: "",
  FlowStep: "",
  handler: "",
});

const pagination = computed(() => ({
  current: parms.value.PageIndex,
  pageSize: parms.value.PageSize,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
}));

const columns = [
  { title: "Office", dataIndex: "Office", key: "Office", width: 90 },
  { title: "DocType", dataIndex: "DocType", key: "DocType", width: 90 },
  { title: "FlowStep", dataIndex: "FlowStep", key: "FlowStep", width: 90 },
  { title: "Flex1", dataIndex: "Flex1", key: "Flex1", width: 90 },
  { title: "Flex2", dataIndex: "Flex2", key: "Flex2", width: 120 },
  { title: "Handler", dataIndex: "handler", key: "handler", width: 100 },
  { title: "操作", key: "action", width: 100 },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => (selectedRowKeys.value = keys),
}));

const load = async () => {
  const res = (await getFlowHandlers(parms.value)) as any;
  tableData.value = res.Data;
  total.value = res.Total;
};

onMounted(() => load());

const Search = () => {
  parms.value.Office = searchVal.value;
  parms.value.PageIndex = 1;
  load();
};

// 新增、修改、删除逻辑
const isShow = ref(false);
const info = ref<any>({});

const open = () => (isShow.value = true);
const closeAdd = () => {
  isShow.value = false;
  info.value = {};
};
const handleEdit = (row: any) => {
  info.value = row;
  isShow.value = true;
};
const success = async (msg: string) => {
  isShow.value = false;
  info.value = {};
  message.success(msg);
  await load();
};
const handleDelete = async (row: any) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除吗？`,
    onOk: async () => {
      await delFlowHandler(row.Id);
      message.success("删除成功");
      await load();
    },
  });
};

const handleTableChange = (pag: any) => {
  if (pag) {
    parms.value.PageIndex = pag.current;
    parms.value.PageSize = pag.pageSize;
    load();
  }
};
</script>

<style scoped>
.box-card {
  margin: 16px;
}
.table-operations {
  margin-bottom: 16px;
}
</style>
