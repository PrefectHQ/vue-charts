<template>
  <ComponentPage title="Chart Selection">
    <template #description>
      The selection is always active but only visible when holding the <p-code inline>
        shift
      </p-code> key. Chart selections can be shared across charts using the <p-code inline>
        useChartSelection
      </p-code> composition.
    </template>
    <p-content class="pt-4">
      <ChartSelection v-model:selectionStart="selectionStart" v-model:selectionEnd="selectionEnd" v-bind="{ startDate, endDate }">
        <LineChart :data="lineChartData" :options="{ startDate, endDate }" />
      </ChartSelection>

      <ChartSelection v-model:selectionStart="selectionStart" v-model:selectionEnd="selectionEnd" v-bind="{ startDate, endDate }">
        <MiniHistogram :data="histogramData" :options="{ startDate, endDate }" />
      </ChartSelection>

      <p-key-value label="Selection Start" :value="selectionStart" />
      <p-key-value label="Selection End" :value="selectionEnd" />
    </p-content>
  </ComponentPage>
</template>

<script lang="ts" setup>
  import { endOfToday, endOfWeek, startOfToday, startOfWeek } from 'date-fns'
  import { ref } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { DemoBarChartItem, generateBarChartData } from '../data'
  import { HistogramData } from '@/components'
  import ChartSelection from '@/components/ChartSelection/ChartSelection.vue'
  import LineChart from '@/components/LineChart/LineChart.vue'
  import { LineChartData, LineChartDataPoint } from '@/components/LineChart/types'
  import MiniHistogram from '@/components/MiniHistogram/MiniHistogram.vue'
  import { useChartSelection } from '@/compositions'

  const startDate = startOfToday()
  const endDate = endOfToday()
  const now = new Date()

  const { selectionStart, selectionEnd } = useChartSelection()

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