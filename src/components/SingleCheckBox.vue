<template>
  <div>
    <a-checkbox
      v-model:checked="state.checkAll"
      :indeterminate="state.indeterminate"
      @change="onCheckAllChange"
    >
      全选
    </a-checkbox>
    <a-divider />
    <a-checkbox-group
      v-model:value="state.checkedList"
      :options="plainOptions"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, toRefs } from "vue";

interface Props {
  plainOptions: string[]; // 所有选项
  checkedList: string[]; // 默认选中项
}

const props = defineProps<Props>();
const { plainOptions, checkedList: initialCheckedList } = toRefs(props);

const state = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: initialCheckedList.value, // 初始化来自父组件
});

// 全选/取消全选
const onCheckAllChange = (e: { target: { checked: boolean } }) => {
  state.checkedList = e.target.checked ? plainOptions.value : [];
  state.indeterminate = false;
};

// 监听选中项变化
watch(
  () => state.checkedList,
  (val) => {
    state.indeterminate =
      val.length > 0 && val.length < plainOptions.value.length;
    state.checkAll = val.length === plainOptions.value.length;
  }
);

// 向父组件暴露选中状态（可选）
defineExpose({
  getCheckedList: () => state.checkedList,
});
</script>
