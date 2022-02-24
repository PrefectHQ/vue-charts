<template>
  <main class="diverging-bar-chart-view">
    <div class="mb-2 d-flex align-center justify-start">
      <div class="mr-2">
        <m-select v-model="skew" :options="skewOptions" />
        <m-slider v-model="multiplier" :min="0" :max="10" label="Skew Multiplier" />
      </div>

      <div class="mr-2">
        <div>
          <m-slider v-model="buckets" :min="1" :max="100" label="Buckets" />
        </div>
        <div>
          <m-slider v-model="keys" :min="1" :max="30" label="Keys" />
        </div>
      </div>

      <div class="mr-2">
        <m-number-input v-model="medianPadding" :min="0" :max="128" :step="4">Median Padding</m-number-input>

        <m-checkbox v-model="staticMedian">Static median</m-checkbox>
      </div>
    </div>

    <m-tabs v-model="tab">
      <m-tab href="chart">Chart</m-tab>
      <m-tab href="data">Data</m-tab>
    </m-tabs>

    <div v-if="tab == 'chart'" class="diverging-bar-chart-view__chart">
      <DivergingBarChart
        :items="data.data"
        :interval-start="data.intervalStart"
        :interval-end="data.intervalEnd"
        :interval-seconds="data.intervalSeconds"
        :positive-sentiment-keys="data.positiveSentimentKeys"
        :negative-sentiment-keys="data.negativeSentimentKeys"
        :static-median="staticMedian"
        :chart-padding="{ middle: medianPadding, top: 48, bottom: 48 }"
      >
        <template #default="point">
          <m-popover
            v-if="point.data !== 0"
            class="diverging-bar-chart-view__bar-container"
            :placement="['top', 'right', 'bottom', 'left']"
          >
            <template #trigger="{ toggle, open, close }">
              <div
                class="diverging-bar-chart-view__bar-container"
                tabindex="0"
                @focusin="open"
                @focusout="close"
                @mouseenter="open"
                @mouseleave="close"
              >
                <div class="diverging-bar-chart-view__bar" />
              </div>
            </template>

            <template #header>
              <strong>{{ point.key }}</strong>
            </template>

            <div>{{ point.data }}</div>
          </m-popover>
        </template>

        <template #median>
          <div class="diverging-bar-chart-view__median" />
        </template>
      </DivergingBarChart>
    </div>

    <div v-if="tab == 'data'" class="diverging-bar-chart-view__data">
      <div class="my-2">
        <h3>Positive Keys:</h3>
        {{ data.positiveSentimentKeys }}
        <h3>Negative Keys:</h3>
        {{ data.negativeSentimentKeys }}
      </div>

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

const skew = ref('none')
const skewOptions = [
  { label: 'None', value: 'none', icon: 'subtract-fill' },
  { label: 'Positive', value: 'positive', icon: 'arrow-up-s-fill' },
  { label: 'Negative', value: 'negative', icon: 'arrow-down-s-fill' }
]

const staticMedian = ref(false)
const multiplier = ref("2")
const buckets = ref("10")
const keys = ref("8")
const medianPadding = ref(24)

const data = computed(() => generateSentimentData({
  intervalStart: start.value,
  buckets: parseInt(buckets.value),
  keys: parseInt(keys.value),
  skew: skew.value == 'none' ? undefined : skew.value as 'positive' | 'negative',
  skewMultiplier: parseInt(multiplier.value)
}))

const getColumnKey = (key: string) => `column-${key.replaceAll(' ', '-').toLowerCase()}`

const columns = computed(() => {
  return [
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    ...data.value.keys.map(key => { return { label: key, value: key } })
  ]
})

</script>

<style lang="scss">
.diverging-bar-chart-view {
  padding: 24px;

  &__chart {
    background-color: #f7f8fa;
    height: 800px;
    max-height: 100vh;
    min-height: 200px;
    max-width: calc(100vw - 48px);
    min-width: 400px;
    margin: 24px 0;
    overflow: auto;
    resize: both;
  }

  &__bar {
    height: 100%;
    width: 35%;
    max-width: 50px;
    margin: auto;
    background-color: #6680ee;
    // border-top-left-radius: inherit;
    // border-top-right-radius: inherit;
    // border-bottom-left-radius: inherit;
    // border-bottom-right-radius: inherit;
  }

  &__median {
    height: 4px;
    background-color: #ebeef7;
    width: 100%;
  }

  &__bar-container {
    height: 100%;
    width: 100%;

    // &:first-of-type {
    //   border-top-left-radius: 9999px;
    //   border-top-right-radius: 9999px;
    // }

    // &:last-of-type {
    //   border-bottom-left-radius: 9999px;
    //   border-bottom-right-radius: 9999px;
    // }

    &:focus,
    &:hover {
      outline: none;

      .diverging-bar-chart-view__bar {
        background-color: #0035b0;
      }
    }
  }
}
</style>