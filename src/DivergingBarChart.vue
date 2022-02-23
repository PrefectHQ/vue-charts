<template>
  <div ref="container" class="diverging-bar-chart">
    <!-- <template v-if="_items.length"> -->
    <svg :id="id" ref="chart" class="diverging-bar-chart__svg">
      <g class="diverging-bar-chart__axis-group" />
    </svg>

    <!-- <div class="diverging-bar-chart__median" :style="medianPosition" /> -->

    <div class="diverging-bar-chart__bucket-container">
      <!-- <template v-for="item in itemsWithValue" :key="item.intervalStart">
          <div :style="calculateItemPosition(item)" class="bar-chart__item">
            <slot v-if="slots.default" :item="item" />
            <div v-else class="bar-chart__bucket" tabindex="0" />
          </div>
      </template>-->
    </div>
    <!-- </template> -->

    <!-- <template v-else> -->
    <slot name="empty">
      <div class="bar-chart__empty">--</div>
    </slot>
    <!-- </template> -->
  </div>
</template>

<script lang="ts" setup>
import * as d3 from 'd3'
import { useBaseChart } from './Base'
import { computed, ref, onMounted, onBeforeUpdate, useSlots } from 'vue'
import { DivergingBarChartItem, DivergingBarChartSeries, GroupSelection, TransitionSelection, itemValueAccesor } from './types'
import { Series } from 'd3-shape'
import { formatLabel } from '@/utils/formatLabel'
import { stringAccessor } from '@/utils/stringAccesor'

const props = defineProps<{
  intervalStart: Date,
  intervalEnd: Date,
  intervalSeconds: number,
  items: DivergingBarChartItem<any>[],
  staticMedian: boolean,
  showAxis: boolean,
  positiveSentimentKeys: string[],
  negativeSentimentKeys: string[],
  itemValue: itemValueAccesor,
}>()


type sentimentDirection = 1 | -1
const positiveSentimentMap = new Map<string, sentimentDirection>(props.positiveSentimentKeys.map(sen => [sen, 1]))
const negativeSentimentMap = new Map<string, sentimentDirection>(props.negativeSentimentKeys.map(sen => [sen, -1]))
const sentimentMap: Map<string, 1 | -1> = new Map([...positiveSentimentMap, ...negativeSentimentMap])


const container = ref<HTMLElement>()

const { id, padding, paddingX, paddingY, svg, height, width } = useBaseChart(container, { onResize: handleResize })



const xScale = d3.scaleTime()
const yScale = d3.scaleLinear()

const xAxisGroup: GroupSelection | undefined = d3.select('.diverging-bar-chart__axis-group')

const handleResize = (): void => {
  updateScales()
}


const xAxis = (
  g: GroupSelection,
): GroupSelection | TransitionSelection => g
  .attr('transform', `translate(0, ${height.value})`)
  .attr('class', 'caption')
  .transition()
  .duration(150)
  .call(
    d3
      .axisTop(xScale)
      .tickPadding(0)
      .tickFormat(formatLabel)
      .tickSizeInner(0)
      .tickSizeOuter(0),
  )
  .call((g) => g.select('.domain').remove())


const getItemValue = (item: DivergingBarChartItem): number => {
  if (props.itemValue instanceof Function) {
    return props.itemValue(item)
  } else if (typeof props.itemValue === 'string') {
    return stringAccessor(item, props.itemValue)
  } else {
    return props.itemValue
  }
}


// 
const series = () => {
  return d3
    .stack<DivergingBarChartSeries>()
    .keys([...props.positiveSentimentKeys, ...props.negativeSentimentKeys])
    .value((series: DivergingBarChartSeries, key: string) => {
      const itemValue = getItemValue(series[0].data)
      const sentimentValue = sentimentMap.get(key)
      return itemValue * (sentimentValue ?? 1)
    })
    .offset(d3.stackOffsetDiverging)([])
}

const updateScales = (): void => {
  const start = props.intervalStart
  const end = props.intervalEnd

  xScale
    .domain([start, end])
    .range([padding.left, width.value - padding.right])

  const flattened = series.flat(2)
  let min = Math.min(...flattened)
  let max = Math.max(...flattened)

  if (min == max) {
    min = -1
    max = 1
  }

  if (props.staticMedian) {
    const startMin = Math.abs(min) > Math.abs(max)
    const startEqual = Math.abs(min) === Math.abs(max)

    yScale
      // This can be used to keep a consistent middle line
      // otherwise the chart median will move with the data
      .domain([
        startMin || startEqual ? min : 0,
        startMin || startEqual ? 0 : max,
      ])
      .range([0, height.value - paddingY])
  } else {

    yScale.domain([min, max]).range([0, height.value - paddingY])
  }

  if (props.showAxis && xAxisGroup) {
    xAxisGroup.call(xAxis)
  }
}
</script>

<style lang="scss">
.bar-chart {
  height: 100%;
  position: relative;
  width: 100%;
}

.bar-chart__svg {
  height: 100%;
  width: 100%;
}

.bar-chart__median {
  bottom: 0;
  height: 1px;
  left: 0;
  position: absolute;
  transition: top 150ms;
  width: 100%;
}

.bar-chart__bucket-container {
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  width: 100%;
}

.bar-chart__item {
  position: absolute;
  transform: translateX(50%);
}

.bar-chart__bucket {
  background-color: #465968;
  border-radius: 999px;
  height: inherit;
  transform-origin: bottom;
  transition: all 150ms;
  width: inherit;
  z-index: 1;

  &:hover,
  &:focus {
    background-color: #0035b0;
  }
}

.bar-chart__empty {
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
