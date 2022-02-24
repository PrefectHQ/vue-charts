<template>
  <div ref="timeline" class="timeline" @scroll="handleTimelineScroll">
    <main ref="container" class="timeline__viewport">
      <teleport
        v-if="isMounted"
        :is="axisTeleportTarget ? 'Teleport' : 'template'"
        :to="axisTeleportTarget"
        class="timeline__svg-container"
      >
        <nav ref="axis" class="timeline__nav" @scroll="handleAxisScroll">
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
  updateScales()
}

const baseChart = useBaseChart(container, { onResize: handleResize })
const { id } = baseChart

const xScale = ref(d3.scaleTime())
const yScale = ref(d3.scaleLinear())

let xAxisGroup: GroupSelection | undefined

const _start = computed(() => {
  return props.start ?? new Date()
})

const _end = computed(() => {
  const end = new Date()
  end.setHours(end.getHours() + 12)
  return props.end ?? end
})

const xAxis = (
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
      .axisBottom(xScale.value)
      .tickPadding(0)
      .ticks(baseChart.width.value / 200)
      .tickFormat(formatLabel)
    // .tickSizeInner(0)
    // .tickSizeOuter(0),
  )
  .call((g) => g.select('.domain').remove())
// .call((g) => g.selectAll('.tick').style('opacity', 1))

const updateScales = (): void => {


  xScale
    .value = d3.scaleTime()
      .domain([_start.value, _end.value])
      .range([baseChart.padding.left, baseChart.width.value - baseChart.padding.right])

  if (!props.hideAxis && xAxisGroup) {
    xAxisGroup.call(xAxis)
  } else if (xAxisGroup) {
    xAxisGroup.selectAll('.tick').style('opacity', 0)
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

.timeline__svg {
  height: 64px;
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
