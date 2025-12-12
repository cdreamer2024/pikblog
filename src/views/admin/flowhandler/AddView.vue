<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="form.Id ? '修改' : '新增'"
    width="30%"
    @cancel="closeAdd"
    @ok="save"
  >
    <a-form :model="form" :label-col="{ span: 6 }" :rules="rules" ref="formRef">
      <a-form-item label="关联wis用户">
        <UserSelector @userSelected="handleUserSelected" />
      </a-form-item>
      <a-form-item label="Office" name="Office">
        <a-input v-model:value="form.Office" />
      </a-form-item>
      <a-form-item label="Type" name="Type">
        <a-input v-model:value="form.DocType" />
      </a-form-item>
      <a-form-item label="FlowStep" name="FlowStep">
        <a-input v-model:value="form.FlowStep" />
      </a-form-item>
      <a-form-item label="Flex1" name="Flex1">
        <a-input v-model:value="form.Flex1" />
      </a-form-item>
      <a-form-item label="Flex2" name="Flex2">
        <a-input v-model:value="form.Flex2" />
      </a-form-item>
      <a-form-item label="Handler" name="Handler">
        <a-input v-model:value="form.handler" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="closeAdd">取消</a-button>
      <a-button type="primary" @click="save">确定</a-button>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import { message } from "ant-design-vue";
import { addFlowHandler, editFlowHandler } from "@/http/index";
import UserSelector from "@/components/UserSelect.vue";
// 定义用户类型
interface UserInfo {
  UserKey: number;
  UserID: string;
  OrgCode: string;
  Office: string;
}

const props = defineProps({
  isShow: Boolean,
  info: Object,
});

const dialogVisible = computed(() => props.isShow);
const formRef = ref();
const form = ref({
  Id: "",
  Office: "",
  DocType: "",
  IsEnable: true,
  Flex1: "0",
  Flex2: "0",
  FlowStep: "",
  handler: "",
});

watch(
  () => props.info,
  (newInfo: any) => {
    if (newInfo) form.value = { ...newInfo };
  }
);

const handleUserSelected = (user: UserInfo) => {
  form.value.handler = user.UserID.toString();
  form.value.Office = user.Office.toString();
};

const rules = {
  Office: [{ required: true, message: "请输入Office" }],
  DocType: [{ required: true, message: "DocType" }],
};

const emits = defineEmits(["closeAdd", "success"]);

const closeAdd = () => {
  formRef.value?.resetFields();
  emits("closeAdd");
};

const save = async () => {
  try {
    await formRef.value.validate();
    const api = form.value.Id ? editFlowHandler : addFlowHandler;
    const res = await api(form.value);
    if (res) {
      message.success(form.value.Id ? "修改成功！" : "添加成功！");
      emits("success", form.value.Id ? "修改成功！" : "添加成功！");
    }
  } catch (error) {
    console.log("error submit!", error);
  }
};
</script>
