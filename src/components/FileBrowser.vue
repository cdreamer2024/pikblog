<template>
  <div class="file-browser">
    <!-- 标题和操作栏 -->
    <div class="file-header">
      <div class="header-left">
        <span class="title">{{ title }}</span>
        <a-tag color="blue">共 {{ fileList.length }} 个文件</a-tag>
      </div>
      <div class="header-actions">
        <a-upload
          :before-upload="beforeUpload"
          :show-upload-list="false"
          :multiple="true"
        >
          <a-button type="primary">
            <UploadOutlined />
            上传文件
          </a-button>
        </a-upload>
        <a-button @click="refreshFileList" :loading="loading">
          <ReloadOutlined />
          刷新
        </a-button>
      </div>
    </div>

    <!-- 上传队列 -->
    <div v-if="uploadFileList.length > 0" class="upload-section">
      <h4>上传队列 ({{ uploadingCount }}/{{ uploadFileList.length }})</h4>
      <a-list size="small" :data-source="uploadFileList">
        <template #renderItem="{ item }">
          <a-list-item>
            <template #actions>
              <a
                @click="removeUploadFile(item)"
                :disabled="item.status === 'uploading'"
              >
                取消
              </a>
            </template>
            <a-list-item-meta :description="formatFileSize(item.size)">
              <template #title>
                <div class="file-title">
                  <a-spin v-if="item.status === 'uploading'" size="small" />
                  <FileOutlined v-else />
                  {{ item.name }}
                  <a-tag
                    v-if="item.status === 'uploading'"
                    color="blue"
                    size="small"
                  >
                    上传中
                  </a-tag>
                  <a-tag
                    v-else-if="item.status === 'done'"
                    color="green"
                    size="small"
                  >
                    完成
                  </a-tag>
                </div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
      <div class="upload-actions">
        <a-button
          type="primary"
          :loading="uploading"
          @click="handleUpload"
          :disabled="uploadFileList.length === 0"
        >
          开始上传
        </a-button>
        <a-button @click="clearUploadList" :disabled="uploadingCount > 0">
          清空队列
        </a-button>
      </div>
    </div>

    <!-- 文件列表 -->
    <a-table
      :columns="columns"
      :data-source="fileList"
      rowKey="name"
      :loading="loading"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="file-name-cell">
            <FileOutlined v-if="!record.IsDirectory" />
            <FolderOutlined v-else />
            <a
              :href="getFileUrl(record.Name)"
              target="_blank"
              class="file-link"
            >
              {{ record.Name }}
            </a>
          </div>
        </template>

        <template v-if="column.key === 'size'">
          {{ formatFileSize(record.Size) }}
        </template>

        <template v-if="column.key === 'operation'">
          <a-button type="link" @click="downloadFile(record)" size="small">
            <DownloadOutlined />
            下载
          </a-button>
          <a-popconfirm
            title="确定要删除这个文件吗？"
            @confirm="deleteFile(record)"
            okText="确定"
            cancelText="取消"
          >
            <a-button type="link" danger size="small">
              <DeleteOutlined />
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <!-- 空状态 -->
    <a-empty
      v-if="!loading && fileList.length === 0"
      description="暂无文件"
      style="margin-top: 40px"
    >
      <a-button type="primary" @click="beforeUpload">
        <UploadOutlined />
        上传文件
      </a-button>
    </a-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import request from "@/utils/request";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileOutlined,
  FolderOutlined,
} from "@ant-design/icons-vue";

interface FileItem {
  Name: string;
  IsDirectory: boolean;
  Size?: number;
}

interface UploadFileItem {
  uid: string;
  name: string;
  size: number;
  file: File;
  status: "waiting" | "uploading" | "done" | "error";
}

interface Props {
  title: string;
  baseUrl: string;
  uploadMode: number;
  recordId: string | number;
}

const props = defineProps<Props>();

// 状态
const fileList = ref<FileItem[]>([]);
const loading = ref(false);
const uploading = ref(false);
const uploadFileList = ref<UploadFileItem[]>([]);

// 表格列
const columns = [
  {
    title: "文件名",
    key: "name",
    ellipsis: true,
  },
  {
    title: "大小",
    key: "size",
    align: "right" as const,
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right" as const, // 固定到右侧
  },
];

// 计算属性
const uploadingCount = computed(() => {
  return uploadFileList.value.filter((file) => file.status === "uploading")
    .length;
});

// API 调用
const loadFileList = async () => {
  loading.value = true;
  try {
    const res = await request.post("/file/list", {
      recordId: props.recordId,
      folder: props.title,
    });

    // 根据实际数据结构调整
    if (res.data.IsSuccess) {
      fileList.value = res.data.Result.files || [];
    } else {
      message.error(res.data.Msg || "加载文件列表失败");
    }
  } catch (error) {
    console.error("加载文件列表失败:", error);
    message.error("加载文件列表失败");
  } finally {
    loading.value = false;
  }
};

// 上传功能
const beforeUpload = (file: File) => {
  const uploadFile: UploadFileItem = {
    uid: Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: file.size,
    file: file,
    status: "waiting",
  };

  uploadFileList.value.push(uploadFile);
  message.info(`"${file.name}" 已添加到上传队列`);
  return false;
};

const handleUpload = async () => {
  if (uploadFileList.value.length === 0) return;

  uploading.value = true;

  try {
    for (const uploadFile of uploadFileList.value) {
      if (uploadFile.status === "waiting") {
        uploadFile.status = "uploading";

        const formData = new FormData();
        formData.append("file", uploadFile.file);
        formData.append("folder", props.title);
        formData.append("recordId", String(props.recordId));

        await request.post("/file/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadFile.status = "done";
        message.success(`"${uploadFile.name}" 上传成功`);
      }
    }

    await loadFileList();
  } catch (error) {
    console.error("文件上传失败:", error);
    message.error("文件上传失败");
  } finally {
    uploading.value = false;
  }
};

const removeUploadFile = (file: UploadFileItem) => {
  if (file.status === "uploading") {
    message.warning("文件正在上传中，无法取消");
    return;
  }
  const index = uploadFileList.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    uploadFileList.value.splice(index, 1);
  }
};

const clearUploadList = () => {
  uploadFileList.value = uploadFileList.value.filter(
    (file) => file.status === "uploading"
  );
};

// 文件操作
const getFileUrl = (fileName: string) => {
  return `${props.baseUrl}/${fileName}`;
};

const downloadFile = async (file: FileItem) => {
  if (file.IsDirectory) {
    message.info("文件夹不支持下载");
    return;
  }

  try {
    const response = await request.post(
      "/file/download",
      {
        RecordId: props.recordId,
        Folder: props.title,
        FileName: file.Name,
      },
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file.Name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    message.success("文件下载成功");
  } catch (error) {
    console.error("文件下载失败:", error);
    message.error("文件下载失败");
  }
};

const deleteFile = async (file: FileItem) => {
  try {
    await request.post("/file/delete", {
      RecordId: props.recordId,
      Folder: props.title,
      FileName: file.Name,
    });

    message.success("文件删除成功");
    await loadFileList();
  } catch (error) {
    console.error("文件删除失败:", error);
    message.error("文件删除失败");
  }
};

const refreshFileList = async () => {
  await loadFileList();
  message.success("文件列表已刷新");
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

onMounted(() => {
  loadFileList();
});
</script>

<style scoped>
.file-browser {
  height: 100%;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.upload-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.upload-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-link {
  color: #1890ff;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}
</style>
