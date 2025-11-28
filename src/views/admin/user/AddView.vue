<template>
  <a-modal
    v-model:open="dialogVisible"
    :title="form.Id ? '修改' : '新增'"
    width="30%"
    @cancel="closeAdd"
    @ok="save"
  >
    <a-form :model="form" :label-col="{ span: 6 }" :rules="rules" ref="formRef">
      <!-- 新增用户选择器 -->
      <a-form-item label="关联wis用户">
        <UserSelector @userSelected="handleUserSelected" />
      </a-form-item>

      <a-form-item label="名称" name="Name">
        <a-input v-model:value="form.Name" />
      </a-form-item>
      <a-form-item label="昵称" name="NickName">
        <a-input v-model:value="form.NickName" />
      </a-form-item>
      <a-form-item label="wisid" name="WisId">
        <a-input v-model:value="form.WisUid" />
      </a-form-item>
      <a-form-item label="密码" name="Password">
        <a-input v-model:value="form.Password" />
      </a-form-item>
      <a-form-item label="是否启用" name="IsEnable">
        <a-switch v-model:checked="form.IsEnable" />
      </a-form-item>
      <a-form-item label="描述" name="Description">
        <a-input v-model:value="form.Description" />
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
import { addUser, editUser } from "../../../http/index";
import UserSelector from "@/components/UserSelect.vue"; // 导入用户选择器组件

// 定义用户类型
interface UserInfo {
  UserKey: number;
  UserID: string;
  OrgCode: string;
}

const props = defineProps({
  isShow: Boolean,
  info: Object,
});

const dialogVisible = computed(() => props.isShow);
const formRef = ref();
const form = ref({
  Id: "",
  Name: "",
  NickName: "",
  Password: "",
  IsEnable: false,
  Description: "",
  Image: "",
  WisUid: "",
  WisUkey: "",
  OrgCode: "",
});

// 处理用户选择 - 添加类型注解
const handleUserSelected = (user: UserInfo) => {
  form.value.WisUkey = user.UserKey.toString();
  form.value.WisUid = user.UserID;
  form.value.OrgCode = user.OrgCode;
};

watch(
  () => props.info,
  (newInfo: any) => {
    if (newInfo) form.value = { ...newInfo };
  }
);

const rules = {
  Name: [{ required: true, message: "请输入名称" }],
  Password: [{ required: true, message: "请输入密码" }],
};

const emits = defineEmits(["closeAdd", "success"]);

const closeAdd = () => {
  formRef.value?.resetFields();
  form.value.WisUid = ""; // 清空用户选择
  form.value.WisUkey = "";
  form.value.OrgCode = "";
  emits("closeAdd");
};

const save = async () => {
  try {
    await formRef.value.validate();
    const api = form.value.Id ? editUser : addUser;
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
