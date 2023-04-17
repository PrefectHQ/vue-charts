<template>
  <ComponentPage title="Chart Range">
    <template #description>
      Allows for zooming and panning a date range.
    </template>

    <ChartDateRange v-model:start-date="startDate" v-model:end-date="endDate">
      <LineChart :data="data" :options="{ startDate, endDate }" />
    </ChartDateRange>
  </ComponentPage>
</template>

<script lang="ts" setup>
  import { NumberRouteParam, useRouteQueryParam } from '@prefecthq/vue-compositions'
  import { endOfWeek, startOfWeek } from 'date-fns'
  import { ref } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { DemoBarChartItem, generateBarChartData } from '../data'
  import ChartDateRange from '@/components/ChartDateRange/ChartDateRange.vue'
  import LineChart from '@/components/LineChart/LineChart.vue'
  import { LineChartData, LineChartDataPoint } from '@/components/LineChart/types'
  import { useChartDateRange } from '@/compositions'

  const today = new Date()
  const buckets = useRouteQueryParam('buckets', NumberRouteParam, 100)
  const { startDate, endDate } = useChartDateRange()

  startDate.value = startOfWeek(today)
  endDate.value = endOfWeek(today)

  const data = ref<LineChartData>([])

  function getPointPosition(point: DemoBarChartItem): LineChartDataPoint {
    const x = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
    const y = point.value

    return [x, y]
  }

  function getData(): void {
    const { items } = generateBarChartData({
      buckets: buckets.value,
      intervalEnd: endDate.value!,
      intervalStart: startDate.value!,
    })

    data.value = items.map(point => getPointPosition(point))
  }

  getData()
</script>