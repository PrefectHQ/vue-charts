<template>
  <div class="histogram-chart">
    <div ref="chart" class="histogram-chart__chart">
      <template v-if="smooth">
        <svg class="histogram-chart__svg" :width="chartWidth" :height="chartHeight" :viewbox="`0 0 ${chartWidth} ${chartHeight}`">
          <path class="histogram-chart__path" :d="path!" />
        </svg>
      </template>

      <template v-else>
        <template v-for="(bar, index) in bars" :key="index">
          <div class="histogram-chart__bar" :style="bar">
            <slot name="bar" v-bind="{ bar }" />
          </div>
        </template>
      </template>
    </div>

    <template v-if="showYAxis">
      <div class="histogram-chart__axis-y">
        <div class="histogram-chart__label histogram-chart__label-y histogram-chart__label-y--min">
          <slot name="label-y" :value="maxScaleValue">
            <span class="histogram-chart__value-label">{{ maxScaleValue }}</span>
          </slot>
        </div>
        <div class="histogram-chart__label histogram-chart__label-y histogram-chart__label-y--max">
          <slot name="label-y" :value="0">
            <span class="histogram-chart__value-label">{{ 0 }}</span>
          </slot>
        </div>
      </div>
    </template>

    <template v-if="showXAxis">
      <div class="histogram-chart__axis-x">
        <div class="histogram-chart__label histogram-chart__label-x histogram-chart__label-x--start">
          <slot name="label-x" :value="minIntervalStart">
            <span class="histogram-chart__date-label">{{ formatDateLabel(minIntervalStart) }}</span>
            <span class="histogram-chart__time-label">{{ formatTimeLabel(minIntervalStart) }}</span>
          </slot>
        </div>
        <div class="histogram-chart__label histogram-chart__label-x histogram-chart__label-x--end">
          <slot name="label-x" :value="maxIntervalEnd">
            <span class="histogram-chart__date-label">{{ formatDateLabel(maxIntervalEnd) }}</span>
            <span class="histogram-chart__time-label">{{ formatTimeLabel(maxIntervalEnd) }}</span>
          </slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { Pixels } from '@prefecthq/prefect-design'
  import { useElementRect } from '@prefecthq/vue-compositions'
  import * as d3 from 'd3'
  import { format } from 'date-fns'
  import { computed, ref } from 'vue'
  import { roundUpToIncrement } from '@/utilities/roundUpToIncrement'

  export type HistogramData<T = unknown> = HistogramDataPoint<T>[]
  export type HistogramDataPoint<T = unknown> = {
    value: number,
    intervalStart: Date,
    intervalEnd: Date,
    data?: T,
  }

  export type HistogramChartOptions = {
    showXAxis?: boolean,
    showYAxis?: boolean,
    curve?: d3.CurveFactory,
  }

  type PointBar = { left: Pixels, bottom: Pixels, width: Pixels, height: Pixels }
  type PointPosition = [x: number, y: number]

  const props = defineProps<{
    data: HistogramData,
    smooth?: boolean,
    options?: HistogramChartOptions,
  }>()

  const showXAxis = computed(() => props.options?.showXAxis ?? true)
  const showYAxis = computed(() => props.options?.showYAxis ?? true)
  const curve = computed(() => props.options?.curve ?? d3.curveCatmullRom)

  const chart = ref<HTMLDivElement>()
  const { width: chartWidth, height: chartHeight } = useElementRect(chart)

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

  const maxScaleValue = computed<number>(() => roundUpToIncrement(maxValue.value))

  const xScale = computed(() => {
    const scale = d3.scaleTime()

    scale.domain([minIntervalStart.value, maxIntervalEnd.value])
    scale.range([0, chartWidth.value])

    return scale
  })

  const yScale = computed(() => {
    const scale = d3.scaleLinear()

    scale.domain([0, maxScaleValue.value])
    scale.range([0, chartHeight.value])

    return scale
  })

  const bars = computed(() => props.data.map(point => getPointBar(point)))
  const positions = computed<PointPosition[]>(() => {
    const points = props.data.map(point => getPointPosition(point))
    const [, firstY] = points.shift()!
    const [, lastY] = points.pop()!
    const firstPoint: PointPosition = [0, firstY]
    const lastPoint: PointPosition = [chartWidth.value, lastY]

    // offset by 1 to make sure stroke isn't visible because of curving
    const bottomLeftCorner: PointPosition = [-1, chartHeight.value + 1]
    const bottomRightCorner: PointPosition = [chartWidth.value + 1, chartHeight.value + 1]

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

    line.curve(curve.value)

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
    const y = chartHeight.value - yScale.value(point.value)

    return [x, y]
  }

  function formatDateLabel(value: Date): string {
    return format(value, 'MMM do, yyyy')
  }

  function formatTimeLabel(value: Date): string {
    return format(value, 'hh:mm a')
  }
</script>

<style>
.histogram-chart { @apply
  grid
  gap-2;
  grid-template-columns: min-content 1fr;
  grid-template-areas: "yAxis chart"
                       ".     xAxis";
}

.histogram-chart__chart { @apply
  w-full
  h-60
  relative;
  grid-area: chart
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

.histogram-chart__axis-x { @apply
  flex
  justify-between;

  grid-area: xAxis;
}

.histogram-chart__axis-y { @apply
  flex
  flex-col
  items-end
  justify-between
  border-r
  border-foreground-100
  pr-2;

  grid-area: yAxis;
}

.histogram-chart__label-x { @apply
  flex
  flex-col
  gap-1
}

.histogram-chart__label-x--end { @apply
  items-end
}

.histogram-chart__date-label { @apply
  text-sm
  text-foreground
}

.histogram-chart__time-label { @apply
  text-xs
  text-foreground-200
}

.histogram-chart__value-label { @apply
  text-foreground-200
}
</style>