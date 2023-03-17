<template>
  <ComponentPage title="Line Chart" :demos="demos">
    <template #description>
      <p-label label="Curve">
        <p-select v-model="curve" :options="curves" />
      </p-label>
    </template>

    <LineChart :data="data" :options="{ curve }" />

    <template #with-labels>
      <ChartLabels v-bind="{ xAxis, yAxis }">
        <LineChart :options="{ curve }" :data="data" />
      </ChartLabels>
    </template>

    <template #with-cursor>
      <ChartCursor v-bind="{ xAxis }" class="mb-12">
        <LineChart :options="{ curve }" :data="data" />
      </ChartCursor>
    </template>

    <template #with-selection>
      <ChartSelection v-model:selection-start="selectionStart" v-model:selection-end="selectionEnd" v-bind="{ xAxis }" class="mt-6">
        <LineChart :options="{ curve }" :data="data" />
      </ChartSelection>
    </template>

    <template #everything>
      <ChartLabels v-bind="{ xAxis, yAxis }">
        <ChartCursor v-bind="{ xAxis }" class="mb-12">
          <ChartSelection v-model:selection-start="selectionStart" v-model:selection-end="selectionEnd" v-bind="{ xAxis }" class="mt-6">
            <LineChart :options="{ curve }" :data="data" />
          </ChartSelection>
        </ChartCursor>
      </ChartLabels>
    </template>
  </ComponentPage>
</template>

<script lang="ts" setup>
  import { SelectOption } from '@prefecthq/prefect-design'
  import { NumberRouteParam, useRouteQueryParam } from '@prefecthq/vue-compositions'
  import { endOfWeek, startOfWeek } from 'date-fns'
  import { computed, ref } from 'vue'
  import ComponentPage from '../components/ComponentPage.vue'
  import { DemoBarChartItem, generateBarChartData } from '../data'
  import ChartCursor from '@/components/ChartCursor/ChartCursor.vue'
  import ChartLabels from '@/components/ChartLabels/ChartLabels.vue'
  import ChartSelection from '@/components/ChartSelection/ChartSelection.vue'
  import LineChart from '@/components/LineChart/LineChart.vue'
  import { LineChartDataPoint } from '@/components/LineChart/types'

  const demos = [
    { title: 'With labels' },
    { title: 'With cursor' },
    { title: 'With selection' },
    { title: 'Everything' },
  ]

  const curve = ref()
  const curves: SelectOption[] = [{ label: 'None', value: null }, 'bumpX', 'bumpY', 'cardinal', 'catmullRom']

  const today = new Date()
  const start = ref(startOfWeek(today))
  const end = ref(endOfWeek(today))
  const buckets = useRouteQueryParam('buckets', NumberRouteParam, 100)
  const selectionStart = ref<Date | null>(null)
  const selectionEnd = ref<Date | null>(null)

  const data = computed(() => {
    const { items } = generateBarChartData({
      buckets: buckets.value,
      intervalEnd: end.value,
      intervalStart: start.value,
    })

    return items.map(point => getPointPosition(point))
  })

  function getPointPosition(point: DemoBarChartItem): LineChartDataPoint {
    const x = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
    const y = point.value

    return [x, y]
  }

  const xAxis = computed<Date[]>(() => {
    const dates = data.value.map(([x]) => x.getTime())
    const min = new Date(Math.min(...dates))
    const max = new Date(Math.max(...dates))

    return [min, max]
  })

  const yAxis = computed<number[]>(() => {
    const values = data.value.map(([, y]) => y)
    const min = Math.min(...values)
    const max = Math.max(...values)

    return [min, max]
  })
</script>