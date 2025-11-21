<template>
  <template v-for="item in list" :key="item.Id">
    <a-menu-item v-if="!item.Children?.length" :key="item.FilePath">
      <IconCom :icon="item.Icon" />
      <span>{{ item.Name }}</span>
    </a-menu-item>

    <a-sub-menu v-else :key="item.Id" :title="item.Name">
      <template #icon>
        <IconCom :icon="item.Icon" />
      </template>
      <TreeMenu :list="item.Children" />
    </a-sub-menu>
  </template>
</template>

<script setup lang="ts">
import TreeModel from "../class/TreeMenu";
import IconCom from "./IconCom.vue";

defineProps<{
  list: TreeModel[];
}>();
</script>
