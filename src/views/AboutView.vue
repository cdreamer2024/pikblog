<template>
  <CheckboxGroup
    :plain-options="fruitOptions"
    :checked-list="defaultSelected"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import CheckboxGroup from "@/components/SingleCheckBox.vue";
const fruitOptions = ref(["Apple", "Pear", "Orange", "Banana", "Grape"]);
const defaultSelected = ref(["Apple", "Orange"]);
</script>
