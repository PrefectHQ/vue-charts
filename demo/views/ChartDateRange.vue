<template>
  <ComponentPage title="Chart Range">
    <p-content>
      <template v-if="startDate && endDate">
        <ChartDateRange v-model:start-date="startDate" v-model:end-date="endDate" :options="options">
          <LineChart :data="lineChartData" :options="{ startDate, endDate }" />
        </ChartDateRange>
      </template>

      <template v-if="secondStartDate && secondEndDate">
        <ChartDateRange v-model:start-date="secondStartDate" v-model:end-date="secondEndDate" :options="options">
          <MiniHistogram :data="histogramData" :options="{ startDate: secondStartDate, endDate: secondEndDate }" />
        </ChartDateRange>
      </template>

      <p-key-value label="Start date" :value="startDate" />
      <p-key-value label="End date" :value="endDate" />
    </p-content>
  </ComponentPage>
</template>

<script lang="ts" setup>
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

  const { startDate, endDate } = useChartDateRange()
  const { startDate: secondStartDate, endDate: secondEndDate } = useChartDateRange()

  startDate.value = startOfToday()
  endDate.value = endOfToday()

  const now = new Date()

  const options: ChartDateRangeOptions = {
    minDate: startOfWeek(now),
    maxDate: endOfWeek(now),
    maxRangeInSeconds: secondsInDay,
    minRangeInSeconds: secondsInHour,
  }

  const histogramData = ref<HistogramData>([])
  const lineChartData = ref<LineChartData>([])

  function getPointPosition(point: DemoBarChartItem): LineChartDataPoint {
    const x = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
    const y = point.value

    return [x, y]
  }

  function getData(): void {
    const { items } = generateBarChartData({
      buckets: 500,
      intervalEnd: endOfWeek(now),
      intervalStart: startOfWeek(now),
    })

    histogramData.value = items
    lineChartData.value = items.map(point => getPointPosition(point))
  }

  getData()
</script>