<template>
  <div ref="container" class="diverging-bar-chart">
    <template v-if="props.items.length">
      <svg :id="id" ref="chart" class="diverging-bar-chart__svg">
        <g class="diverging-bar-chart__axis-group" />
      </svg>

      <div class="diverging-bar-chart__median" :style="medianPosition" />

      <div class="diverging-bar-chart__series-container">
        <template v-for="[key, series] in seriesMap" :key="key">
          <div class="diverging-bar-chart__series" :style="calculateSeriesPosition(series.data)">
            <template v-for="seriesPoint in series.series" :key="seriesPoint.key">
              <div
                class="diverging-bar-chart__series-point"
                :style="calculateSeriesPointPosition(seriesPoint.value)"
              >
                <slot
                  v-if="slots.default"
                  :data="seriesPoint.value.data[seriesPoint.key]"
                  :key="seriesPoint.key"
                />
                <div v-else class="diverging-bar-chart__series-bar" />
              </div>
            </template>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <slot name="empty">
        <div class="diverging-bar-chart__empty">--</div>
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { useBaseChart } from './Base'
import { computed, ref, onMounted, onBeforeUpdate, useSlots } from 'vue'
import { DivergingBarChartItem, DivergingBarChartData, DivergingBarChartSeriesPoint, DivergingBarChartSeries, DivergingBarChartStack, GroupSelection, TransitionSelection } from './types'
import { formatLabel } from '@/utils/formatLabel'

const slots = useSlots()

const props = defineProps<{
  intervalStart: Date,
  intervalEnd: Date,
  intervalSeconds: number,
  items: DivergingBarChartItem<any>[],
  staticMedian?: boolean,
  showAxis?: boolean,
  positiveSentimentKeys: string[],
  negativeSentimentKeys: string[],
}>()


type sentimentDirection = 1 | -1

const sentimentMap = computed<Map<string, 1 | -1>>(() => {
  const positive = new Map<string, sentimentDirection>(props.positiveSentimentKeys.map(sen => [sen, -1]))
  const negative = new Map<string, sentimentDirection>(props.negativeSentimentKeys.map(sen => [sen, 1]))

  return new Map([...positive, ...negative])
})


const container = ref<HTMLElement>()
const xScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLinear())

const xAxisGroup: GroupSelection | undefined = d3.select('.diverging-bar-chart__axis-group')

const handleResize = (): void => {
  updateScales()
}

const { id, padding, paddingX, paddingY, svg, height, width } = useBaseChart(container, { onResize: handleResize })

const xAxis = (
  g: GroupSelection,
): GroupSelection | TransitionSelection => g
  .attr('transform', `translate(0, ${height.value})`)
  .attr('class', 'caption')
  .transition()
  .duration(150)
  .call(
    d3
      .axisTop(xScale.value)
      .tickPadding(0)
      .tickFormat(formatLabel)
      .tickSizeInner(0)
      .tickSizeOuter(0),
  )
  .call((g) => g.select('.domain').remove())


const series = computed<DivergingBarChartSeries[]>(() => {
  const cleanedItems = props.items.map((item) => item.data)

  const stack = d3
    .stack()
    .keys([...props.positiveSentimentKeys, ...props.negativeSentimentKeys])
    .value((value, key) => {
      const sentimentValue = sentimentMap.value.get(key)
      return value[key] * (sentimentValue ?? 1)
    })
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetDiverging)

  return stack(cleanedItems)
})

const seriesMap = computed<Map<Date, { data: DivergingBarChartItem, series: { key: string, value: DivergingBarChartSeriesPoint }[] }>>(() => {
  const itemsMap = props.items.map<[Date, { data: DivergingBarChartItem, series: { key: string, value: DivergingBarChartSeriesPoint }[] }]>((item, i) => {
    const seriesMap = series.value.map(s => { return { key: s.key, value: s[i] } })
    return [item.intervalStart, { data: item, series: seriesMap }]
  })

  return new Map(itemsMap)
})

const calculateSeriesPosition = (item: DivergingBarChartItem) => {
  const start = xScale.value(item.intervalStart)
  const end = xScale.value(item.intervalEnd)
  return {
    left: `${start}px`,
    width: `${end - start}px`
  }
}

const calculateSeriesPointPosition = (point: DivergingBarChartSeriesPoint) => {
  const offset = padding.middle / 2
  let start = yScale.value(point[0])
  const end = yScale.value(point[1])
  const height = end - start

  if (point[0] < 0) {
    start -= offset
  } else {
    start += offset
  }

  return {
    height: `${height}px`,
    top: `${start}px`
  }
}

const median = computed(() => {
  return yScale.value(0)
})

const medianPosition = computed(() => {
  const top = median.value > 0 ? median.value : height.value / 2
  return {
    top: `${top}px`
  }
})

const updateScales = (): void => {
  const start = props.intervalStart
  const end = props.intervalEnd

  xScale
    .value = d3.scaleTime()
      .domain([start, end])
      .range([padding.left, width.value - padding.right])

  const flattened = series.value.flat(2)
  let min = Math.min(...flattened)
  let max = Math.max(...flattened)

  if (min == max) {
    min = -1
    max = 1
  }

  const med = (max + min) / 2

  let scale = d3.scaleLinear()
    .range([
      padding.top,
      height.value - paddingY
    ])

  if (props.staticMedian) {
    const extremity = Math.max(Math.abs(min), Math.abs(max))

    // This can be used to keep a consistent middle line
    // otherwise the chart median will move with the data
    scale.domain([-extremity, extremity])
  } else {
    scale.domain([min, max])
  }

  yScale.value = scale

  if (props.showAxis && xAxisGroup) {
    xAxisGroup.call(xAxis)
  }
}

onMounted(() => {
  updateScales()
})

onBeforeUpdate(() => {
  updateScales()
})
</script>

<style lang="scss">
.diverging-bar-chart {
  box-sizing: border-box;
  height: 100%;
  position: relative;
  width: 100%;
}

.diverging-bar-chart__svg {
  height: 100%;
  width: 100%;
}

.diverging-bar-chart__median {
  background-color: red;
  height: 1px;
  left: 0;
  position: absolute;
  pointer-events: none;
  transition: top 150ms;
  width: 100%;
  z-index: 2;
}

.diverging-bar-chart__series-container {
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
}

.diverging-bar-chart__series {
  position: absolute;
  height: 100%;
}

.diverging-bar-chart__series-point {
  margin-left: auto;
  margin-right: auto;
  position: absolute;
  width: 100%;
  z-index: 1;
}

.diverging-bar-chart__series-bar {
  background-color: #465968;
  height: inherit;
  transition: all 150ms;
  width: inherit;

  &:hover,
  &:focus {
    background-color: #0035b0;
  }
}

.diverging-bar-chart__empty {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
