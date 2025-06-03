<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
  <a-checkbox v-model:checked="checked">Checkbox</a-checkbox>
</template>

<script setup>
import { ref } from "vue";
const checked = ref(false);
</script>
