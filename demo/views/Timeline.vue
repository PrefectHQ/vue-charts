<template>
  <main class="timeline-view">
    <div class="mb-2 d-flex align-center justify-start">
      <m-checkbox v-model="live">
        Live
      </m-checkbox>
      <m-checkbox v-model="hideAxis">
        Hide Axis
      </m-checkbox>
      <m-button class="ml-4" @click="reset">
        Reset
      </m-button>
      <m-button class="ml-4" @click="generateFull">
        Generate Full Dataset
      </m-button>

      <div class="ml-2">
        <div>
          Start:
          <strong>{{ data.start?.toLocaleString() }}</strong>
        </div>
        <div>
          End:
          <strong>{{ data.end?.toLocaleString() }}</strong>
        </div>
      </div>
    </div>

    <m-tabs v-model="tab">
      <m-tab href="chart">
        Chart
      </m-tab>
      <m-tab href="data">
        Data
      </m-tab>
    </m-tabs>

    <div v-if="tab == 'chart'" class="timeline-view__chart mt-2">
      <Timeline
        :items="data?.data ?? []"
        :start="data?.start"
        :end="data?.end"
        :hide-axis="hideAxis"
        axis-class="caption"
        grid-line-class="timeline-view__grid-line"
        :node-min-width="28"
        :chart-padding="{ left: 28, right: 28 }"
      >
        <!-- axis-teleport-target="#teleport-target" -->

        <template #default="{ node }">
          <m-popover class="timeline-view__node" :placement="['top', 'bottom', 'right', 'left']">
            <template #trigger="{ open, close }">
              <div
                class="timeline-view__node"
                :style="{ 'background-color': node.data.color }"
                tabindex="0"
                @focusin="open"
                @focusout="close"
                @mouseenter="open"
                @mouseleave="close"
              />
            </template>

            <template #header>
              <strong>{{ node.id }}</strong>
            </template>

            <div>
              <strong>Start:</strong>
              {{ node.start?.toLocaleTimeString() }}
            </div>
            <div>
              <strong>End:</strong>
              {{ node.end?.toLocaleTimeString() }}
            </div>
          </m-popover>
        </template>
      </Timeline>
    </div>

    <div id="teleport-target" />

    <div v-if="tab == 'data'" class="timeline-view__data">
      <m-data-table :columns="columns" :rows="data?.data ?? []">
        <template #column-color="{ row }">
          {{ row.data?.color }}
        </template>
        <template #column-start="{ row }">
          {{ row.start.toLocaleTimeString() }}
        </template>
        <template #column-end="{ row }">
          {{ row.end.toLocaleTimeString() }}
        </template>
      </m-data-table>
    </div>
  </main>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import { generateRandomTimelineData, generateInitialTimelineData, updateTimelineData, TimelineData } from '../data'
  import Timeline from '@/components/Timeline.vue'

  let liveInterval: ReturnType<typeof setInterval> | undefined

  const live = ref(false)
  const hideAxis = ref(false)
  const tab = ref('chart')
  const data = ref<TimelineData>(generateInitialTimelineData())

  const reset = (): void => {
    stopLiveInterval()

    data.value = generateInitialTimelineData()

    if (live.value) {
      startLiveInterval()
    }
  }

  const columns = [
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Color', value: 'color' },
  ]

  const generateFull = (): void => {
    stopLiveInterval()
    live.value = false

    data.value = generateRandomTimelineData()
  }

  const startLiveInterval = (): void => {
    if (liveInterval) {
      clearInterval(liveInterval)
    }

    data.value = updateTimelineData(data.value, false, 0.9)

    liveInterval = setInterval(() => {
      data.value = updateTimelineData(data.value, false, 0.9)
    }, 3000)
  }

  const stopLiveInterval = (): void => {
    if (liveInterval) {
      clearInterval(liveInterval)
    }

    data.value = updateTimelineData(data.value, true)
  }

  watch(() => live.value, () => {
    if (live.value) {
      startLiveInterval()
    } else {
      stopLiveInterval()
    }
  })
</script>

<style lang="scss">
.timeline-view {
  padding: 24px;
  width: inherit;

  &__chart {
    border-radius: 8px;
    border: 2px solid #465968;
    background-color: #f7f8fa;
    height: 400px;
    max-height: 100vh;
    min-height: 200px;
    max-width: calc(100vw - 48px);
    min-width: 400px;
    overflow: auto;
    resize: both;
  }

  &__node {
    background-color: #6680ee;
    border-radius: 9px;
    height: 12px;
    width: 100%;
  }
}

.timeline-view__grid-line {
  stroke: #d2d9df;
  stroke-opacity: 0.5;
}

#teleport-target {
  max-width: 100%;
}
</style>