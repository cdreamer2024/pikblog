<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="form.Id ? '修改' : '新增'"
    @cancel="closeAdd"
    @ok="save"
  >
    <a-form :model="form" :rules="rules" ref="formRef" layout="vertical">
      <a-form-item label="名称" name="Name">
        <a-input v-model:value="form.Name" />
      </a-form-item>
      <a-form-item label="路径" name="Index">
        <a-input v-model:value="form.Index" />
      </a-form-item>
      <a-form-item label="图标" name="Icon">
        <a-input v-model:value="form.Icon" />
      </a-form-item>
      <a-form-item label="组件名" name="FilePath">
        <a-input v-model:value="form.FilePath" />
      </a-form-item>
      <a-form-item label="父级" name="ParentId">
        <a-tree-select
          v-model:value="form.ParentId"
          :tree-data="store().UserMenus"
          :field-names="{ value: 'Id', label: 'Name', children: 'Children' }"
          allow-clear
        />
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
import { addMenu, editMenu } from "@/http/index";
import store from "@/store/index";
import Menu from "@/class/Menu";

const props = defineProps<{
  isShow: boolean;
  info: Menu;
}>();

const emit = defineEmits(["closeAdd", "success"]);
const formRef = ref();
const dialogVisible = computed(() => props.isShow);

const form = ref({
  Id: "",
  Name: "",
  Index: "",
  FilePath: "",
  ParentId: "",
  Order: 0,
  IsEnable: false,
  Icon: "",
  Description: "",
});

watch(
  () => props.info,
  (newInfo) => {
    if (newInfo) Object.assign(form.value, newInfo);
  }
);

const rules = {
  Name: [{ required: true, message: "请输入名称" }],
  Index: [{ required: true, message: "请输入路径" }],
  FilePath: [{ required: true, message: "请输入组件名" }],
  Description: [{ required: true, message: "请输入描述" }],
  Order: [{ required: true, message: "请输入排序号" }],
};

const closeAdd = () => {
  formRef.value?.resetFields();
  emit("closeAdd");
};

const save = async () => {
  try {
    await formRef.value?.validate();
    const api = form.value.Id ? editMenu : addMenu;
    const res = await api(form.value);
    if (res) {
      emit("success", form.value.Id ? "修改成功！" : "添加成功！");
    }
  } catch (error) {
    message.error("表单验证失败");
  }
};
</script>
