<template>
  <div class="heatmap-row">
    <template v-for="(itemGroup, key) in itemsGrouped" :key="key">
      <div class="heatmap-row__bucket" :style="groupStyles(itemGroup)" :class="groupClasses(itemGroup)">
        {{ itemGroup.items.length }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import kebabcase from 'lodash.kebabcase'
  import { computed, CSSProperties } from 'vue'
  import { HeatmapItem } from '../types'

  const props = defineProps<{
    items: HeatmapItem[],
    group?: string,
    extent: [Date, Date],
    bucketAmount: number,
    bucketOpacityRange: number,
  }>()

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
  const groupClass = computed(() => `heatmap-row__bucket--${kebabcase(props.group)}`)

  const bucketInterval = computed(() => {
    const [start, end] = props.extent
    const intervalInMs = end.getTime() - start.getTime()
    const bucketIntervalInMs = intervalInMs / props.bucketAmount

    return Math.ceil(bucketIntervalInMs)
  })

  const itemGroups = computed(() => {
    const [start, end] = props.extent

    let groups = []
    let currentTime = start.getTime()

    while (currentTime < end.getTime()) {
      const nextTime = currentTime + bucketInterval.value
      groups.push({ start: currentTime, end: nextTime })
      currentTime = nextTime
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
      const group = itemGroups.value.find((group, index) => {
        const isLastGroup = index == itemGroups.value.length - 1

        if (isLastGroup) {
          return group.start <= ms && group.end >= ms
        }

        return group.start <= ms && group.end > ms
      })

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
    const min = 0
    const max = groupedMaxLength.value
    const opacityGroupInterval = groupedMaxLength.value / props.bucketOpacityRange
    const opacityInterval = 1 / props.bucketOpacityRange

    let groups = []
    let currentMin = min

    while (currentMin < max) {
      let nextMin = currentMin + opacityGroupInterval
      const opacity: number = opacityInterval * (groups.length + 1)
      const minOffset = 0.1
      groups.push({ min: currentMin + minOffset, max: nextMin, opacity })
      currentMin = nextMin
    }

    return groups
  })

  function groupClasses(itemGroup: HeatMapItemGroup): (string | Record<string, boolean>)[] {
    return [
      groupClass.value,
      {
        'heatmap-row__bucket--empty': itemGroup.items.length === 0,
      },
    ]
  }

  const groupStyles = (itemGroup: HeatMapItemGroup): CSSProperties => {
    const opacity = getGroupOpacity(itemGroup)

    return {
      opacity,
    }
  }

  const getGroupOpacity = (itemGroup: HeatMapItemGroup): number => {
    const opacityGroup = opacityGroups.value.find(group => {
      return group.min <= itemGroup.items.length && group.max >= itemGroup.items.length
    })

    if (opacityGroup === undefined) {
      return 1
    }

    return opacityGroup.opacity
  }

  const bucketSize = computed(() => props.bucketAmount)
</script>

<style lang="scss">
.heatmap-row {
  --columns: v-bind(bucketSize);
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 5px;
  box-sizing: border-box;
  align-items: center;
}

.heatmap-row__bucket {
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 3px;
  background-color: var(--bucket-color, #000);
}

.heatmap-row__bucket--empty {
  background-color: #ebedf0;
}
</style>