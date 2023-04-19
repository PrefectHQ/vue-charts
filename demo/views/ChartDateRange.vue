<template>
  <ComponentPage title="Chart Range">
    <ChartDateRange v-model:start-date="startDate" v-model:end-date="endDate" :options="options">
      <LineChart :data="lineChartData" :options="{ startDate, endDate }" />
    </ChartDateRange>

    <ChartDateRange v-model:start-date="secondStartDate" v-model:end-date="secondEndDate" :options="options">
      <MiniHistogram :data="histogramData" :options="{ startDate: secondStartDate!, endDate: secondEndDate! }" />
    </ChartDateRange>

    <p-key-value label="Start date" :value="startDate" />
    <p-key-value label="End date" :value="endDate" />
  </ComponentPage>
</template>

<script lang="ts" setup>
  import { NumberRouteParam, useRouteQueryParam } from '@prefecthq/vue-compositions'
  import { endOfToday, endOfWeek, secondsInDay, secondsInHour, startOfToday, startOfWeek } from 'date-fns'
  import { ref } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { DemoBarChartItem, generateBarChartData } from '../data'
  import { HistogramData } from '@/components'
  import ChartDateRange from '@/components/ChartDateRange/ChartDateRange.vue'
  import { ChartDateRangeOptions } from '@/components/ChartDateRange/types'
  import LineChart from '@/components/LineChart/LineChart.vue'
  import { LineChartData, LineChartDataPoint } from '@/components/LineChart/types'
  import MiniHistogram from '@/components/MiniHistogram/MiniHistogram.vue'
  import { useChartDateRange } from '@/compositions'

  const buckets = useRouteQueryParam('buckets', NumberRouteParam, 500)
  const { startDate, endDate } = useChartDateRange()
  const { startDate: secondStartDate, endDate: secondEndDate } = useChartDateRange()

  const now = new Date()

  const options: ChartDateRangeOptions = {
    minDate: startOfWeek(now),
    maxDate: endOfWeek(now),
    maxRangeInSeconds: secondsInDay,
    minRangeInSeconds: secondsInHour,
  }

  startDate.value = startOfToday()
  endDate.value = endOfToday()

  const histogramData = ref<HistogramData>([])
  const lineChartData = ref<LineChartData>([])

  function getPointPosition(point: DemoBarChartItem): LineChartDataPoint {
    const x = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
    const y = point.value

    return [x, y]
  }

  function getData(): void {
    const { items } = generateBarChartData({
      buckets: buckets.value,
      intervalEnd: endOfWeek(now),
      intervalStart: startOfWeek(now),
    })

    histogramData.value = items
    lineChartData.value = items.map(point => getPointPosition(point))
  }

  getData()
</script>