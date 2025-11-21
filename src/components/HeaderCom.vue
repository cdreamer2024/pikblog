<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <MenuFoldOutlined
      v-if="!isCollapse"
      @click="toggleCollapse"
      class="collapse-btn"
    />
    <MenuUnfoldOutlined v-else @click="toggleCollapse" class="collapse-btn" />

    <!-- 面包屑 -->
    <a-breadcrumb class="breadcrumb">
      <a-breadcrumb-item>首页</a-breadcrumb-item>
      <a-breadcrumb-item>{{ routeName }}</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 用户菜单 -->
    <a-dropdown :trigger="['click']" class="user-dropdown">
      <div class="user-info">
        <a-avatar :size="32" :src="userAvatar" />
        <span class="username">{{ userName }}</span>
        <DownOutlined />
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item @click="logout">
            <LogoutOutlined />
            退出登录
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import useUserStore from "../store/index";
import { FormatToken } from "../tools";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isCollapse = computed(() => userStore.isCollapse);
const routeName = computed(() => route.name?.toString() || "");
const userInfo = computed(() => FormatToken(userStore.Token));
const userAvatar = computed(() => userInfo.value?.Image);
const userName = computed(() => userInfo.value?.NickName || "用户");

const toggleCollapse = () => {
  userStore.$patch({ isCollapse: !isCollapse.value });
};

const logout = () => {
  // 先清空计算属性依赖的数据
  userStore.$patch({
    Token: "",
    RefreshTokenNum: 0,
  });

  // 延迟清空其他数据，确保页面跳转完成
  setTimeout(() => {
    userStore.reset();
  }, 0);

  // 跳转到登录页
  router.push("/login");
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.collapse-btn {
  font-size: 18px;
  cursor: pointer;
  margin-right: 16px;
}

.breadcrumb {
  flex: 1;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: #f5f5f5;
  }
}

.username {
  font-size: 14px;
}
</style>
