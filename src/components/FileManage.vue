<template>
  <div class="file-manager">
    <a-layout style="background: #fff; height: 600px">
      <!-- 左侧文件夹列表 -->
      <a-layout-sider width="250" class="folder-sider">
        <div class="folder-title">文件管理</div>
        <a-menu mode="inline" :selectedKeys="[activeTab]" @click="onTabSelect">
          <a-menu-item key="invoice">
            <FileTextOutlined />
            发票
          </a-menu-item>
          <a-menu-item key="receipt">
            <FileTextOutlined />
            回单
          </a-menu-item>
          <a-menu-item key="attach">
            <FolderOpenOutlined />
            其它附件
          </a-menu-item>
        </a-menu>
      </a-layout-sider>

      <!-- 右侧内容区域 -->
      <a-layout-content style="padding: 16px">
        <!-- invoice -->
        <FileBrowser
          v-if="activeTab === 'invoice'"
          title="invoice"
          :base-url="`/${recordId}/invoice`"
          :upload-mode="UploadMode.invoice"
          :record-id="recordId"
        />

        <!-- receipt -->
        <FileBrowser
          v-if="activeTab === 'receipt'"
          title="receipt"
          :base-url="`/${recordId}/receipt`"
          :upload-mode="UploadMode.receipt"
          :record-id="recordId"
        />

        <!-- attach -->
        <FileBrowser
          v-if="activeTab === 'attach'"
          title="attach"
          :base-url="`/${recordId}/attach`"
          :upload-mode="UploadMode.attach"
          :record-id="recordId"
        />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FileTextOutlined, FolderOpenOutlined } from "@ant-design/icons-vue";
import FileBrowser from "./FileBrowser.vue";

interface Props {
  recordId: string | number;
}

const props = defineProps<Props>();

enum UploadMode {
  invoice = 0,
  receipt = 1,
  attach = 2,
}

const activeTab = ref<string>("invoice");

const onTabSelect = (e: any) => {
  activeTab.value = e.key;
};
</script>

<style scoped>
.folder-sider {
  background: #f8f8f8;
  padding-top: 16px;
  border-right: 1px solid #e8e8e8;
}
.folder-title {
  padding: 0 16px 8px;
  font-weight: bold;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 8px;
}
</style>
