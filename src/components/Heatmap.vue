<template>
  <div ref="container" class="heatmap">
    <template v-for="([group, groupItems], key) in itemGroups" :key="key">
      <div class="heatmap__row-container">
        <div class="d-flex justify-end align-center" :style="{ width: `${groupLabelWidth}px` }">
          <slot name="icon" :group="group" />
        </div>
        <HeatmapRow :items="groupItems" v-bind="{ group, presets }" />
      </div>
    </template>
    <svg :id="id" class="heatmap__svg">
      <g class="heatmap__x-axis-group" />
    </svg>
  </div>
</template>

<script setup lang="ts">
  import * as d3 from 'd3'
  import { ref, computed, onMounted, withDefaults, watch } from 'vue'
  import { GroupSelection, HeatmapItem, TransitionSelection } from '../types'
  import { extentUndefined } from '../utilities/extent'
  import { formatLabel } from '../utilities/formatLabel'
  import { useBaseChart } from './Base'
  import HeatmapRow from './HeatmapRow.vue'

  const props = withDefaults(defineProps<{
    items: HeatmapItem[],
    startDate?: Date | null,
    endDate?: Date | null,
    bucketAmount?: number,
    bucketOpacityRange?: number,
    groupLabelWidth?: number,
  }>(), {
    startDate: null,
    endDate: null,
    bucketAmount: 30,
    bucketOpacityRange: 4,
    groupLabelWidth:30,
  })

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

  const itemGroups = computed(() => {
    return d3.group(items.value, item => item.group)
  })

  const xAccessor = (item: HeatmapItem): Date => item.date

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

  const presets = computed(() => ({
    extent: extent.value,
    bucketAmount: props.bucketAmount,
    bucketOpacityRange: props.bucketOpacityRange,
  }))

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
        .attr('transform', `translate(${props.groupLabelWidth}, 0)`)
        .attr('font-family', 'input-sans')
        .attr('font-size', '11')
      xAxisGroup.select('.domain').style('opacity', '0')
    }
  }

  onMounted(() => {
    const svg = d3.select(`#${id}`)
    xAxisGroup = svg.select('.heatmap__x-axis-group')

    updateScales()
  })

  watch(() => props.items, () => updateScales())
</script>

<style lang="scss">
.heatmap {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
}

.heatmap__svg {
  height: 15px;
  width: 100%;
}

.heatmap__row-container {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 5px;
}
</style>