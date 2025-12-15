<template>
  <a-drawer
    v-model:open="internalVisible"
    title="流程处理记录"
    width="600"
    placement="right"
    :body-style="{ padding: '16px' }"
    destroyOnClose
    @close="closeDrawer"
  >
    <!-- 流程记录表格 -->
    <a-table
      :data-source="flowData"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      size="small"
      bordered
      class="mb-4"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'result'">
          <a-tag :color="getResultColor(record.Result)">
            {{ getResultText(record.Result) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'createTime'">
          {{ formatTime(record.CreateTime) }}
        </template>
      </template>
    </a-table>

    <!-- 提交处理表单 -->
    <div v-if="showSubmit">
      <a-divider>流程处理</a-divider>
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item label="处理意见" name="comment">
          <a-textarea
            v-model:value="formState.comment"
            rows="3"
            allow-clear
            placeholder="请输入处理意见"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting">
              提交处理
            </a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { message, Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { getFlowDetails, GoOnSingle } from "@/http";

const props = defineProps({
  flowId: String,
  showSubmit: { type: Boolean, default: true },
  visible: Boolean,
});

const emit = defineEmits(["close", "submit-success"]);

// v-model:open 正确映射
const internalVisible = computed({
  get: () => props.visible,
  set: (v) => {
    if (!v) emit("close");
  },
});

const loading = ref(false);
const submitting = ref(false);

const flowData = ref([]);
const formRef = ref();
const formState = reactive({ comment: "" });

// 表格列
const columns = [
  { title: "处理人", dataIndex: "Handler", key: "handler", width: 100 },
  { title: "步骤", dataIndex: "Step", key: "step", width: 80 },
  { title: "结果", dataIndex: "Result", key: "result", width: 100 },
  { title: "意见", dataIndex: "Comment", key: "comment", ellipsis: true },
  { title: "时间", dataIndex: "CreateTime", key: "createTime", width: 150 },
];

// 校验规则
const rules = {
  comment: [
    { required: true, message: "请输入处理意见" },
    { max: 200, message: "不能超过200字符" },
  ],
};

// 状态显示
const getResultColor = (r) =>
  ({ PASS: "green", REJECT: "red", RETURN: "orange" }[r] || "default");
const getResultText = (r) =>
  ({ PASS: "通过", REJECT: "拒绝", RETURN: "退回" }[r] || r);
const formatTime = (t) => (t ? dayjs(t).format("MM-DD HH:mm") : "-");

/**
 * 加载流程记录（只有 visible=true 且 flowId 有值才触发）
 */
const loadFlowData = async () => {
  if (!props.flowId) return;
  loading.value = true;

  try {
    const res = await getFlowDetails(props.flowId);
    flowData.value = res || [];
  } catch {
    message.error("加载流程记录失败");
  } finally {
    loading.value = false;
  }
};

// 🔥 关键：监听 Drawer 打开 + flowId 更换
watch(
  () => [props.visible, props.flowId],
  ([v, id]) => {
    if (v && id) loadFlowData();
  }
);

/**
 * 提交处理
 */
const handleSubmit = () => {
  Modal.confirm({
    title: "确认提交",
    content: "确定要提交处理意见吗？",
    onOk: async () => {
      submitting.value = true;

      try {
        const res = await GoOnSingle(props.flowId, formState.comment);
        if (res) {
          message.success(JSON.stringify(res, null, 2));
          formRef.value?.resetFields();
          emit("submit-success");
          closeDrawer();
        } else {
          message.error("提交失败");
        }
      } catch {
        message.error("提交失败");
      } finally {
        submitting.value = false;
      }
    },
  });
};

/**
 * 重置
 */
const handleReset = () => {
  formRef.value?.resetFields();
};

/**
 * 抽屉关闭
 */
const closeDrawer = () => {
  emit("close");
};
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>
