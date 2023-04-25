<template>
  <ComponentPage title="Chart Cursor">
    <template #description>
      The cursor is always active but only visible when holding the <p-code inline>
        shift
      </p-code> key. Chart cursors can be shared across charts using the <p-code inline>
        useChartCursor
      </p-code> composition.
    </template>
    <p-content>
      <ChartCursor v-model:cursor="lineChartCursor" v-bind="{ startDate, endDate }">
        <LineChart :data="lineChartData" :options="{ startDate, endDate }" />
      </ChartCursor>

      <ChartCursor v-model:cursor="histogramCursor" v-bind="{ startDate, endDate }">
        <MiniHistogram :data="histogramData" :options="{ startDate, endDate }" />
      </ChartCursor>

      <p-key-value label="Cursor" :value="cursor" />
    </p-content>
  </ComponentPage>
</template>

<script lang="ts" setup>
  import { endOfToday, endOfWeek, startOfToday, startOfWeek } from 'date-fns'
  import { ref } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { DemoBarChartItem, generateBarChartData } from '../data'
  import { HistogramData } from '@/components'
  import ChartCursor from '@/components/ChartCursor/ChartCursor.vue'
  import LineChart from '@/components/LineChart/LineChart.vue'
  import { LineChartData, LineChartDataPoint } from '@/components/LineChart/types'
  import MiniHistogram from '@/components/MiniHistogram/MiniHistogram.vue'
  import { useChartCursor } from '@/compositions'

  const startDate = startOfToday()
  const endDate = endOfToday()
  const now = new Date()

  const { cursor } = useChartCursor()
  const { cursor: lineChartCursor } = useChartCursor()
  const { cursor: histogramCursor } = useChartCursor()

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