<template>
  <div class="heatmap" :class="classes">
    <template v-if="showGroups">
      <div class="heatmap__groups">
        <template v-for="([itemGroup], key) in itemGroups" :key="key">
          <div class="heatmap__group">
            <slot name="group" :group="itemGroup">
              {{ itemGroup }}
            </slot>
          </div>
        </template>
      </div>
    </template>
    <div class="heatmap__rows">
      <template v-for="([itemGroup, groupItems], key) in itemGroups" :key="key">
        <HeatmapRow :items="groupItems" :group="itemGroup" v-bind="{ extent, bucketAmount, bucketOpacityRange }" />
      </template>
    </div>
    <div ref="container" class="heatmap__chart">
      <svg :id="baseChart.id" class="heatmap__svg">
        <g class="heatmap__x-axis-group" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { select, scaleTime, group, axisBottom } from 'd3'
  import { ref, computed, onMounted, withDefaults, watch } from 'vue'
  import { GroupSelection, HeatmapItem, TransitionSelection } from '../types'
  import { useBaseChart } from './Base'
  import HeatmapRow from './HeatmapRow.vue'
  import { getDateExtent } from '@/utilities/extent'
  import { formatLabel } from '@/utilities/formatLabel'

  const props = withDefaults(defineProps<{
    items: HeatmapItem[],
    startDate?: Date | null,
    endDate?: Date | null,
    bucketAmount?: number,
    bucketOpacityRange?: number,
  }>(), {
    startDate: null,
    endDate: null,
    bucketAmount: 30,
    bucketOpacityRange: 4,
  })

  const container = ref<HTMLElement>()
  const xScale = ref(scaleTime())
  let xAxisGroup: GroupSelection | undefined

  // SETUP BASE
  const handleResize = (): void => {
    updateScales()
  }
  const baseChart = useBaseChart(container, { onResize: handleResize })
  const items = computed(() => props.items)

  const itemGroups = computed(() => {
    return group(items.value, item => item.group)
  })

  const showGroups = computed(() => {
    const keys = Array.from(itemGroups.value.keys())

    return keys.length > 1 || keys[0] !== undefined
  })

  const classes = computed(() => ({
    'heatmap--with-groups': showGroups.value,
  }))

  const extent = computed((): [Date, Date] => {
    const { startDate, endDate } = props

    if (startDate && endDate) {
      return [startDate, endDate]
    }

    let extent = getDateExtent(items.value, (item: HeatmapItem): Date => item.date)

    if (startDate) {
      extent[0] = startDate
    }

    if (endDate) {
      extent[1] = endDate
    }

    return extent
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
    .call(axisBottom(xScale.value)
      .tickSizeInner(0)
      .ticks(ticks.value)
      .tickFormat(formatLabel),
    )

  const updateScales = (): void => {
    xScale.value = scaleTime()
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
    const svg = select(`#${baseChart.id}`)
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
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.heatmap--with-groups {
  grid-template-areas: "groups rows"
                       ".      chart";
  grid-template-columns: min-content 1fr;

  .heatmap__groups {
    grid-area: groups;
  }

  .heatmap__rows {
    grid-area: rows;
  }

  .heatmap__chart {
    grid-area: chart;
  }
}

.heatmap__groups {
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: inherit;
}

.heatmap__rows {
  display: grid;
  gap: inherit;
}

.heatmap__chart {
  height: 15px;
}

.heatmap__svg {
  height: 100%;
  width: 100%;
}
</style>