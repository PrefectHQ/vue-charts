<template>
  <ComponentPage
    title="Histogram Chart"
    :demos="[{ title: 'Mini Map' }]"
  >
    <template #description>
      <p-content class="histogram-chart-section">
        <div class="histogram-chart-section__controls">
          <p-label label="Buckets">
            <div class="flex gap-2">
              <p-number-input v-model="buckets" />
              <p-button primary icon="RefreshIcon" @click="getData" />
            </div>
          </p-label>
        </div>
        <div class="flex gap-2">
          <p-checkbox v-model="smooth" label="Smooth" />
          <p-checkbox v-model="showXAxis" label="Show X Axis" />
          <p-checkbox v-model="showYAxis" label="Show Y Axis" />
        </div>
      </p-content>
    </template>

    <HistogramChart class="h-60" v-bind="{ data, smooth }" :options="{ showXAxis, showYAxis }" />

    <template #mini-map>
      <HistogramChart
        v-bind="{ data, smooth }"
        v-model:selection-start="selectionStart"
        v-model:selection-end="selectionEnd"
        :options="{ showXAxis, showYAxis, selectionMinimumSeconds }"
      />
      <p-key-value label="Selection Start" :value="selectionStart" />
      <p-key-value label="Selection End" :value="selectionEnd" />
    </template>
  </ComponentPage>
</template>

<script lang="ts" setup>
  import { BooleanRouteParam, NumberRouteParam, useRouteQueryParam } from '@prefecthq/vue-compositions'
  import { endOfWeek, hoursToSeconds, startOfWeek, subDays } from 'date-fns'
  import { ref, watch } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { generateBarChartData } from '../data'
  import { HistogramChart, HistogramData } from '@/components/HistogramChart'

  const today = new Date()
  const start = ref(startOfWeek(today))
  const end = ref(endOfWeek(today))
  const smooth = useRouteQueryParam('smooth', BooleanRouteParam, false)
  const showXAxis = useRouteQueryParam('showXAxis', BooleanRouteParam, true)
  const showYAxis = useRouteQueryParam('showYAxis', BooleanRouteParam, true)
  const buckets = useRouteQueryParam('buckets', NumberRouteParam, 20)
  const selectionEnd = ref(end.value)
  const selectionStart = ref(subDays(selectionEnd.value, 1))
  const selectionMinimumSeconds = hoursToSeconds(6)

  const data = ref<HistogramData>([])

  watch([start, end, buckets], () => {
    getData()
  }, { immediate: true })

  function getData(): void {
    const { items } = generateBarChartData({
      buckets: buckets.value,
      intervalEnd: end.value,
      intervalStart: start.value,
    })

    data.value = items
  }
</script>

<style>
.histogram-chart-section__controls { @apply
  flex
  gap-2
}
</style>