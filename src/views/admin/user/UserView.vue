<template>
  <a-card class="box-card">
    <div class="table-operations">
      <a-space>
        <a-input
          v-model:value="searchVal"
          placeholder="请输入用户名或昵称"
          @change="Search"
          style="width: 200px"
        />
        <a-button type="primary" @click="Search">查询</a-button>
        <a-button type="primary" @click="open">新增</a-button>
        <a-button type="primary" @click="openSet">设置角色</a-button>
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
    <setting
      :isShow="isShow_Set"
      :uid="uid"
      @closeSettingAdd="closeSettingAdd"
      @settingSuccess="settingSuccess"
    />
  </a-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message, Modal } from "ant-design-vue";
import { delUser, getUsers } from "../../../http";
import add from "./AddView.vue";
import setting from "./SettingView.vue";

const tableData = ref<any[]>([]);
const total = ref(0);
const searchVal = ref("");
const selectedRowKeys = ref<string[]>([]);

// 根据后端接口添加 PageIndex 和 PageSize 参数
const parms = ref({
  Name: searchVal.value || "",
  NickName: searchVal.value || "",
  Description: "",
  PageIndex: 1,
  PageSize: 10,
});

const pagination = computed(() => ({
  current: parms.value.PageIndex,
  pageSize: parms.value.PageSize,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
}));

const columns = [
  { title: "名称", dataIndex: "Name", key: "Name", width: 90 },
  { title: "昵称", dataIndex: "NickName", key: "NickName", width: 90 },
  { title: "头像", dataIndex: "Image", key: "Image", width: 90 },
  { title: "wisid", dataIndex: "WisUid", key: "WisUid", width: 90 },
  { title: "密码", dataIndex: "Password", key: "Password", width: 120 },
  { title: "角色", dataIndex: "RoleName", key: "RoleName", width: 100 },
  { title: "是否启用", dataIndex: "IsEnable", key: "IsEnable", width: 100 },
  { title: "描述", dataIndex: "Description", key: "Description" },
  {
    title: "创建人",
    dataIndex: "CreateUserName",
    key: "CreateUserName",
    width: 80,
  },
  { title: "创建时间", dataIndex: "CreateDate", key: "CreateDate" },
  {
    title: "修改人",
    dataIndex: "ModifyUserName",
    key: "ModifyUserName",
    width: 80,
  },
  { title: "修改时间", dataIndex: "ModifyDate", key: "ModifyDate" },
  { title: "是否删除", dataIndex: "IsDelete", key: "IsDelete", width: 90 },
  { title: "操作", key: "action", align: "center" },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => (selectedRowKeys.value = keys),
}));

const load = async () => {
  const res = (await getUsers(parms.value)) as any;
  tableData.value = res.Data;
  total.value = res.Total;
};

onMounted(() => load());

const Search = () => {
  parms.value.Name = searchVal.value;
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
    content: `确定要删除用户 "${row.Name}" 吗？`,
    onOk: async () => {
      await delUser(row.Id);
      message.success("删除成功");
      await load();
    },
  });
};

// 设置角色逻辑
const isShow_Set = ref(false);
const uid = ref("");
const openSet = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning("请选择一个需要分配的用户");
  } else if (selectedRowKeys.value.length > 1) {
    message.warning("请选择【一个】需要分配的用户");
  } else {
    uid.value = selectedRowKeys.value[0];
    isShow_Set.value = true;
  }
};
const closeSettingAdd = () => {
  isShow_Set.value = false;
  uid.value = "";
};
const settingSuccess = async () => {
  isShow_Set.value = false;
  uid.value = "";
  await load();
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
