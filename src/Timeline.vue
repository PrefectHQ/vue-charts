<template>
  <div ref="timeline" class="timeline" @scroll="handleTimelineScroll">
    <main ref="container" class="timeline__viewport" :style="{ height: `${chartHeight}px` }">
      <component
        v-if="isMounted && !hideAxis"
        :is="axisTeleportTarget ? Teleport : 'div'"
        :to="axisTeleportTarget"
        class="timeline__axis-container"
      >
        <nav ref="axis" class="timeline__nav" @scroll="handleAxisScroll">
          <!-- We don't need this yet but is a good PoC -->
          <svg v-if="false" :id="id + '__axis-mini'" class="timeline__axis-mini">
            <g class="timeline__axis-group" />
          </svg>

          <svg
            :id="id + '__axis'"
            class="timeline__axis"
            :style="{ width: `${baseChart.width.value}px` }"
          >
            <g class="timeline__axis-group" />
          </svg>
        </nav>
      </component>

      <svg :id="id + '__grid'" class="timeline__grid">
        <g class="timeline__grid-group" />
      </svg>

      <!-- <div class="test-container">
        <div v-for="i in 200" :key="i" class="test-row">
          <span
            v-for="j in 200"
            :style="{ 'background-color': `#${Math.floor(Math.random() * 16777215).toString(16)}` }"
            class="test-cell"
          ></span>
        </div>
      </div>-->
    </main>
  </div>
</template>

<script lang="ts" setup>
import { TimelineChartItem, GroupSelection, TransitionSelection } from './types'
import { ref, computed, onMounted, onBeforeUpdate } from 'vue'
import { formatLabel } from '@/utils/formatLabel'
import * as d3 from 'd3'
import { Teleport } from 'vue';
import useBaseChart from './Base'

const props = defineProps<{
  start?: Date,
  end?: Date,
  items: TimelineChartItem<any>[],
  axisTeleportTarget?: string,
  hideAxis?: boolean,
  axisClass?: string,
  cellWidth?: number,
  cellHeight?: number,
  minIntervalSeconds?: number,
  chartPadding?: {
    top?: number,
    bottom?: number,
    middle?: number,
    left?: number,
    right?: number
  }
}>()

const axis = ref()
const container = ref()
const timeline = ref()

const isMounted = ref(false)

const handleResize = (): void => {
  createGroupSelectors()
  updateAll()
}

const baseChart = useBaseChart(container, { onResize: handleResize })
const { id } = baseChart

const xScale = ref(d3.scaleTime())
const xMiniScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLinear())

let xAxisGroup: GroupSelection | undefined
let xMiniAxisGroup: GroupSelection | undefined
let gridGroup: GroupSelection | undefined

const _start = computed(() => {
  return props.start ?? new Date()
})

const _end = computed(() => {
  const end = new Date()
  end.setHours(end.getHours() + 1)
  return props.end ?? end
})

const intervalWidth = 150
const intervalHeight = 50

const interval = computed<d3.TimeInterval>(() => {
  return d3.timeMinute.every(1)!
})

const totalIntervals = computed<number>(() => {
  return ((_end.value.getTime() - _start.value.getTime()) / 1000 / 60)
})

const totalRows = 50

const chartWidth = computed(() => {
  return totalIntervals.value * intervalWidth
})

const chartHeight = computed(() => {
  return totalRows * intervalHeight
})

const xAxis = (scale: d3.ScaleTime<number, number, never>, ticks: number | d3.TimeInterval) => (
  g: GroupSelection,
): GroupSelection | TransitionSelection => g
  .attr('class', () => {
    const existingClasses = g.attr('class')?.split(' ') ?? []
    const propClasses = props.axisClass?.split(' ') ?? []
    const classes = [...existingClasses, ...propClasses.filter(pc => !existingClasses.includes(pc))]
    return classes.join(' ')
  })
  .call(
    d3
      .axisBottom(scale)
      .tickPadding(0)
      .ticks(interval.value)
      .tickFormat(formatLabel)
  )
  .call((g) => g.select('.domain').remove())

const updateScales = (): void => {
  xScale
    .value = d3.scaleTime()
      .domain([_start.value, _end.value])
      .range([0, chartWidth.value])

  xMiniScale
    .value = d3.scaleTime()
      .domain([_start.value, _end.value])
  // .range([baseChart.padding.left, timeline.value.offsetWidth - baseChart.padding.right])

  if (!props.hideAxis) {
    if (xAxisGroup) {
      xAxisGroup.call(xAxis(xScale.value, interval.value))
    }

    if (xMiniAxisGroup) {
      xMiniAxisGroup.call(xAxis(xMiniScale.value, Math.round(timeline.value.offsetWidth / 200)))
    }
  }
}

