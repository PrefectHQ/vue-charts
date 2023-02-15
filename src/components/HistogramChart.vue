<template>
  <div class="histogram-chart">
    <div ref="chart" class="histogram-chart__chart">
      <template v-if="smooth">
        <svg class="histogram-chart__svg" :width="width" :height="height" :viewbox="`0 0 ${width} ${height}`">
          <path class="histogram-chart__path" :d="path!" />
        </svg>
      </template>

      <template v-else>
        <template v-for="(bar, index) in bars" :key="index">
          <slot name="bar" v-bind="{ bar }">
            <div class="histogram-chart__bar" :style="bar" />
          </slot>
        </template>
      </template>
    </div>
    <div class="histogram-chart__value" />
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
  type PointPosition = [x: number, y: number]

  const props = defineProps<{
    data: HistogramData,
    smooth?: boolean,
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
    // this will need to be more intelligent.
    const domainMax = maxValue.value * 1.1
    scale.domain([0, domainMax])
    scale.range([0, height.value])

    return scale
  })

  const bars = computed(() => props.data.map(point => getPointBar(point)))
  const positions = computed<PointPosition[]>(() => {
    const points = props.data.map(point => getPointPosition(point))
    const [, firstY] = points.shift()!
    const [, lastY] = points.pop()!
    const firstPoint: PointPosition = [0, firstY]
    const lastPoint: PointPosition = [width.value, lastY]

    const bottomLeftCorner: PointPosition = [0, height.value]
    const bottomRightCorner: PointPosition = [width.value, height.value]

    return [
      bottomLeftCorner,
      firstPoint,
      ...points,
      lastPoint,
      bottomRightCorner,
    ]
  })

  const path = computed(() => {
    const line = d3.line()

    line.curve(d3.curveCatmullRom)

    return line(positions.value)
  })

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

  function getPointPosition(point: HistogramDataPoint): PointPosition {
    const middle = new Date((point.intervalStart.getTime() + point.intervalEnd.getTime()) / 2)
    const x = xScale.value(middle)
    const y = height.value - yScale.value(point.value)

    return [x, y]
  }
</script>

<style>
.histogram-chart__chart { @apply
  w-full
  h-60
  relative
}

.histogram-chart__bar { @apply
  absolute
  block
  bg-prefect-500
  border
  border-prefect-300
  transition-all
}

.histogram-chart__svg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.histogram-chart__path {
  @apply
  transition-all
  fill-prefect-500
  stroke-prefect-300
}
</style>