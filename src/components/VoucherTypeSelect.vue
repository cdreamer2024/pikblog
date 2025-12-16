<template>
  <a-select
    show-search
    v-model:value="selectedValue"
    :placeholder="placeholder"
    :filter-option="false"
    :options="filteredOptions"
    @search="handleSearch"
    @change="handleChange"
    :loading="loading"
    allow-clear
  >
    <template #option="{ label }">
      <span>{{ label }}</span>
    </template>
  </a-select>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request";

interface Props {
  placeholder?: string;
  value?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "请选择类型",
  value: undefined,
});

const emit = defineEmits<{
  "update:value": [value: string | undefined];
  change: [value: string | undefined];
}>();

const selectedValue = ref<string | undefined>(props.value);
const typeList = ref<string[]>([]);
const searchText = ref("");
const loading = ref(false);

watch(
  () => props.value,
  (newVal) => {
    selectedValue.value = newVal;
  }
);

const filteredOptions = computed(() => {
  return typeList.value
    .filter((type) =>
      type.toLowerCase().includes(searchText.value.toLowerCase())
    )
    .map((type) => ({
      value: type,
      label: type,
    }));
});

const handleSearch = (value: string) => {
  searchText.value = value;
};

const handleChange = (value: string | undefined) => {
  emit("update:value", value);
  emit("change", value);
};

const fetchTypeList = async () => {
  loading.value = true;
  try {
    const res = await request.get("/ComInfo/VoucherType", {
      params: { mode: 0 },
    });

    typeList.value = res.data.Result || [];
  } catch (error) {
    console.error("获取类型列表失败:", error);
    typeList.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTypeList();
});
</script>
