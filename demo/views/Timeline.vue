<template>
  <main class="timeline-view">
    <m-tabs v-model="tab">
      <m-tab href="chart">Chart</m-tab>
      <m-tab href="data">Data</m-tab>
    </m-tabs>

    <div v-if="tab == 'chart'" class="timeline-view__chart">Chart</div>

    <div v-if="tab == 'data'" class="timeline-view__data">
      <m-data-table :columns="columns" :rows="data.data">
        <template #column-color="{ row }">{{ row.data?.color }}</template>
        <template #column-start="{ row }">{{ row.start.toLocaleTimeString() }}</template>
        <template #column-end="{ row }">{{ row.end.toLocaleTimeString() }}</template>
      </m-data-table>
    </div>
  </main>
</template>

<script lang="ts" setup>
import Timeline from '@/Timeline.vue'
import { generateTimelineData } from '../data';
import { computed, ref } from 'vue'

const start = ref(new Date())
const tab = ref('chart')
const data = computed(() => generateTimelineData())

const columns = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Color', value: 'color' }
]

</script>

<style lang="scss">
.timeline-view {
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
}
</style>