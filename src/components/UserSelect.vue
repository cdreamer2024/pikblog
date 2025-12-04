<template>
  <a-select
    show-search
    v-model:value="selectedValue"
    placeholder="搜索用户"
    :filter-option="false"
    :options="options"
    @search="handleSearch"
    @change="handleChange"
  >
    <template #option="{ label }">
      {{ label }}
    </template>
  </a-select>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";

interface UserInfo {
  UserKey: number;
  UserID: string;
  OrgCode: string;
}

const selectedValue = ref();
const userList = ref<UserInfo[]>([]);
const searchText = ref("");

const emit = defineEmits(["userSelected"]);

const options = computed(() =>
  userList.value
    .filter((user) =>
      `${user.UserKey}-${user.UserID}-${user.OrgCode}`
        .toLowerCase()
        .includes(searchText.value.toLowerCase())
    )
    .map((user) => ({
      value: user.UserKey,
      label: `${user.UserKey}-${user.UserID}-${user.OrgCode}`,
      data: user,
    }))
);

const handleSearch = (value: string) => {
  searchText.value = value;
};

const handleChange = (_value: number, option: any) => {
  emit("userSelected", option.data);
};

const fetchData = async () => {
  try {
    console.log("开始请求用户列表...");
    const res = await request.post("/Wis/GetUserList");
    userList.value = res.data.Result || [];
  } catch (error) {
    console.error("获取用户列表失败:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>
