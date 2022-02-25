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
          <!-- Hidden for now -->
          <svg v-if="false" :id="id + '__axis-mini'" class="timeline__axis-mini">
            <g class="timeline__axis-group" />
          </svg>

          <svg :id="id + '__axis'" class="timeline__axis">
            <g class="timeline__axis-group" />
          </svg>
        </nav>
      </component>

      <svg :id="id + '__grid'" class="timeline__grid">
        <g class="timeline__grid-group" />
      </svg>

      <div class="timeline__node-container">
        <div v-for="item in items" class="timeline__node" :style="calculateNodeStyle(item)">
          <slot :node="item">
            <div class="timeline__node-content" />
          </slot>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { TimelineChartItem, GroupSelection, TransitionSelection } from './types'
import { ref, computed, onMounted, watch, nextTick, watchEffect, onBeforeUnmount } from 'vue'
import { formatLabel } from '@/utils/formatLabel'
import * as d3 from 'd3'
import { Teleport } from 'vue';
import useBaseChart from './Base'
import { getD3MinIntervalMethod } from './utils/time';
import debounce from 'lodash.debounce'

const props = defineProps<{
  start?: Date,
  end?: Date,
  items: TimelineChartItem<any>[],
  axisTeleportTarget?: string,
  hideAxis?: boolean,
  axisClass?: string,
  gridLineClass?: string,
  intervalHeight?: number,
  intervalWidth?: number,
  minIntervalSeconds?: number,
  nodeMinWidth?: number,
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
  updateAll()
}

const baseChart = useBaseChart(container, { onResize: handleResize, padding: props.chartPadding })
const { id } = baseChart

const xScale = ref(d3.scaleTime())
const xMiniScale = ref(d3.scaleTime())

let xAxisGroup: GroupSelection | undefined
let xMiniAxisGroup: GroupSelection | undefined
let gridGroup: GroupSelection | undefined

const _start = computed(() => {
  return props.start ?? new Date()
})

const _end = computed(() => {
  if (props.end && !maxEnd.value || props.end && maxEnd.value && props.end > maxEnd.value) return props.end

  const end = new Date(_start.value)
  end.setMinutes(end.getMinutes() + 1)

  if (maxEnd.value && maxEnd.value > end) return maxEnd.value
  return end
})

const intervalWidth = ref(props.intervalWidth ?? 150)
const intervalHeight = ref(props.intervalHeight ?? 50)

const interval = computed<d3.TimeInterval>(() => {
  return getD3MinIntervalMethod(_start.value, _end.value, Math.ceil(chartWidth.value / intervalWidth.value)).every(1)
})

const chartWidth = computed(() => {
  const trueChartWidth = intervals.value * intervalWidth.value
  if (trueChartWidth < timeline.value?.offsetWidth) return timeline.value?.offsetWidth
  return trueChartWidth
})

const chartHeight = computed(() => {
  // Adding 1 to this ensures we always have an extra row, which is nice visually
  const trueChartHeight = (rows.value.length + 1) * intervalHeight.value
  if (trueChartHeight < timeline.value?.offsetHeight) return timeline.value?.offsetHeight
  return trueChartHeight
})

