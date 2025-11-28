<template>
  <a-card>
    <a-space style="margin-bottom: 16px">
      <a-input
        v-model:value="searchVal"
        placeholder="请输入菜单名称"
        @change="Search"
        style="width: 200px"
      />
      <a-button type="primary" @click="Search">查询</a-button>
      <a-button type="primary" @click="open">新增</a-button>
    </a-space>

    <a-table
      :dataSource="tableData"
      :columns="columns"
      :pagination="false"
      row-key="Id"
      size="small"
      children-column-name="Children"
      :default-expand-all-rows="true"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'Icon'">
          <IconCom :icon="record.Icon" />
        </template>
        <template v-else-if="column.key === 'IsEnable'">
          <a-switch v-model:checked="record.IsEnable" disabled />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button size="small" @click="handleEdit(record)">编辑</a-button>
          <a-button size="small" danger @click="handleDelete(record)"
            >删除</a-button
          >
        </template>
      </template>
    </a-table>

    <Add
      :isShow="isShow"
      :info="info"
      @closeAdd="closeAdd"
      @success="success"
    />
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import Menu from "@/class/Menu";
import { delMenu, getTreeMenu } from "@/http";
import Add from "./AddView.vue";
import { SettingUserRouter } from "@/tools";

const tableData = ref<Menu[]>([]);
const searchVal = ref("");
const isShow = ref(false);
const info = ref<Menu>(new Menu());

const columns = [
  { title: "排序", dataIndex: "Order", key: "Order", width: 80 },
  { title: "名称", dataIndex: "Name", key: "Name", width: 180 },
  { title: "路径", dataIndex: "Index", key: "Index", width: 100 },
  {
    title: "图标",
    dataIndex: "Icon",
    key: "Icon",
    width: 120,
    align: "center",
  },
  { title: "组件名", dataIndex: "FilePath", key: "FilePath", width: 200 },
  { title: "是否启用", dataIndex: "IsEnable", key: "IsEnable", width: 100 },
  {
    title: "描述",
    dataIndex: "Description",
    key: "Description",
    ellipsis: true,
  },
  { title: "操作", key: "action", width: 150, align: "center" },
];

const load = async () => {
  const parms = {
    Name: searchVal.value,
    Index: "",
    FilePath: "",
    Description: "",
  };
  const response = await getTreeMenu(parms);
  tableData.value = response as unknown as Menu[];
};

onMounted(() => load());
const Search = () => load();
const open = () => (isShow.value = true);
const closeAdd = () => {
  isShow.value = false;
  info.value = new Menu();
};
const handleEdit = (row: Menu) => {
  info.value = row;
  isShow.value = true;
};
const success = async (msg: string) => {
  closeAdd();
  message.success(msg);
  await load();
  await SettingUserRouter();
};
const handleDelete = async (row: Menu) => {
  await delMenu(row.Id);
  await load();
};
</script>
