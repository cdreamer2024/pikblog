<template>
  <a-card>
    <div class="table-operations">
      <a-space>
        <a-input-search
          v-model:value="searchVal"
          placeholder="请输入搜索内容"
          @search="load"
          style="width: 200px"
        />
        <a-button type="primary" @click="load">查询</a-button>
        <a-button type="primary" @click="open">新增</a-button>
        <a-button type="primary" @click="SettingMenu">分配菜单</a-button>
      </a-space>
    </div>

    <a-table
      :dataSource="tableData"
      :pagination="pagination"
      :row-selection="rowSelection"
      :rowKey="(record : RoleRes) => record.Id"
      style="margin-top: 16px"
    >
      <a-table-column key="Order" title="排序" data-index="Order" width="80" />
      <a-table-column key="Name" title="名称" data-index="Name" width="120" />
      <a-table-column key="IsEnable" title="是否启用" width="100">
        <template #default="{ record }">
          <a-switch :checked="record.IsEnable" disabled />
        </template>
      </a-table-column>
      <a-table-column key="Description" title="描述" data-index="Description" />
      <a-table-column
        key="CreateUserName"
        title="创建人"
        data-index="CreateUserName"
        width="80"
      />
      <a-table-column
        key="CreateDate"
        title="创建时间"
        data-index="CreateDate"
      />
      <a-table-column
        key="ModifyUserName"
        title="修改人"
        data-index="ModifyUserName"
        width="80"
      />
      <a-table-column
        key="ModifyDate"
        title="修改时间"
        data-index="ModifyDate"
      />
      <a-table-column
        key="IsDelete"
        title="是否删除"
        data-index="IsDelete"
        width="90"
      />
      <a-table-column key="actions" title="操作" align="center">
        <template #default="{ record }">
          <a-button size="small" @click="handleEdit(record)">编辑</a-button>
          <a-button
            size="small"
            type="link"
            danger
            @click="handleDelete(record)"
            >删除</a-button
          >
        </template>
      </a-table-column>
    </a-table>

    <AddModal
      :isShow="isShow"
      :info="info"
      @closeAdd="closeAdd"
      @success="success"
    />

    <SettingModal
      :isShow="isShow_Set"
      :rid="rid"
      @closeSettingAdd="closeSettingAdd"
      @settingSuccess="settingSuccess"
    />
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import RoleRes from "@/class/RoleRes";
import { delRole, getRoles } from "@/http";
import AddModal from "./AddView.vue";
import SettingModal from "./SettingView.vue";

const tableData = ref<RoleRes[]>([]);
const searchVal = ref("");
const isShow = ref(false);
const isShow_Set = ref(false);
const info = ref<RoleRes>(new RoleRes());
const rid = ref("");
const selectedRowKeys = ref<string[]>([]);

const parms = reactive({
  Name: "",
  Description: "",
  PageIndex: 1,
  PageSize: 10,
});

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  onChange: (page: number) => {
    parms.PageIndex = page;
    load();
  },
});

const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  },
};

const load = async () => {
  const res = (await getRoles(parms)) as any;
  tableData.value = res.Data;
  pagination.total = res.Total;
};

onMounted(() => {
  load();
});

const open = () => {
  isShow.value = true;
};

const closeAdd = () => {
  isShow.value = false;
  info.value = new RoleRes();
};

const handleEdit = (row: RoleRes) => {
  info.value = row;
  isShow.value = true;
};

const success = async (msg: string) => {
  isShow.value = false;
  info.value = new RoleRes();
  message.success(msg);
  await load();
};

const handleDelete = async (row: RoleRes) => {
  await delRole(row.Id);
  await load();
};

const SettingMenu = () => {
  if (selectedRowKeys.value.length === 1) {
    rid.value = selectedRowKeys.value[0];
    isShow_Set.value = true;
  } else if (selectedRowKeys.value.length > 1) {
    message.warning("请单个选择！");
  } else {
    message.warning("请选择需要分配菜单的角色");
  }
};

const closeSettingAdd = () => {
  isShow_Set.value = false;
};

const settingSuccess = async () => {
  isShow_Set.value = false;
  message.success("添加成功");
};
</script>

<style scoped>
.table-operations {
  margin-bottom: 16px;
}
</style>
