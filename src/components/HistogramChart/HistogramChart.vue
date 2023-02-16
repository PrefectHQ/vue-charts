<template>
  <div v-if="data.length" class="histogram-chart">
    <div ref="chart" class="histogram-chart__chart">
      <svg class="histogram-chart__svg" :width="chartWidth" :height="chartHeight" :viewbox="`0 0 ${chartWidth} ${chartHeight}`">
        <path ref="path" class="histogram-chart__path" :class="classes.path" :d="pathData!" />
      </svg>

      <template v-for="(bar, index) in bars" :key="index">
        <div class="histogram-chart__bar" :class="classes.bar" :style="bar">
          <slot name="bar" v-bind="{ bar }" />
        </div>
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
  import { computed, ref, watch } from 'vue'
  import { HistogramChartOptions, HistogramData, HistogramDataPoint } from '@/components/HistogramChart'
  import { roundUpToIncrement } from '@/utilities/roundUpToIncrement'

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
  const transition = computed(() => props.options?.transition ?? true)
  const transitionDuration = computed(() => props.options?.transitionDuration ?? 250)
  const transitionDurationString = computed(() => `${transitionDuration.value}ms`)
  const showBars = computed(() => !props.smooth)
  const showSmooth = computed(() => props.smooth)
  const loaded = ref(false)

  const path = ref<SVGElement>()
  const { width: pathWidth } = useElementRect(path)

  const chart = ref<HTMLDivElement>()
  const { width: chartWidth, height: chartHeight } = useElementRect(chart)

  const unwatch = watch(pathWidth, width => {
    if (width > 0 && chartWidth.value > 0 && width >= chartWidth.value) {
      loaded.value = true
      unwatch()
    }
  })

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

  const bars = computed(() => {
    const bars = props.data.map(point => getPointBar(point))

    if (!loaded.value || !showBars.value) {
      return bars.map(bar => ({ ...bar, height: '0px' }))
    }

    return bars
  })

  const positions = computed<PointPosition[]>(() => {
    const points = props.data.map(point => getPointPosition(point))
    const [, firstY] = points.shift()!
    const [, lastY] = points.pop()!
    const firstPoint: PointPosition = [0, firstY]
    const lastPoint: PointPosition = [chartWidth.value, lastY]

    // offset by 1 to make sure stroke isn't visible because of curving
    const bottomLeftCorner: PointPosition = [-1, chartHeight.value + 1]
    const bottomRightCorner: PointPosition = [chartWidth.value + 1, chartHeight.value + 1]

    const positions: PointPosition[] = [
      bottomLeftCorner,
      firstPoint,
      ...points,
      lastPoint,
      bottomRightCorner,
    ]

    if (!loaded.value || !showSmooth.value) {
      const [[x], ...positionsAllAtBottom]: PointPosition[] = positions.map(([x]) => [x, chartHeight.value])
      const firstPosition: PointPosition = [x, chartHeight.value]

      return [firstPosition, ...positionsAllAtBottom]
    }

    return positions
  })

  const pathData = computed(() => {
    const line = d3.line()

    line.curve(curve.value)

    return line(positions.value)
  })

  const classes = computed(() => ({
    bar: {
      'histogram-chart__bar--transitioned': transition.value,
      'histogram-chart__bar--visible': loaded.value && showBars.value,
    },
    path: {
      'histogram-chart__path--transitioned': transition.value,
      'histogram-chart__path--visible': loaded.value && showSmooth.value,
    },
  }))

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
  opacity-0
}

.histogram-chart__bar--transitioned { @apply
  transition-all;

  transition-property: height, opacity;
  transition-duration: v-bind(transitionDurationString);
}

.histogram-chart__bar--visible { @apply
  opacity-100
}

.histogram-chart__svg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.histogram-chart__smooth {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.histogram-chart__path { @apply
  fill-prefect-500
  stroke-prefect-300
  opacity-0
}

.histogram-chart__path--transitioned { @apply
  transition-all;
  transition-duration: v-bind(transitionDurationString);
}

.histogram-chart__path--visible { @apply
  opacity-100
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