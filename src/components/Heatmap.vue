<template>
  <div class="heatmap" :class="classes">
    <template v-if="showGroups">
      <div class="heatmap__groups">
        <template v-for="({ name }, key) in itemGroups" :key="key">
          <div class="heatmap__group">
            <slot name="group" :group="name">
              {{ name }}
            </slot>
          </div>
        </template>
      </div>
    </template>
    <div class="heatmap__rows">
      <template v-for="(itemGroup, key) in itemGroups" :key="key">
        <HeatmapRow :group="itemGroup" v-bind="{ extent, bucketAmount, bucketOpacityRange }" />
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
  import { select, scaleTime, axisBottom } from 'd3'
  import { ref, computed, onMounted, withDefaults, watch, useSlots } from 'vue'
  import { GroupSelection, HeatmapGroup, HeatmapItem, TransitionSelection } from '../types'
  import { useBaseChart } from './Base'
  import HeatmapRow from './HeatmapRow.vue'
  import { getDateExtent } from '@/utilities/extent'
  import { formatLabel } from '@/utilities/formatLabel'
  import { areHeatmapGroups } from '@/utilities/heatmap'

  const props = withDefaults(defineProps<{
    items: HeatmapItem[] | HeatmapGroup[],
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
  const baseChart = useBaseChart(container, { onResize: (): void => updateScales() })
  const xScale = ref(scaleTime())
  const items = computed(() => props.items)

  let xAxisGroup: GroupSelection | undefined

  const itemGroups = computed<HeatmapGroup[]>(() => {
    if (areHeatmapGroups(items.value)) {
      return items.value
    }

    return [
      {
        name: '',
        items: items.value,
      },
    ]
  })

  const showGroups = computed(() => {
    return itemGroups.value.length > 1 || itemGroups.value[0].name !== ''
  })

  const classes = computed(() => ({
    'heatmap--with-groups': showGroups.value,
  }))

  const extent = computed((): [Date, Date] => {
    const { startDate, endDate } = props

    if (startDate && endDate) {
      return [startDate, endDate]
    }

    const items = itemGroups.value.flatMap(group => group.items)
    let extent = getDateExtent(items, (item: HeatmapItem): Date => item.date)

    if (startDate) {
      extent[0] = startDate
    }

    if (endDate) {
      extent[1] = endDate
    }

    return extent
  })

  const ticks = computed(() => {
    const [start, end] = extent.value
    const intervalInMs = end.getTime() - start.getTime()
    const days = intervalInMs / (60*60*24*1000)
    const ticks = Math.floor(days * (baseChart.width.value / (days * 100)))

    if (isNaN(ticks) || ticks < 2) {
      return 2
    }

    return ticks
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

  watch(() => items, updateScales, { deep: true })
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