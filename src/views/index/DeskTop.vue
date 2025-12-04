<template>
  <a-card>
    <a-calendar v-model:value="value">
      <template #dateCellRender="{ current }">
        <div class="calendar-cell" @click="settingTodo(current)">
          <div class="cell-date">{{ current.date() }}</div>
          <div class="cell-todo">
            {{ readTodo(current.format("YYYY-MM-DD")) }}
          </div>
        </div>
      </template>
    </a-calendar>

    <a-modal
      v-model:open="dialogVisible"
      title="添加待办项"
      width="400px"
      @cancel="cancel"
      @ok="submit"
      :confirm-loading="confirmLoading"
    >
      <a-form :model="form" ref="formRef">
        <a-form-item label="要做的事" name="todo" :label-col="{ span: 6 }">
          <a-input v-model:value="form.todo" placeholder="请输入待办事项" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";

interface TodoItem {
  day: string;
  todo: string;
}

// 使用 Dayjs 类型
const value = ref<Dayjs>(dayjs());
const dialogVisible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
const formRef = ref<FormInstance>();

const form = reactive({
  day: "",
  todo: "",
});

const todoList = ref<TodoItem[]>([
  {
    day: "2024-10-08",
    todo: "aaaaaaaaaaaa",
  },
  {
    day: "2024-10-09",
    todo: "aaaaaaaaaaa",
  },
  {
    day: "2024-10-10",
    todo: "aaaaaaaaaaa",
  },
  {
    day: "2024-10-11",
    todo: "aaaaaaaaaa",
  },
]);

const readTodo = (day: string): string => {
  const item = todoList.value.find((p) => p.day === day);
  return item?.todo || "";
};

const settingTodo = (date: Dayjs) => {
  const dayStr = date.format("YYYY-MM-DD");
  dialogVisible.value = true;
  form.day = dayStr;

  const existingTodo = todoList.value.find((p) => p.day === dayStr);
  form.todo = existingTodo?.todo || "";
};

const submit = async () => {
  try {
    confirmLoading.value = true;

    const existingIndex = todoList.value.findIndex((p) => p.day === form.day);

    if (existingIndex === -1) {
      // 新增
      todoList.value.push({
        day: form.day,
        todo: form.todo,
      });
      message.success("添加成功");
    } else {
      // 更新
      todoList.value[existingIndex].todo = form.todo;
      message.success("更新成功");
    }

    dialogVisible.value = false;
    formRef.value?.resetFields();
  } catch (error) {
    message.error("操作失败");
  } finally {
    confirmLoading.value = false;
  }
};

const cancel = () => {
  dialogVisible.value = false;
  formRef.value?.resetFields();
};
</script>

<style scoped>
.calendar-cell {
  width: 100%;
  height: 100%;
  padding: 4px;
  cursor: pointer;
}

.cell-date {
  font-weight: bold;
  margin-bottom: 2px;
}

.cell-todo {
  font-size: 12px;
  color: #1890ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
