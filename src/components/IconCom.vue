<template>
  <IconRender />
</template>

<script lang="ts">
import { defineComponent, computed, h } from "vue";
import * as Icons from "@ant-design/icons-vue";
import type { Component } from "vue";

export default defineComponent({
  name: "IconCom",
  props: {
    icon: String,
  },
  setup(props) {
    const iconComponent = computed((): Component | null => {
      if (!props.icon) return null;

      // 尝试多种可能的图标名称格式
      const possibleNames = [
        props.icon, // 原名称
        `${props.icon}Outlined`, // Outlined 风格
        `${props.icon}Filled`, // Filled 风格
        `${props.icon}TwoTone`, // TwoTone 风格
        `${props.icon.toLowerCase()}Outlined`, // 小写 + Outlined
        `${props.icon.toLowerCase()}Filled`, // 小写 + Filled
        `${props.icon.toLowerCase()}TwoTone`, // 小写 + TwoTone
        `${capitalizeFirstLetter(props.icon)}Outlined`, // 首字母大写 + Outlined
      ];

      // 遍历所有可能的名称，找到匹配的图标组件
      for (const name of possibleNames) {
        if (Icons[name as keyof typeof Icons]) {
          return Icons[name as keyof typeof Icons];
        }
      }

      console.warn(`未找到图标: ${props.icon}，尝试的名称:`, possibleNames);
      return null;
    });

    // 首字母大写函数
    const capitalizeFirstLetter = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return () => {
      const Icon = iconComponent.value;
      return Icon
        ? h(Icon, { class: "icon" })
        : h("span", { class: "icon-placeholder" });
    };
  },
});
</script>

<style scoped>
.icon {
  font-size: 14px;
}

.icon-placeholder {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: #f0f0f0;
  border-radius: 2px;
}
</style>
