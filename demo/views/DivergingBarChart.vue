<template>
  <main class="diverging-bar-chart-view">
    <m-tabs v-model="tab">
      <m-tab href="chart">Chart</m-tab>
      <m-tab href="data">Data</m-tab>
    </m-tabs>

    <div>
      <h3>Positive Keys:</h3>
      {{ positiveSentimentKeys }}
      <h3>Negative Keys:</h3>
      {{ negativeSentimentKeys }}
    </div>

    <div v-if="tab == 'chart'" class="diverging-bar-chart-view__chart">
      <DivergingBarChart
        :items="data.data"
        :interval-start="data.intervalStart"
        :interval-end="data.intervalEnd"
        :interval-seconds="data.intervalSeconds"
        :positive-sentiment-keys="positiveSentimentKeys"
        :negative-sentiment-keys="negativeSentimentKeys"
      >
        <template #series-point="point">
          <m-popover class="diverging-bar-chart-view__bar">
            <template #trigger="{ toggle, open, close }">
              <div
                class="diverging-bar-chart-view__bar"
                tabindex="0"
                @focusin="open"
                @focusout="close"
                @mouseenter="open"
                @mouseleave="close"
              />
            </template>

            <template #header>
              <strong>{{ point.key }}</strong>
            </template>

            <div>{{ point.data }}</div>
          </m-popover>
        </template>
      </DivergingBarChart>
    </div>

    <div v-if="tab == 'data'" class="diverging-bar-chart-view__data">
      <m-data-table :columns="columns" :rows="data.data">
        <template #column-start="{ row }">{{ row.intervalStart.toLocaleTimeString() }}</template>
        <template #column-end="{ row }">{{ row.intervalEnd.toLocaleTimeString() }}</template>
        <template
          v-for="key in data.keys"
          :key="key"
          #[getColumnKey(key)]="{ row }"
        >{{ row.data[key].toLocaleString() }}</template>
      </m-data-table>
    </div>
  </main>
</template>

<script lang="ts" setup>
import DivergingBarChart from '@/DivergingBarChart.vue'
import { generateSentimentData } from '../data';
import { computed, ref } from 'vue'

const start = ref(new Date())
const tab = ref('chart')
const data = computed(() => generateSentimentData({ intervalStart: start.value, buckets: 30 }))

const getColumnKey = (key: string) => `column-${key.replaceAll(' ', '-').toLowerCase()}`

const positiveSentimentKeys = computed(() => {
  return data.value.keys.slice(0, data.value.keys.length / 2)
})

const negativeSentimentKeys = computed(() => {
  return data.value.keys.slice(data.value.keys.length / 2)
})

const columns = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  ...data.value.keys.map(key => { return { label: key, value: key } })
]

</script>

<style lang="scss">
.diverging-bar-chart-view {
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
    background-color: #6680ee;
  }
}
</style>