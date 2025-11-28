<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="form.Id ? '修改' : '新增'"
    width="30%"
    @cancel="closeAdd"
    @ok="save"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }">
      <a-form-item label="名称" name="Name">
        <a-input v-model:value="form.Name" />
      </a-form-item>
      <a-form-item label="排序" name="Order">
        <a-input-number v-model:value="form.Order" style="width: 100%" />
      </a-form-item>
      <a-form-item label="是否启用" name="IsEnable">
        <a-switch v-model:checked="form.IsEnable" />
      </a-form-item>
      <a-form-item label="描述" name="Description">
        <a-input v-model:value="form.Description" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Form, message } from "ant-design-vue";
import { addRole, editRole } from "@/http/index";
import RoleRes from "@/class/RoleRes";

const props = defineProps<{
  isShow: boolean;
  info: RoleRes;
}>();

const emit = defineEmits<{
  closeAdd: [];
  success: [message: string];
}>();

const dialogVisible = computed(() => props.isShow);
const formRef = ref();
const form = ref({
  Id: "",
  Name: "",
  Order: 0,
  IsEnable: false,
  Description: "",
});

watch(
  () => props.info,
  (newInfo) => {
    if (newInfo) {
      form.value = { ...newInfo };
    }
  }
);

const rules = {
  Name: [{ required: true, message: "请输入名称" }],
  Order: [{ required: true, message: "请输入序号" }],
};

const closeAdd = () => {
  formRef.value?.resetFields();
  emit("closeAdd");
};

const save = async () => {
  try {
    await formRef.value.validate();

    const action = form.value.Id ? editRole(form.value) : addRole(form.value);
    const result = await action;
    if (result) {
      const msg = form.value.Id ? "修改成功！" : "添加成功！";
      emit("success", msg);
    }
  } catch (error) {
    console.log("验证失败", error);
  }
};
</script>
