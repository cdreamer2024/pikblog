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
  placeholder: "请选择流程步骤",
  value: undefined,
});

const emit = defineEmits<{
  "update:value": [value: string | undefined];
  change: [value: string | undefined];
}>();

const selectedValue = ref<string | undefined>(props.value);
const flowStepList = ref<string[]>([]);
const searchText = ref("");
const loading = ref(false);

watch(
  () => props.value,
  (newVal) => {
    selectedValue.value = newVal;
  }
);

const filteredOptions = computed(() => {
  return flowStepList.value
    .filter((step) =>
      step.toLowerCase().includes(searchText.value.toLowerCase())
    )
    .map((step) => ({
      value: step,
      label: step,
    }));
});

const handleSearch = (value: string) => {
  searchText.value = value;
};

const handleChange = (value: string | undefined) => {
  emit("update:value", value);
  emit("change", value);
};

const fetchFlowStepList = async () => {
  loading.value = true;
  try {
    const res = await request.get("/ComInfo/FlowStep", {
      params: { mode: 0 },
    });

    flowStepList.value = res.data.Result || [];
  } catch (error) {
    console.error("获取流程步骤列表失败:", error);
    flowStepList.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFlowStepList();
});
</script>