const updateGrid = (): void => {
  if (!gridGroup) return


  gridGroup.selectAll('.grid-line.grid-x')
    .data(Array.from({ length: totalIntervals.value }))
    .join(
      (selection: any) => selection
        .append('line')
        .attr('id', (d: any, i: number) => `grid-line-x-${i}`)
        .attr('class', 'grid-line grid-x')
        .attr('stroke', 'var(--blue-20)')
        .attr('x1', 0)
        .attr('x2', chartWidth.value)
        .attr('y1', (d: any, i: number) => i * intervalHeight)
        .attr('y2', (d: any, i: number) => i * intervalHeight),
      (selection: any) => selection
        .attr('x1', 0)
        .attr('x2', chartWidth.value)
        .attr('y1', (d: any, i: number) => i * intervalHeight)
        .attr('y2', (d: any, i: number) => i * intervalHeight),
      (selection: any) => selection.remove(),
    )

  gridGroup.selectAll('.grid-line.grid-y')
    .data(xScale.value.ticks(interval.value))
    .join(
      (selection: any) => selection
        .append('line')
        .attr('id', (d: any, i: number) => `x-${i}`)
        .attr('class', 'grid-line grid-y')
        .attr('stroke', 'var(--blue-20)')
        .attr('x1', (d: any, i: number) => xScale.value(d))
        .attr('x2', (d: any, i: number) => xScale.value(d))
        .attr('y1', 0)
        .attr('y2', chartHeight.value),
      (selection: any) => selection
        .attr('x1', (d: any, i: number) => xScale.value(d))
        .attr('x2', (d: any, i: number) => xScale.value(d))
        .attr('y1', 0)
        .attr('y2', chartHeight.value),
      (selection: any) => selection.remove(),
    )
}

const createGroupSelectors = () => {
  const axisSvg = d3.select(`#${id}__axis`)
  xAxisGroup = axisSvg.select('.timeline__axis-group')

  const axisMiniSvg = d3.select(`#${id}__axis-mini`)
  xMiniAxisGroup = axisMiniSvg.select('.timeline__axis-group')

  const gridSvg = d3.select(`#${id}__grid`)
  gridGroup = gridSvg.select('.timeline__grid-group')
}

const updateDimensions = () => {
  const axisSvg = d3.select(`#${id}__axis`)
  axisSvg.attr('viewbox', `0, 0, ${chartWidth.value}, 24`)
    .style('width', `${chartWidth.value}px`)

  const gridSvg = d3.select(`#${id}__grid`)
  gridSvg.attr('viewbox', `0, 0, ${chartWidth.value}, ${chartHeight.value}`)
    .style('width', `${chartWidth.value}px`)
    .style('height', `${chartHeight.value}px`)
}

const handleAxisScroll = () => {
  timeline.value.scroll({ left: axis.value.scrollLeft })
}

const handleTimelineScroll = () => {
  axis.value.scroll({ left: timeline.value.scrollLeft })
}

const updateAll = () => {
  updateScales()
  updateDimensions()
  updateGrid()
}

onMounted(() => {
  createGroupSelectors()
  updateAll()
  isMounted.value = true
})

onBeforeUpdate(() => {
  updateAll()
})

</script>

<style lang="scss">
.timeline {
  height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  position: relative;
  min-width: inherit;
}

.timeline__axis-container {
  position: sticky;
  display: block;
  // height: 64px;
  top: 0;
  right: 0;
  width: 100%;
}

.timeline__nav {
  max-width: 100%;
  overflow: auto;
  overscroll-behavior: contain;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

.timeline__axis-mini {
  height: 24px;
  width: 100%;
  position: sticky;
  left: 0;
  top: 0;
}

.timeline__axis {
  height: 24px;
}

.timeline__grid {
  position: absolute;
  z-index: 2;
}

.timeline__viewport {
  position: relative;
  min-width: 100%;
  height: 100%;
  width: min-content;
}

.test-container {
  margin-top: 8px;
}

.test-row {
  display: block;
  white-space: nowrap;
  margin: 0;
  padding: 0;
  z-index: -1;
}

.test-cell {
  display: inline-block;
  height: 100px;
  width: 200px;
  margin: 0;
  padding: 0;
}
</style>
