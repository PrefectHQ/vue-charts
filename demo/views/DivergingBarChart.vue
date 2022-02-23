<template>
  <main class="diverging-bar-chart">
    <m-tabs v-model="tab">
      <m-tab href="chart">Chart</m-tab>
      <m-tab href="data">Data</m-tab>
    </m-tabs>

    <div v-if="tab == 'chart'" class="diverging-bar-chart__chart"></div>

    <div v-if="tab == 'data'" class="diverging-bar-chart__data">
      <m-data-table :columns="columns" :rows="data.items">
        <template #column-color="{ row }">{{ row.data?.color }}</template>
        <template #column-start="{ row }">{{ row.intervalStart.toLocaleTimeString() }}</template>
        <template #column-end="{ row }">{{ row.intervalEnd.toLocaleTimeString() }}</template>
      </m-data-table>
    </div>
  </main>
</template>

<script lang="ts" setup>
// import DivergingBarChart from '@/DivergingBarChart.vue'
import { generateData, BarChartData } from '../data';
import { computed, ref } from 'vue'

const start = ref(new Date())
const tab = ref('chart')
const data = computed(() => generateData({ intervalStart: start.value, buckets: 50 }))

const columns = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Color', value: 'color' },
  { label: 'Value', value: 'value' }
]

</script>

<style lang="scss">
.diverging-bar-chart {
  padding: 24px;

  &__chart {
    background-color: #f7f8fa;
    height: 400px;
    max-height: 100vh;
    min-height: 200px;
    max-width: calc(100vw - 48px);
    min-width: 400px;
    overflow: auto;
    resize: both;
  }

  &__bar {
    border-radius: 9999px;
    height: 100%;
    width: 100%;
  }
}
</style>