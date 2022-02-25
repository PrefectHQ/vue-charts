<template>
  <main class="timeline-view">
    <m-tabs v-model="tab">
      <m-tab href="chart">Chart</m-tab>
      <m-tab href="data">Data</m-tab>
    </m-tabs>

    <div v-if="tab == 'chart'" class="timeline-view__chart mt-2">
      <Timeline
        :items="data.data"
        :start="data.start"
        :end="data.end"
        axis-teleport-target="#teleport-target"
        axis-class="caption"
        grid-line-class="timeline-view__grid-line"
      >
        <template #default="{ node }">
          <m-popover class="timeline-view__node" :placement="['top', 'bottom', 'right', 'left']">
            <template #trigger="{ toggle, open, close }">
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

    <div id="teleport-target"></div>

    <div v-if="tab == 'data'" class="timeline-view__data">
      <m-data-table :columns="columns" :rows="data.data">
        <template #column-color="{ row }">{{ row.data?.color }}</template>
        <template #column-start="{ row }">{{ row.start.toLocaleTimeString() }}</template>
        <template #column-end="{ row }">{{ row.end.toLocaleTimeString() }}</template>
      </m-data-table>
    </div>
  </main>
</template>

<script lang="ts" setup>
import Timeline from '@/Timeline.vue'
import { generateTimelineData } from '../data'
import { computed, ref } from 'vue'

const start = ref(new Date())
const tab = ref('chart')
const data = computed(() => generateTimelineData())

const columns = [
  { label: 'Start', value: 'start' },
  { label: 'End', value: 'end' },
  { label: 'Color', value: 'color' }
]

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
    border-radius: 999px;
    height: 28px;
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