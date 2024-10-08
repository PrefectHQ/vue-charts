<template>
  <div ref="chart" class="chart-cursor" v-bind="{ onPointerenter, onPointermove, onPointerleave }">
    <slot />
    <template v-if="showCursor">
      <div class="chart-cursor__cursor" :style="cursorStyles" />
    </template>
    <template v-if="cursor && hover">
      <div ref="label" class="chart-cursor__label-wrapper" :style="labelStyle">
        <slot name="label" :value="cursor">
          <div class="chart-cursor__label">
            <span class="chart-cursor__date">{{ formatDateLabel(cursor) }}</span>
            <span class="chart-cursor__time">{{ formatTimeLabel(cursor) }}</span>
          </div>
        </slot>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { toPixels } from '@prefecthq/prefect-design'
  import { useElementRect, useKeyDown } from '@prefecthq/vue-compositions'
  import { pointer, scaleTime } from 'd3'
  import { computed, ref } from 'vue'
  import { formatDateLabel } from '@/utilities/formatDateLabel'
  import { formatTimeLabel } from '@/utilities/formatTimeLabel'

  const props = defineProps<{
    startDate: Date,
    endDate: Date,
    cursor?: Date | null,
  }>()

  const emit = defineEmits<{
    (event: 'update:cursor', value: Date | null): void,
  }>()

  const chart = ref<Element>()
  const { width: chartWidth } = useElementRect(chart)
  const label = ref<Element>()
  const { width: labelWidth } = useElementRect(label)

  const internalCursor = ref<Date | null>(null)
  const hover = ref(false)
  const { down: shift } = useKeyDown('Shift')

  const cursor = computed({
    get() {
      return props.cursor ?? internalCursor.value
    },
    set(value: Date | null) {
      internalCursor.value = value

      emit('update:cursor', value)
    },
  })

  const showCursor = computed(() => {
    if (cursor.value === null) {
      return false
    }

    const clamped = xScaleClamped.value(cursor.value)
    const original = xScale.value(cursor.value)

    if (clamped === original) {
      return true
    }

    return false
  })

  const xScale = computed(() => {
    const scale = scaleTime()

    scale.domain([props.startDate, props.endDate])
    scale.range([0, chartWidth.value])

    return scale
  })

  const xScaleClamped = computed(() => xScale.value.copy().clamp(true))

  const cursorStyles = computed(() => {
    if (!cursor.value || !shift.value) {
      return {
        display: 'none',
      }
    }

    const left = xScale.value(cursor.value)

    return {
      left: toPixels(left),
    }
  })

  const labelStyle = computed(() => {
    if (!cursor.value || !shift.value) {
      return {
        display: 'none',
      }
    }

    const value = xScale.value(cursor.value)
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

  function onPointerenter(event: MouseEvent): void {
    hover.value = true
    setCursor(event)
  }

  function onPointermove(event: MouseEvent): void {
    setCursor(event)
  }

  function onPointerleave(): void {
    cursor.value = null
    hover.value = false
  }

  function setCursor(event: MouseEvent): void {
    const [mouseX] = pointer(event, chart.value)

    cursor.value = xScaleClamped.value.invert(mouseX)
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
  pointer-events-none
  w-[1px];
  background-color: var(--p-color-text-default);
}

.chart-cursor__label-wrapper { @apply
  absolute
  z-10;
  top: calc(100% + theme('spacing.2'));
}

.chart-cursor__label { @apply
  flex
  flex-col
  items-center
  gap-1
  whitespace-nowrap
  bg-floating
  shadow-lg
  p-2
  rounded-default
}

.chart-cursor__date { @apply
  text-sm
}

.chart-cursor__time { @apply
  text-xs
  text-subdued
}
</style>