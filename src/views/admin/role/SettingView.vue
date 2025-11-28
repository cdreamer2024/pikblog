<template>
  <a-modal
    v-model:open="dialogVisible"
    title="设置菜单"
    width="30%"
    style="height: 50vh"
    @cancel="close"
    @ok="save"
  >
    <a-tree-select
      ref="treeRef"
      v-model:value="value"
      :tree-data="store().UserMenus"
      :field-names="{ children: 'Children', label: 'Name', value: 'Id' }"
      :default-value="selectArr"
      tree-checkable
      multiple
      show-checked-strategy="SHOW_ALL"
      style="width: 100%"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import store from "@/store/index";
import { settingMenu } from "@/http";

const props = defineProps<{
  isShow: boolean;
  rid: string;
}>();

const emit = defineEmits<{
  closeSettingAdd: [];
  settingSuccess: [];
}>();

const dialogVisible = computed(() => props.isShow);
const value = ref<string[]>([]);
const treeRef = ref();
const selectArr = ref<string[]>();

const close = () => {
  emit("closeSettingAdd");
};

const save = async () => {
  const mids = value.value.join(",");
  const res = (await settingMenu(props.rid, mids)) as unknown as boolean;
  if (res) {
    emit("settingSuccess");
  }
};
</script>
