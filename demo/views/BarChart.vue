<template>
  <main class="bar-chart__main">
    <h2>Bar Chart</h2>

    <m-tabs v-model="tab">
      <m-tab href="chart">Chart</m-tab>
      <m-tab href="data">Data</m-tab>
    </m-tabs>

    <div v-if="tab == 'chart'" class="bar-chart__chart">
      <BarChart
        :items="data.items"
        :interval-start="data.intervalStart"
        :interval-end="data.intervalEnd"
      >
        <template #default="{ item }">
          <m-popover class="bar-chart__bar">
            <template #trigger="{ toggle, open, close }">
              <div
                class="bar-chart__bar"
                :style="{ 'background-color': item.data?.color }"
                tabindex="0"
                @focusin="open"
                @focusout="close"
                @mouseenter="open"
                @mouseleave="close"
              />
            </template>

            <div>
              <strong>Start</strong>
              : {{ item.intervalStart.toLocaleTimeString() }}
              <br />
              <strong>End</strong>
              : {{ item.intervalEnd.toLocaleTimeString() }}
              <br />
              <strong>Value</strong>
              : {{ item.value }}
            </div>
          </m-popover>
        </template>
      </BarChart>
    </div>

    <div v-if="tab == 'data'" class="bar-chart__data">
      <m-data-table :columns="columns" :rows="data.items">
        <template #column-color="{ row }">{{ row.data?.color }}</template>
        <template #column-start="{ row }">{{ row.intervalStart.toLocaleTimeString() }}</template>
        <template #column-end="{ row }">{{ row.intervalEnd.toLocaleTimeString() }}</template>
      </m-data-table>
    </div>
  </main>
</template>

<script lang="ts" setup>
import BarChart from '@/BarChart.vue'
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
.bar-chart {
  &__chart {
    background-color: #f7f8fa;
    height: 400px;
    max-height: 100vh;
    min-height: 200px;
    max-width: 100vw;
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