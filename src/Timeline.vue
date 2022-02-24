<template>
  <div ref="timeline" class="timeline" @scroll="handleTimelineScroll">
    <main ref="container" class="timeline__viewport">
      <teleport
        v-if="isMounted && !hideAxis"
        :is="axisTeleportTarget ? 'Teleport' : 'template'"
        :to="axisTeleportTarget"
        class="timeline__svg-container"
      >
        <nav ref="axis" class="timeline__nav" @scroll="handleAxisScroll">
          <!-- We don't need this yet but is a good PoC -->
          <svg v-if="false" :id="id + '__mini'" class="timeline__svg-mini">
            <g class="timeline__axis-group" />
          </svg>

          <svg :id="id" class="timeline__svg" :style="{ width: `${baseChart.width.value}px` }">
            <g class="timeline__axis-group" />
          </svg>
        </nav>
      </teleport>

      <div class="test-container">
        <div v-for="i in 200" :key="i" class="test-row">
          <span
            v-for="j in 200"
            :style="{ 'background-color': `#${Math.floor(Math.random() * 16777215).toString(16)}` }"
            class="test-cell"
          ></span>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { TimelineChartItem, GroupSelection, TransitionSelection } from './types'
import { ref, computed, onMounted, onBeforeUpdate } from 'vue'
import { formatLabel } from '@/utils/formatLabel'
import * as d3 from 'd3'
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
  const svg = d3.select(`#${id}`)
  xAxisGroup = svg.select('.timeline__axis-group')

  const svgMini = d3.select(`#${id}__mini`)
  xMiniAxisGroup = svgMini.select('.timeline__axis-group')
  updateScales()
}

const baseChart = useBaseChart(container, { onResize: handleResize })
const { id } = baseChart

const xScale = ref(d3.scaleTime())
const xMiniScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLinear())

let xAxisGroup: GroupSelection | undefined
let xMiniAxisGroup: GroupSelection | undefined

const _start = computed(() => {
  return props.start ?? new Date()
})

const _end = computed(() => {
  const end = new Date()
  end.setHours(end.getHours() + 12)
  return props.end ?? end
})

const xAxis = (scale: d3.ScaleTime<number, number, never>, ticks: number) => (
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
      .ticks(ticks)
      .tickFormat(formatLabel)
  )
  .call((g) => g.select('.domain').remove())

const updateScales = (): void => {


  xScale
    .value = d3.scaleTime()
      .domain([_start.value, _end.value])
      .range([baseChart.padding.left, baseChart.width.value - baseChart.padding.right])

  xMiniScale
    .value = d3.scaleTime()
      .domain([_start.value, _end.value])
      .range([baseChart.padding.left, timeline.value.offsetWidth - baseChart.padding.right])

  if (!props.hideAxis) {
    if (xAxisGroup) {
      xAxisGroup.call(xAxis(xScale.value, baseChart.width.value / 200))
    }

    if (xMiniAxisGroup) {
      xMiniAxisGroup.call(xAxis(xMiniScale.value, Math.round(timeline.value.offsetWidth / 200)))
    }
  }

}

const handleAxisScroll = () => {
  timeline.value.scroll({ left: axis.value.scrollLeft })
}

const handleTimelineScroll = () => {
  axis.value.scroll({ left: timeline.value.scrollLeft })
}

onMounted(() => {
  updateScales()
  isMounted.value = true
})

onBeforeUpdate(() => {
  updateScales()
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

.timeline__svg-container {
  position: sticky;
  display: block;
  height: 64px;
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

.timeline__svg-mini {
  height: 24px;
  width: 100%;
  position: sticky;
  left: 0;
  top: 0;
}

.timeline__svg {
  height: 24px;
}

.timeline__viewport {
  position: relative;
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
