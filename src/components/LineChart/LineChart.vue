<template>
  <ChartLabels class="line-chart" :scales="scales">
    <ChartCursor :x-scale="xScale">
      <ChartSelection v-model:selection-start="selectionStart" v-model:selection-end="selectionEnd" :x-scale="xScale">
        <div ref="chart" class="line-chart__chart">
          <svg class="line-chart__svg" :width="chartWidth" :height="chartHeight" :viewbox="`0 0 ${chartWidth} ${chartHeight}`">
            <defs>
              <linearGradient
                :id="pathGradientId"
                x1="0"
                :y1="chartHeight"
                x2="0"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" class="line-chart__path--0" />
                <stop offset="85%" class="line-chart__path--85" />
                <stop offset="100%" class="line-chart__path--100" />
              </linearGradient>
              <linearGradient :id="fillGradientId" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" class="line-chart__gradient-start" />
                <stop offset="100%" class="line-chart__gradient-stop" />
              </linearGradient>
            </defs>
            <path class="line-chart__path" :d="strokePath" />
            <path class="line-chart__fill" :d="fillPath" />
          </svg>
        </div>
      </ChartSelection>
    </ChartCursor>
  </ChartLabels>
</template>

<script lang="ts" setup>
  import { useElementRect } from '@prefecthq/vue-compositions'
  import { scaleLinear, scaleTime, line as d3Line } from 'd3'
  import { endOfToday, startOfToday } from 'date-fns'
  import { computed, ref } from 'vue'
  import ChartCursor from '@/components/ChartCursor/ChartCursor.vue'
  import ChartLabels from '@/components/ChartLabels/ChartLabels.vue'
  import { ChartLabelScales } from '@/components/ChartLabels/types'
  import ChartSelection from '@/components/ChartSelection/ChartSelection.vue'
  import { LineChartData, LineChartOptions, PointPosition } from '@/components/LineChart/types'
  import { roundUpToIncrement } from '@/utilities/roundUpToIncrement'

  const props = defineProps<{
    data: LineChartData,
    options?: LineChartOptions,
  }>()

  const chart = ref<Element>()
  const { width: chartWidth, height: chartHeight } = useElementRect(chart)
  const data = computed(() => props.data.slice().sort(([x1], [x2]) => x1.getTime() - x2.getTime()))
  const pathGradientId = computed(() => `histogram-path-gradient-${crypto.randomUUID()}`)
  const fillGradientId = computed(() => `line-chart-fill-gradient-${crypto.randomUUID()}`)
  const pathGradientIdUrl = computed(() => `url(#${pathGradientId.value})`)
  const fillGradientIdUrl = computed(() => `url(#${fillGradientId.value})`)
  const selectionStart = ref<Date | null>(null)
  const selectionEnd = ref<Date | null>(null)

  const minDate = computed<Date>(() => {
    if (props.options?.minDate) {
      return props.options.minDate
    }

    const [x] = data.value.at(0) ?? []

    return x ?? startOfToday()
  })

  const endDate = computed<Date>(() => {
    if (props.options?.maxDate) {
      return props.options.maxDate
    }

    const [x] = data.value.at(-1) ?? []

    return x ?? endOfToday()
  })

  const xScale = computed(() => {
    const scale = scaleTime()

    scale.domain([minDate.value, endDate.value])
    scale.range([0, chartWidth.value])

    return scale
  })

  const values = computed(() => data.value.map(([, y]) => y))

  const minValue = computed(() => {
    if (props.options?.minValue !== undefined) {
      return props.options.minValue
    }

    return Math.min(...values.value, 0)
  })

  const maxValue = computed(() => {
    if (props.options?.maxValue !== undefined) {
      return props.options.maxValue
    }

    const max = Math.max(...values.value, 0)

    return roundUpToIncrement(max)
  })

  const yScale = computed(() => {
    const scale = scaleLinear()

    scale.domain([minValue.value, maxValue.value])
    scale.range([chartHeight.value, 0])

    return scale
  })

  const scales = computed<ChartLabelScales>(() => ({
    x: xScale.value,
    y: yScale.value,
  }))

  const positions = computed<PointPosition[]>(() => data.value.map(([x, y]) => [xScale.value(x), yScale.value(y)]))

  const strokePath = computed<string>(() => {
    const line = d3Line()

    if (props.options?.curve) {
      line.curve(props.options.curve)
    }

    return line(positions.value) ?? ''
  })

  const fillPath = computed<string>(() => {
    const [min, max] = xScale.value.range()
    const bottomRight = `L ${max},${chartHeight.value}`
    const bottomLeft = `L ${min},${chartHeight.value}`

    return `${strokePath.value}${bottomRight}${bottomLeft}Z`
  })
</script>

<style>
.line-chart {
  min-height: 100px;
}

.line-chart__path { @apply
  fill-transparent;
  stroke-width: 2px;
  stroke: v-bind(pathGradientIdUrl);
}

.line-chart__path--0 {
  stop-color: theme('colors.prefect.700')
}

.line-chart__path--85 {
  stop-color: theme('colors.prefect.400')
}

.line-chart__path--100 {
  stop-color: theme('colors.sky.300')
}

.line-chart__fill {
  fill: v-bind(fillGradientIdUrl);
}

.dark .line-chart__gradient-start {
  stop-color: #000;
  stop-opacity: 0;
}

.line-chart__gradient-start {
  stop-color: #fff;
  stop-opacity: 0;
}

.line-chart__gradient-stop {
  stop-opacity: 0.3;
  stop-color: theme('colors.prefect.500');
}
</style>