const calculateNodeStyle = (item: TimelineChartItem) => {
  const left = xScale.value(item.start)
  const right = xScale.value(item.end || new Date())
  const top = rowMap.value.get(item.id)! * intervalHeight.value
  const width = Math.max(props.nodeMinWidth ?? 32, right - left)

  return {
    height: `${intervalHeight.value}px`,
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`
  }
}

const intervals = computed<number>(() => {
  return ((_end.value.getTime() - _start.value.getTime()) / 1000 / 60)
})

const rowMap = ref<Map<TimelineChartItem['id'], number>>(new Map())

const rows = computed(() => {
  const rows: [number, number][] = []

  sortedItems.value.forEach((item) => {
    const start = new Date(item.start)
    const end = item.end ? new Date(item.end) : new Date()
    const left = xScale.value(start)
    const right = xScale.value(end)
    const width = Math.max(props.nodeMinWidth ?? 32, right - left)

    let row = 0

    while (true) {
      const curr = rows[row]
      // If no row at this index, we create one instead and place this node on it
      if (curr) {
        const [, r] = curr
        // If the left edge of this node is greater than the right boundary of the
        // row, we can place it on this row
        if (left > r) {
          rows[row][1] = left + width
          break
        } else {
          row++
          continue
        }
      } else {
        rows[row] = [left, left + width]
        break
      }
    }

    rowMap.value.set(item.id, row)
  })

  return rows
})

const sortedItems = computed(() => {
  return props.items.sort((itemA, itemB) => new Date(itemA.start).getTime() - new Date(itemB.start).getTime())
})

const itemStarts = computed(() => {
  return props.items.map((item) => item.start.getTime())
})

const itemEnds = computed(() => {
  return props.items.filter((item) => item.end !== undefined).map((item) => item.end!.getTime())
})

const live = computed(() => {
  return !props.end || props.items.some((item) => !item.end)
})

const minStart = computed(() => {
  return new Date(Math.min(...itemStarts.value))
})

const maxEnd = computed(() => {
  const max = Math.max(...itemEnds.value)
  // Math.max returns -Infinity if no value is passed, so we check for that here
  if (max === -Infinity) return null
  return new Date(max)
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
      .range([baseChart.padding.left, chartWidth.value - baseChart.padding.right])

  xMiniScale
    .value = d3.scaleTime()
      .domain([_start.value, _end.value])
      .range([baseChart.padding.left, timeline.value.offsetWidth - baseChart.padding.right])
}

const updateAxis = (): void => {
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

  gridGroup.selectAll('.timeline__grid-line.timeline__grid-line--x')
    .data(Array.from({ length: Math.ceil(chartHeight.value / intervalHeight.value) }))
    .join(
      (selection: any) => selection
        .append('line')
        .attr('id', (d: any, i: number) => `timeline__grid-line-x-${i}`)
        .attr('class', `timeline__grid-line timeline__grid-line--x ${props.gridLineClass}`)
        .attr('x1', 0)
        .attr('x2', chartWidth.value)
        .attr('y1', (d: any, i: number) => i * intervalHeight.value)
        .attr('y2', (d: any, i: number) => i * intervalHeight.value),
      (selection: any) => selection
        .attr('x1', 0)
        .attr('x2', chartWidth.value)
        .attr('y1', (d: any, i: number) => i * intervalHeight.value)
        .attr('y2', (d: any, i: number) => i * intervalHeight.value),
      (selection: any) => selection.remove(),
    )

  gridGroup.selectAll('.timeline__grid-line.timeline__grid-line--y')
    .data(xScale.value.ticks(interval.value))
    .join(
      (selection: any) => selection
        .append('line')
        .attr('id', (d: any, i: number) => `x-${i}`)
        .attr('class', `timeline__grid-line timeline__grid-line--y ${props.gridLineClass}`)
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
    .call(() => {
      if (live.value) {
        updateAll()
      }
    })
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
  timeline.value?.scroll({ left: axis.value.scrollLeft })
}

const handleTimelineScroll = () => {
  axis.value?.scroll({ left: timeline.value.scrollLeft })
}

const updateAll = debounce(() => {
  createGroupSelectors()
  updateScales()
  updateAxis()
  updateDimensions()
  updateGrid()

  // if (timeline.value?.scrollWidth - timeline.value?.clientWidth <= timeline.value?.scrollLeft + 1) {
  //   timeline.value?.scroll({ left: timeline.value?.scrollWidth })
  // }
}, 60, { maxWait: 120 })

let liveInterval: NodeJS.Timeout
const startLiveInterval = () => {
  clearInterval(liveInterval)

  // liveInterval = setInterval(() => {
  //   updateAll()
  // }, 60)
}

const stopLiveInterval = () => {
  clearInterval(liveInterval)
}

onMounted(() => {
  updateAll()
  isMounted.value = true

  if (live.value && props.start && props.items.length > 0) {
    startLiveInterval()
  }
})

onBeforeUnmount(() => {
  clearInterval(liveInterval)
})

watchEffect(() => {
  if (!props.hideAxis) {
    // This ensures we can properly grab selectors after the dom has updated
    nextTick(() => {
      updateAll()
    })
  }
})

watch(() => [props.end, props.items, props.start], () => {
  updateAll()
})

watch(() => live.value, (prev, curr) => {
  stopLiveInterval()

  if (live.value) {
    startLiveInterval()
  }
})

watch(() => props.chartPadding, (val) => {
  baseChart.padding = { ...baseChart.padding, ...val }
})

</script>

<style lang="scss">
.timeline {
  height: 100%;
  min-width: inherit;
  overflow: auto;
  overscroll-behavior: contain;
  position: relative;
  scroll-snap-type: x proximity;
}

.timeline__axis-container {
  position: sticky;
  display: block;
  top: 0;
  right: 0;
  width: 100%;
  z-index: 2;
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
  z-index: 0;
}

.timeline__grid-line {
  stroke: #ebeef7;
}

.timeline__viewport {
  position: relative;
  min-width: 100%;
  height: 100%;
  width: min-content;
}

.timeline__node-container {
  position: relative;
}

.timeline__node {
  display: flex;
  align-items: center;
  position: absolute;
  width: 0px;
  z-index: 1;
}

.timeline__node-content {
  background-color: red;
}
</style>
