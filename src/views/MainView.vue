<!-- views/MainView.vue -->
<template>
  <a-layout class="layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="isCollapse"
      :width="240"
      :style="{
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 100,
      }"
    >
      <div class="logo">
        <h2>{{ isCollapse ? "E" : "电子凭证系统" }}</h2>
      </div>

      <a-menu
        theme="dark"
        mode="inline"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        :items="menuItems"
        @click="handleMenuClick"
      />
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout
      class="main-layout"
      :style="{
        marginLeft: isCollapse ? '80px' : '240px',
        minHeight: '100vh',
      }"
    >
      <a-layout-header class="header">
        <HeaderCom />
      </a-layout-header>

      <a-layout-content class="content">
        <!-- 这里渲染子路由页面 -->
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  BarChartOutlined,
  HomeOutlined,
  WalletOutlined,
  MonitorOutlined,
} from "@ant-design/icons-vue";
import type { MenuProps } from "ant-design-vue";
import HeaderCom from "../components/HeaderCom.vue";
import IconCom from "../components/IconCom.vue";
import useUserStore from "../store/index";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isCollapse = computed(() => userStore.isCollapse);
const userMenus = computed(() => userStore.UserMenus);

// 菜单选中状态
const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

// 监听路由变化更新菜单选中状态
watch(
  () => route.path,
  (newPath) => {
    // 设置选中状态为完整路径
    selectedKeys.value = [newPath];

    // 自动展开父级菜单
    const pathSegments = newPath.split("/").filter(Boolean);
    if (pathSegments.length > 1) {
      openKeys.value = [`/${pathSegments[0]}`];
    }
  },
  { immediate: true }
);

// 转换动态菜单
const convertMenus = (menus: any[]): MenuProps["items"] => {
  if (!menus || !Array.isArray(menus)) return [];

  return menus.map((menu) => ({
    key: `${menu.Index || menu.Id || menu.key}`,
    icon: () => h(IconCom, { icon: menu.Icon }),
    label: menu.Name || menu.label,
    children: menu.Children ? convertMenus(menu.Children) : undefined,
  }));
};

// 菜单项配置 - 注意路径要加上 /main 前缀
const menuItems = computed<MenuProps["items"]>(() => {
  const staticMenus: MenuProps["items"] = [
    {
      key: "/main/desktop",
      icon: () => h(HomeOutlined),

      label: "我的主页",
      children: [
        {
          key: "/main/desktop",
          icon: () => h(WalletOutlined),
          label: "工作台",
        },
        {
          key: "/main/personpage",
          icon: () => h(MonitorOutlined),
          label: "个人信息",
        },
      ],
    },
  ];

  const dynamicMenus = convertMenus(userMenus.value) || [];
  return [...staticMenus, ...dynamicMenus];
});

// 菜单点击处理
const handleMenuClick: MenuProps["onClick"] = (menuInfo) => {
  menuInfo.domEvent.preventDefault();
  router.push(menuInfo.key as string);
};
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid #434343;
}

.logo h2 {
  margin: 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.main-layout {
  transition: margin-left 0.2s;
  background: #f0f2f5;
}

.header {
  background: white;
  padding: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
}

.content {
  padding: 16px;
  background: transparent;
  min-height: calc(100vh - 64px);
}
</style>
