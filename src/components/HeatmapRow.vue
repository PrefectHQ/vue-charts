<template>
  <div class="heatmap-row__bucket-container">
    <template v-for="(itemGroup, key) in itemsGrouped" :key="key">
      <div class="heatmap-row__bucket" :style="calculateOpacity(itemGroup)" :class="groupClass">
        <!-- {{ itemGroup.items.length }} -->
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, CSSProperties } from 'vue'
  import { HeatmapItem } from '../types'

  const props = defineProps<{
    items: HeatmapItem[],
    group?: string,
    presets: HeatmapPresets,
  }>()

  type HeatmapPresets = {
    extent: Date[],
    bucketAmount: number,
    bucketOpacityRange: number,
  }

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

  const items = computed(() => props.items)
  // need to replace 'scatter-plot-item--' with proper value
  const groupClass = computed(() => `scatter-plot-item--${props.group}`)

  const bucketInterval = computed(() => {
    const [start, end] = props.presets.extent

    const intervalInMs = end.getTime() - start.getTime()
    const bucketIntervalInMs = intervalInMs / props.presets.bucketAmount

    return Math.ceil(bucketIntervalInMs)
  })


  const itemGroups = computed(() => {
    const [start, end] = props.presets.extent
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
    const grouped: Record<number, HeatMapItemGroup> = {}

    itemGroups.value.forEach(group => {
      grouped[group.start] = {
        ...group,
        items: [],
      }
    })

    items.value.forEach((item: { date: Date, id: string, itemClass?: string | undefined }) => {
      const ms = item.date.getTime()
      const group = itemGroups.value.find(group => group.start <= ms && group.end > ms)

      if (group !== undefined) {
        grouped[group.start].items.push(item)
      }
    })

    return grouped
  })

  const groupedMaxLength = computed<number>(() => {
    const groupsArray = Object.values(itemsGrouped.value)

    const maxLength = Math.max(...groupsArray.map(item => item.items.length))

    return maxLength
  })

  const opacityGroups = computed<OpacityGroup[]>(() => {
    const [min, max] = [1, groupedMaxLength.value]
    const opacityGroupInterval = groupedMaxLength.value / props.presets.bucketOpacityRange
    const opacityInterval = 1 / props.presets.bucketOpacityRange
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

    if (!opacityGroup) {
      return {
        backgroundColor: '#ebedf0',
        border: 'rgba(27, 31, 35, 0.06)',
        opacity: 1,
      }
    }

    return { opacity }
  }

  const bucketSize = computed(() => props.presets.bucketAmount)
</script>

<style lang="scss">
.heatmap-row__bucket-container {
  --columns: v-bind(bucketSize);
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 5px;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
  align-items: center;
  margin-bottom: 5px;
}

.heatmap-row__bucket {
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 3px;
  background-color: #000;
}
</style>