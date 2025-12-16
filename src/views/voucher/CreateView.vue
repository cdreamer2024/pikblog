<template>
  <div>
    <!-- 查询条件区域 -->
    <div style="margin-bottom: 16px">
      <a-space>
        <!-- 日期选择框 -->
        <a-date-picker
          v-model:value="selectedFromDate"
          placeholder="Fromdate"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 200px"
        />

        <a-date-picker
          v-model:value="selectedToDate"
          placeholder="Todate"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 200px"
        />
        DocNum:
        <a-input v-model:value="docNumber" />
        Office:
        <a-select
          v-model:value="selectedOffice"
          placeholder="Office"
          style="width: 200px"
          :options="officeOptions"
        />
        Type:
        <!-- 类型选择框 -->
        <a-select
          v-model:value="selectedType"
          placeholder="Type"
          style="width: 200px"
          :options="typeOptions"
        />
        Match:
        <!-- 匹配选择框 -->
        <a-select
          v-model:value="selectedMatch"
          placeholder="match"
          style="width: 200px"
          :options="matchOptions"
        />

        <!-- 查询按钮 -->
        <a-button type="primary" @click="handleSearch">查询</a-button>

        <!-- 提交到下一级按钮 -->
        <a-button type="primary" @click="handleNextStep">提交到下一级</a-button>
      </a-space>
    </div>

    <!-- 表格 - 简化配置 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :row-selection="rowSelection"
      :pagination="pagination"
      @change="handleTableChange"
      :resize-observer="false"
      size="middle"
      rowKey="Id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <a-button type="link" @click="openDrawer(record.Id)">详情</a-button>
          <a-button type="link" @click="handleDetail(record)">文件</a-button>
          <a-button type="link" @click="preview(record)">预览</a-button>
        </template>
      </template>
    </a-table>

    <!-- 详情下拉悬浮框 -->
    <a-drawer
      :destroyOnClose="true"
      v-model:visible="detailVisible"
      :title="`文件管理 - ${currentRecordId}`"
      placement="right"
      width="800"
      :maskClosable="false"
    >
      <FileManager :record-id="currentRecordId" />
    </a-drawer>
    <FlowHandlerDetails
      :visible="showDrawer"
      :flowId="currentFlowId"
      @close="showDrawer = false"
      @submit-success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from "vue";
import { Modal, message } from "ant-design-vue";
import type { TableColumnsType, TablePaginationConfig } from "ant-design-vue";
import FileManager from "@/components/FileManage.vue";
import FlowHandlerDetails from "@/components/FlowHandlerDetails.vue";
import request from "@/utils/request";
import { GoOn, getOffice, getVoucherType } from "@/http";

// 类型定义
interface DataItem {
  Id: string;
  DocType: string;
  Office: string;
  GLTDocNmber: string;
  GLDate: string;
  YY: string;
  GLTCurrency: string;
  DRBase: string;
  CRBase: string;
  BankFlag: string;
  FlowStatus: string;
  MatchStatus: string;
  CurruntUser: string;
  Flex1: string;
}

// 表格列定义
const columns: TableColumnsType = [
  { title: "文件类型", dataIndex: "DocType", key: "DocType" },
  { title: "OFFICE", dataIndex: "Office", key: "Office" },
  { title: "GLTDocNmber", dataIndex: "GLTDocNmber", key: "GLTDocNmber" },
  { title: "GLDate", dataIndex: "GLDate", key: "GLDate" },
  { title: "YY", dataIndex: "YY", key: "YY" },
  { title: "GLTCurrency", dataIndex: "GLTCurrency", key: "GLTCurrency" },
  { title: "DRBase", dataIndex: "DRBase", key: "DRBase" },
  { title: "CRBase", dataIndex: "CRBase", key: "CRBase" },
  { title: "BankFlag", dataIndex: "BankFlag", key: "BankFlag" },
  // { title: "FlowStatus", dataIndex: "FlowStatus", key: "FlowStatus" },
  { title: "MatchStatus", dataIndex: "MatchStatus", key: "MatchStatus" },
  // { title: "CurruntUser", dataIndex: "CurruntUser", key: "CurruntUser" },
  { title: "Flex1", dataIndex: "Flex1", key: "Flex1" },
  { title: "操作", key: "operation" },
];

// 响应式数据
const selectedFromDate = ref<string>("");
const selectedToDate = ref<string>("");
const selectedType = ref<string>("");
const selectedMatch = ref<string>("");
const selectedOffice = ref<string>("");
const docNumber = ref<string>("");
const loading = ref(false);
const tableData = ref<DataItem[]>([]);
const selectedKeys = ref<string[]>([]);
const detailVisible = ref(false);
const showDrawer = ref(false);
//详情
const openDrawer = (flowId: string) => {
  console.log("打开详情抽屉，flowId:", flowId);
  console.log(
    "对应记录:",
    tableData.value.find((item) => item.Id === flowId)
  );
  currentFlowId.value = flowId;
  showDrawer.value = true;
};

