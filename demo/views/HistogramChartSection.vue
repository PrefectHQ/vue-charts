<template>
  <p-layout-default>
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

      <Histogram :data="data" :smooth="smooth" :options="{ showXAxis, showYAxis }" />
    </p-content>
  </p-layout-default>
</template>

<script lang="ts" setup>
  import { BooleanRouteParam, NumberRouteParam, useRouteQueryParam } from '@prefecthq/vue-compositions'
  import { endOfWeek, startOfWeek } from 'date-fns'
  import { ref, watch } from 'vue'
  import { generateBarChartData } from '../data'
  import Histogram, { HistogramData } from '@/components/HistogramChart.vue'

  const today = new Date()
  const start = ref(startOfWeek(today))
  const end = ref(endOfWeek(today))
  const smooth = useRouteQueryParam('smooth', BooleanRouteParam, false)
  const showXAxis = useRouteQueryParam('showXAxis', BooleanRouteParam, true)
  const showYAxis = useRouteQueryParam('showYAxis', BooleanRouteParam, true)
  const buckets = useRouteQueryParam('buckets', NumberRouteParam, 20)

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