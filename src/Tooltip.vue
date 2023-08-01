<script setup lang="ts">
import {defineProps} from "vue";

defineProps<{ title: string, rows?: { label: string, value: number }[] }>()
</script>

<template>
  <div class="title">{{ title }}</div>
  <table>
    <tr>
      <th>类别</th>
      <th>数据</th>
    </tr>
    <tr v-for="data in rows" :key="data.label">
      <td class="label">{{ data.label }}</td>
      <td class="value">{{ data.value }}</td>
    </tr>
  </table>
</template>


<style scoped>
.title {
  text-align: center;
  font-weight: bold;
}

.label {
  color: #333333;
}

.value {
  font-weight: bold;
  text-align: right;
}

table, td, th {
  border-collapse: collapse;
  border: 1px solid #333333;
}
</style>
