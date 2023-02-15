<template>
  <div ref="chart" class="histogram-chart">
    <template v-for="(bar, index) in bars" :key="index">
      <div class="histogram-chart__bar" :style="bar" />
    </template>
  </div>

  width: {{ width }}<br>
  height: {{ height }}<br>
  minIntervalStart: {{ minIntervalStart }}<br>
  maxIntervalEnd: {{ maxIntervalEnd }}<br>
  maxValue: {{ maxValue }}<br>
</template>

<script lang="ts" setup>
  import { Pixels } from '@prefecthq/prefect-design'
  import { useElementRect } from '@prefecthq/vue-compositions'
  import * as d3 from 'd3'
  import { computed, ref } from 'vue'

  export type HistogramData<T = unknown> = HistogramDataPoint<T>[]
  export type HistogramDataPoint<T = unknown> = {
    value: number,
    intervalStart: Date,
    intervalEnd: Date,
    data?: T,
  }

  type PointBar = { left: Pixels, bottom: Pixels, width: Pixels, height: Pixels }
  type PointPosition = { left: Pixels, top: Pixels }

  const props = defineProps<{
    data: HistogramData,
  }>()

  const chart = ref<HTMLDivElement>()
  const { width, height } = useElementRect(chart)

  const minIntervalStart = computed<Date>(() => {
    const allStartDateTimes = props.data.map(point => point.intervalStart.getTime())
    const minStartDateTime = Math.min(...allStartDateTimes)

    return new Date(minStartDateTime)
  })

  const maxIntervalEnd = computed<Date>(() => {
    const allStartDateTimes = props.data.map(point => point.intervalEnd.getTime())
    const minStartDateTime = Math.max(...allStartDateTimes)

    return new Date(minStartDateTime)
  })

  const maxValue = computed<number>(() => {
    const allValues = props.data.map(point => point.value)
    const max =  Math.max(...allValues)

    if (max <= 0) {
      return 0
    }

    return max
  })

  const xScale = computed(() => {
    const scale = d3.scaleTime()

    scale.domain([minIntervalStart.value, maxIntervalEnd.value])
    scale.range([0, width.value])

    return scale
  })

  const yScale = computed(() => {
    const scale = d3.scaleLinear()

    scale.domain([0, maxValue.value])
    scale.range([0, height.value])

    return scale
  })

  const bars = computed(() => props.data.map(point => getPointBar(point)))
  // const positions = computed(() => props.data.map(point => getPointPosition(point)))

  function getPointBar(point: HistogramDataPoint): PointBar {
    const top = yScale.value(point.value)
    const left = xScale.value(point.intervalStart)
    const right = xScale.value(point.intervalEnd)
    const width = right - left
    const height = top

    const bar: PointBar = {
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`,
      bottom: '0px',
    }

    return bar
  }

  // function getPointPosition(point: HistogramDataPoint): PointPosition {
  //   const middle = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
  //   const top = yScale.value(point.value)
  //   const left = xScale.value(middle)

  //   return {
  //     top: `${top}px`,
  //     left: `${left}px`,
  //   }
  // }
</script>

<style>
.histogram-chart { @apply
  /* border */
  /* border-foreground-500 */
  w-full
  h-60
  relative
}

.histogram-chart__bar { @apply
  absolute
  block
  bg-prefect-500
  border
  border-prefect-50
  transition-all
  /* min-h-[5px] */
}
</style>