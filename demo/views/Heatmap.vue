<template>
  <div class="controls">
    <span>BucketAmount</span>
    <input v-model="bucketAmount" type="number">
    <input v-model="color" type="color">
    <button type="button" @click="add">
      Add Item
    </button>
  </div>
  <Heatmap class="heatmap" v-bind="{ items, bucketAmount }" />
</template>

<script lang="ts" setup>
  import { ref, Ref } from 'vue'
  import Heatmap from '../../src/components/Heatmap.vue'
  import { HeatmapItem } from '../../src/types'

  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
  const now = new Date()
  const items: Ref<HeatmapItem[]> = ref(new Array(50).fill(null).map(getHeatmapItem))
  const bucketAmount = ref(30)
  const color = ref('#000000')

  function getHeatmapItem(): HeatmapItem {
    return {
      id: getRandomString(),
      date: getRandomDate(oneWeekAgo, now),
      itemClass: 'test-item',
    }
  }

  function getRandomString(): string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '')
  }

  function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  function add(): void {
    items.value.push(getHeatmapItem())
  }
</script>

<style lang="scss">
.heatmap {
  height: min-content;
  padding: 20px;
}

.controls {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.test-item {
  background-color: v-bind(color);
}
</style>