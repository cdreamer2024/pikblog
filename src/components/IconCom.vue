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
      const iconName = `${props.icon}Outlined`;
      return Icons[iconName as keyof typeof Icons] || null;
    });

    return () => {
      const Icon = iconComponent.value;
      return Icon ? h(Icon, { class: "icon" }) : null;
    };
  },
});
</script>

<style scoped>
.icon {
  font-size: 14px;
}
</style>
