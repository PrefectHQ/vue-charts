<template>
  <div ref="chart" class="chart-cursor" @pointermove="onPointerMove" @pointerleave="onPointerLeave">
    <slot />
    <div class="chart-cursor__cursor" :style="cursorStyles" />
    <div ref="label" class="chart-cursor__label" :style="labelStyle">
      <template v-if="cursor">
        <span class="chart-cursor__date">{{ formatDateLabel(cursor) }}</span>
        <span class="chart-cursor__time">{{ formatTimeLabel(cursor) }}</span>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { toPixels } from '@prefecthq/prefect-design'
  import { useElementRect } from '@prefecthq/vue-compositions'
  import { pointer, ScaleTime } from 'd3'
  import { computed, ref } from 'vue'
  import { formatDateLabel } from '@/utilities/formatDateLabel'
  import { formatTimeLabel } from '@/utilities/formatTimeLabel'

  const props = defineProps<{
    xScale: ScaleTime<number, number>,
  }>()

  const chart = ref<Element>()
  const { width: chartWidth } = useElementRect(chart)
  const label = ref<Element>()
  const { width: labelWidth } = useElementRect(label)
  const cursor = ref<Date | null>(null)

  const cursorStyles = computed(() => {
    if (!cursor.value) {
      return {
        display: 'none',
      }
    }

    const left = props.xScale(cursor.value)

    return {
      left: toPixels(left),
    }
  })

  const labelStyle = computed(() => {
    if (!cursor.value) {
      return {
        display: 'none',
      }
    }

    const value = props.xScale(cursor.value)
    const halfOfLabel = labelWidth.value / 2
    let left = value - halfOfLabel

    if (left < 0) {
      left = 0
    }

    if (left + labelWidth.value > chartWidth.value) {
      left = chartWidth.value - labelWidth.value
    }

    return {
      left: toPixels(left),
    }
  })

  function onPointerMove(event: MouseEvent): void {
    const [mouseX] = pointer(event, chart.value)
    cursor.value = props.xScale.clamp(true).invert(mouseX)
  }

  function onPointerLeave(): void {
    cursor.value = null
  }
</script>

<style>
.chart-cursor { @apply
  grid
  grid-cols-1
  relative
}

.chart-cursor__cursor { @apply
  absolute
  top-0
  bottom-0
  bg-black
  dark:bg-white
  pointer-events-none;
  width: 1px;
}

.chart-cursor__label { @apply
  absolute
  flex
  flex-col
  items-center
  gap-1
  whitespace-nowrap
  bg-slate-800
  p-2
  rounded;
  top: calc(100% + theme('spacing.2'));
}

.chart-cursor__date { @apply
  text-sm
  text-foreground
}

.chart-cursor__time { @apply
  text-xs
  text-foreground-200
}
</style>