const handleSuccess = () => {
  message.success("提交成功");
  loadvoucherList();
};
const currentRecordId = ref<string>("");
const currentFlowId = ref<string>("");
const total = ref(0);

// 下拉选项数据
const typeOptions = ref<{ label: string; value: string }[]>([
  { label: "全部", value: "" },
]);
const officeOptions = ref<{ label: string; value: string }[]>([
  { label: "全部", value: "" },
]);
const matchOptions = ref([
  { label: "全部", value: "" },
  { label: "已匹配", value: "1" },
  { label: "未匹配", value: "0" },
]);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
});

// 加载下拉选项
const loadOptions = async () => {
  try {
    // 获取类型选项
    const typeRes = await getVoucherType();
    console.log("typeRes:", typeRes);

    if (Array.isArray(typeRes)) {
      typeOptions.value = [
        { label: "全部", value: "" },
        ...typeRes.map((item: string) => ({
          label: item,
          value: item,
        })),
      ];
    }

    // 获取办公室选项
    const officeRes = await getOffice();
    console.log("officeRes:", officeRes);

    if (Array.isArray(officeRes)) {
      officeOptions.value = [
        { label: "全部", value: "" },
        ...officeRes.map((item: string) => ({
          label: item,
          value: item,
        })),
      ];
    }
  } catch (error) {
    console.error("加载选项失败:", error);
    // 静默失败，不显示错误信息
  }
};

// 构建请求参数的函数
const buildRequestParams = () => {
  return {
    OFFICE: selectedOffice.value || "",
    Type: selectedType.value || "",
    GL_Date_From: selectedFromDate.value || "",
    GL_Date_To: selectedToDate.value || "",
    Flow_Status: "",
    Match_Status: selectedMatch.value || "",
    DocName: docNumber.value || "",
    User: "",
    PageIndex: pagination.current,
    PageSize: pagination.pageSize,
  };
};

const loadvoucherList = async () => {
  loading.value = true;
  try {
    const requestParams = buildRequestParams();
    const res = await request.post("/VoucherData/GetVouchers", requestParams);
    if (res.data.IsSuccess) {
      tableData.value = res.data.Result.Data || [];
      total.value = res.data.Result.Total;
      pagination.total = total.value;
    } else {
      message.error(res.data.Msg || "加载数据列表失败");
    }
  } catch (error) {
    message.error("加载数据列表失败");
  } finally {
    loading.value = false;
  }
};

// 分页器变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  if (pag) {
    // 更新分页器状态
    pagination.current = pag.current || 1;
    pagination.pageSize = pag.pageSize || 10;

    // 重新加载数据
    loadvoucherList();
  }
};

// 查询
const handleSearch = () => {
  // 重置到第一页
  pagination.current = 1;
  loadvoucherList();
};

// 下一步
const handleNextStep = async () => {
  if (selectedKeys.value.length === 0) {
    message.warning("请至少选择一项");
    return;
  }

  try {
    const result = await GoOn(selectedKeys.value);
    if (result)
      Modal.info({
        title: "结果",
        content: JSON.stringify(result, null, 2),
        okText: "确认",
      });
  } catch {
    message.error("请求出错");
  }
  loadvoucherList();
};

// 文件
const handleDetail = (record: DataItem) => {
  currentRecordId.value = record.GLTDocNmber;
  detailVisible.value = true;
};

// 预览/下载合并的PDF
const preview = async (record: DataItem) => {
  try {
    loading.value = true;

    // 调用合并PDF的API
    const response = await request({
      url: "File/MergeFile",
      method: "POST",
      params: {
        name: record.GLTDocNmber,
      },
      responseType: "blob", // 重要：指定响应类型为blob
      timeout: 60000, // 设置超时时间为60秒，因为合并PDF可能需要时间
    });

    // 创建blob对象
    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob);

    // 创建隐藏的a标签
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${record.GLTDocNmber}_merge.pdf`;
    link.style.display = "none";

    // 添加到DOM并触发点击
    document.body.appendChild(link);
    link.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }, 100);

    message.success("文件下载开始");
  } catch (error: any) {
    console.error("下载失败:", error);

    // 尝试读取错误信息（如果是JSON格式）
    if (error.response?.data?.type?.includes("application/json")) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string);
          message.error(errorData.Msg || "下载失败");
        } catch {
          message.error("下载失败");
        }
      };
      reader.readAsText(error.response.data);
    } else {
      message.error("下载失败");
    }
  } finally {
    loading.value = false;
  }
};
// 行选择
const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: string[]) => (selectedKeys.value = keys),
}));

// 初始化
onMounted(() => {
  loadvoucherList();
  loadOptions();
});
</script>
