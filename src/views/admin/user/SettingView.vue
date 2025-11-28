<template>
  <a-modal
    v-model:open="dialogVisible"
    title="设置角色"
    :width="500"
    :styles="{ body: { height: '300px' } }"
    :draggable="true"
    @cancel="handleCancel"
    @ok="handleOk"
    :destroyOnClose="true"
  >
    <a-select
      v-model:value="selectedValue"
      placeholder="请选择角色"
      style="width: 100%"
      :options="options"
    />

    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { message } from "ant-design-vue";
import type { SelectProps } from "ant-design-vue";
import RoleRes from "../../../class/RoleRes";
import { getRoles, settingRole } from "../../../http";

const props = defineProps({
  isShow: Boolean,
  uid: String,
});

// 响应式数据 - 改为 string 类型（单选）
const dialogVisible = computed(() => props.isShow);
const selectedValue = ref<string>(""); // 改为 string 类型
const options = ref<SelectProps["options"]>([]);

// 查询参数
const parms = ref({
  Name: "",
  Description: "",
  PageIndex: 1,
  PageSize: 10,
});

// 定义事件
const emits = defineEmits(["closeSettingAdd", "settingSuccess"]);

// 加载角色数据
const loadRoles = async () => {
  try {
    const res = (await getRoles(parms.value)) as any;
    options.value = res.Data.map((item: RoleRes) => ({
      label: item.Name,
      value: item.Id,
    }));
    //console.log("处理后的options:", options.value);
  } catch (error) {
    message.error("加载角色数据失败");
  }
};

// 监听对话框显示状态，显示时加载数据
watch(dialogVisible, (newVal) => {
  if (newVal) {
    loadRoles();
    // 重置选择值
    selectedValue.value = "";
  }
});

// 取消操作
const handleCancel = () => {
  selectedValue.value = "";
  emits("closeSettingAdd");
};

// 确定操作
const handleOk = async () => {
  if (!props.uid) {
    message.warning("用户ID不能为空");
    return;
  }

  if (!selectedValue.value) {
    message.warning("请选择一个角色");
    return;
  }

  try {
    // 注意：settingRole 函数可能需要调整，因为现在传递的是单个 string 而不是 string[]
    const res = (await settingRole(props.uid, selectedValue.value)) as any;
    if (res) {
      message.success("设置角色成功");
      emits("settingSuccess");
      selectedValue.value = "";
    }
  } catch (error) {
    message.error("设置角色失败");
  }
};

// 保持原有函数名兼容性
const close = () => {
  handleCancel();
};

const save = async () => {
  await handleOk();
};
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
