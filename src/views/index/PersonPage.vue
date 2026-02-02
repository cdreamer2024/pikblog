<template>
  <a-row :gutter="16">
    <a-col :span="12">
      <a-card title="个人信息设置">
        <a-form :model="form" layout="vertical">
          <a-form-item label="用户名">
            <a-input v-model:value="form.NickName" />
          </a-form-item>

          <a-form-item label="密码">
            <a-input-password v-model:value="form.Password" />
          </a-form-item>

          <a-form-item label="签章">
            <a-upload
              list-type="picture-card"
              :show-upload-list="false"
              :action="fromAction"
              :headers="{
                Authorization: 'Bearer ' + store().Token,
              }"
              :before-upload="beforeAvatarUpload"
              @change="handleAvatarChange"
            >
              <img
                v-if="imageUrl"
                :src="imageUrl"
                alt="avatar"
                style="width: 100%"
              />
              <div v-else>
                <plus-outlined />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="onSubmit">保存</a-button>
            <a-button style="margin-left: 8px">取消</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>

    <a-col :span="12">
      <a-card title="注意事项">
        <p style="color: #ff4d4f">请谨慎修改密码</p>
        <p>xxxxxxxxxx</p>
        <p>xxxxxxxxxxxx</p>
        <p>......</p>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import store from "../../store/index";
import { editPersonInfo } from "../../http/index";
import { FormatToken } from "../../tools";

const form = reactive({
  NickName: FormatToken(store().Token)?.NickName,
  Password: "",
  Image: FormatToken(store().Token)?.Image,
  uploadMode: "1",
});

const imageUrl = ref(form.Image);
const fromAction = ref(
  "http://10.140.2.11/evcr/api/File/uploadavata" // + form.uploadMode
);

const beforeAvatarUpload = (file: File) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("只能上传 JPG/PNG 格式的图片!");
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < 5;
  if (!isLt2M) {
    message.error("图片大小不能超过 5MB!");
    return false;
  }

  return true;
};

const handleAvatarChange = (info: any) => {
  if (info.file.status === "done") {
    const response = info.file.response;
    if (form.uploadMode == "1") {
      form.Image = `http://10.140.2.11/evcr/static/${response.Result}`;
    } else {
      form.Image = `https://xxxx.xxxx.xxx/${response.Result}`;
    }
    imageUrl.value = form.Image;
  }
};

const onSubmit = async () => {
  const res = (await editPersonInfo(form)) as any as boolean;
  if (res) {
    message.success("修改成功！");
  } else {
    message.error("修改失败，请联系系统管理员！");
  }
};
</script>

<style scoped>
.ant-card {
  margin-bottom: 16px;
}
</style>
