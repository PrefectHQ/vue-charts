<template>
  <div ref="container" class="heatmap">
    <div class="heatmap__bucket-container">
      <template v-for="(group, key) in itemsGrouped" :key="key">
        <div class="heatmap__bucket" :style="calculateOpacity(group)">
        <!-- {{ group.items.length }} -->
        </div>
      </template>
    </div>


    <svg :id="id" class="heatmap__svg">
      <g class="heatmap__x-axis-group" />
    </svg>
  </div>
</template>

<script setup lang="ts">
  import * as d3 from 'd3'
  import { ref, computed, onMounted, CSSProperties, withDefaults, watch } from 'vue'
  import { GroupSelection, HeatmapItem, TransitionSelection } from '../types'
  import { extentUndefined } from '../utilities/extent'
  import { formatLabel } from '../utilities/formatLabel'
  import { useBaseChart } from './Base'

  const props = withDefaults(defineProps<{
    items: HeatmapItem[],
    startDate?: Date | null,
    endDate?: Date | null,
    bucketAmount?: number,
    bucketOpacityRange?: number,
  }>(), {
    startDate: null,
    endDate: null,
    bucketAmount: 20,
    bucketOpacityRange: 4,
  })

  type HeatMapItemGroup = {
    start: number,
    end: number,
    items: HeatmapItem[],
  }

  type OpacityGroup = {
    min: number,
    max: number,
    opacity: number,
  }

  const container = ref<HTMLElement>()
  const xScale = ref(d3.scaleTime())
  let xAxisGroup: GroupSelection | undefined

  // SETUP BASE
  const handleResize = (): void => {
    updateScales()
  }
  const baseChart = useBaseChart(container, { onResize: handleResize })
  const { id } = baseChart


  const items = computed(() => props.items)
  const xAccessor = (item: HeatmapItem): Date => item.date

  const itemGroups = computed(() => {
    const [start, end] = extent.value
    let groups = []

    let currentDate = start.getTime()

    while (currentDate < end.getTime()) {
      let nextDate = currentDate + bucketInterval.value
      groups.push({ start: currentDate, end: nextDate })
      currentDate = nextDate
    }

    return groups
  })

  const itemsGrouped = computed<Record<number, HeatMapItemGroup>>(() => {
    const grouped = {} as Record<number, HeatMapItemGroup>

    itemGroups.value.forEach(group => {
      grouped[group.start] = {
        ...group,
        items: [],
      }
    })

    props.items.forEach(item => {
      const ms = item.date.getTime()
      const group = itemGroups.value.find(group => group.start <= ms && group.end > ms)

      if (group !== undefined) {
        grouped[group.start].items.push(item)
      }
    })

    return grouped
  })

  const opacityGroups = computed<OpacityGroup[]>(() => {
    const [min, max] = [1, groupedMaxLength.value]
    const opacityGroupInterval = groupedMaxLength.value / props.bucketOpacityRange
    const opacityInterval = 1 / props.bucketOpacityRange
    let groups = []

    let currentMin = min

    while (currentMin < max) {
      let nextMin = currentMin + opacityGroupInterval
      const opacity: number = opacityInterval * (groups.length + 1)
      groups.push({ min: currentMin, max: nextMin, opacity })
      currentMin = nextMin
    }

    return groups
  })

  const calculateOpacity = (itemGroup: HeatMapItemGroup): CSSProperties => {
    let opacity = 0
    const opacityGroup = opacityGroups.value.find(group => group.min <= itemGroup.items.length && group.max > itemGroup.items.length)

    if (opacityGroup) {
      // eslint-disable-next-line prefer-destructuring
      opacity = opacityGroup.opacity
    }

    return {
      opacity,
    }

  }

  // make this a dateExtent utility
  const extent = computed((): [Date, Date] => {
    let extent = d3.extent(items.value, xAccessor)

    if (extentUndefined(extent)) {
      let dateNow = new Date
      let offset = dateNow.setDate(dateNow.getDate() - 1)
      let dayAgo = new Date(offset)
      extent = [dayAgo, dateNow]
    }

    if (props.startDate) {
      extent[0] = props.startDate
    }

    if (props.endDate) {
      extent[1] = props.endDate
    }

    return extent
  })

  const groupedMaxLength = computed<number>(() => {
    const groupsArray = Object.values(itemsGrouped.value)

    const maxLength = Math.max(...groupsArray.map(item => item.items.length))

    return maxLength
  })

  const bucketInterval = computed(() => {
    const [start, end] = extent.value

    const intervalInMs = end.getTime() - start.getTime()
    const bucketIntervalInMs = intervalInMs / props.bucketAmount

    return Math.ceil(bucketIntervalInMs)
  })

  const ticks = computed(() => {
    if (!props.items.length) {
      return 4
    }
    const [start, end] = extent.value

    const intervalInMs = end.getTime() - start.getTime()
    const days = intervalInMs / (60*60*24*1000)

    const ticks = Math.floor(days * (baseChart.width.value / (days * 100)))
    return Math.max(ticks, 2)
  })

  const xAxis = (groupSelection: GroupSelection): GroupSelection | TransitionSelection => groupSelection
    .call(d3.axisBottom(xScale.value)
      .tickSizeInner(0)
      .ticks(ticks.value)
      .tickFormat(formatLabel),
    )

  const updateScales = (): void => {
    xScale.value = d3
      .scaleTime()
      .domain(extent.value)
      .range([0, baseChart.width.value])

    if (xAxisGroup) {
      xAxisGroup.call(xAxis)
      xAxisGroup
        .attr('font-family', 'input-sans')
        .attr('font-size', '11')
      xAxisGroup.select('.domain').style('opacity', '0')
    }
  }

  onMounted(() => {
    const svg = d3.select(`#${id}`)
    xAxisGroup = svg.select('.heatmap__x-axis-group')

    console.log(itemsGrouped)

    updateScales()
  })
</script>

<style lang="scss">
.heatmap {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
}

.heatmap__bucket-container {
  --columns: v-bind(bucketAmount);
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 5px;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
}

.heatmap__bucket {
  background-color: blue;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.heatmap__svg {
  height: 40px;
  width: 100%;
}
</style>