<template>
  <div class="controls">
    <span>Groups</span>
    <input v-model="numberOfGroups" type="number">
    <span>Buckets</span>
    <input v-model="bucketAmount" type="number">
    <span>Opacity Range</span>
    <input v-model="bucketOpacityRange" type="number">
  </div>
  <div class="controls">
    <span>Group Label Prefix</span>
    <input v-model="groupLabelPrefix" type="string">
    <span>Bucket Color</span>
    <input v-model="color" type="color">
  </div>
  <div class="controls">
    <select v-model="groupToAddTo">
      <template v-for="(group, index) in groups" :key="group">
        <option :value="index">
          Group {{ index + 1 }}
        </option>
      </template>
    </select>
    <input v-model="itemsToAdd" type="number">
    <button type="button" @click="add">
      Add Items
    </button>
  </div>
  <Heatmap class="heatmap" v-bind="{ items, bucketAmount, bucketOpacityRange }">
    <template #group="{ group }">
      {{ groupLabelPrefix }}{{ group }}
    </template>
  </Heatmap>
</template>

<script lang="ts" setup>
  import { computed, ref, Ref, watch } from 'vue'
  import Heatmap from '@/components/Heatmap.vue'
  import { HeatmapItem } from '@/types'

  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
  const now = new Date()
  const items: Ref<HeatmapItem[]> = ref([])
  const bucketAmount = ref(30)
  const bucketOpacityRange = ref(4)
  const color = ref('#000000')
  const numberOfGroups = ref(1)
  const groupToAddTo = ref(0)
  const itemsToAdd = ref(1)
  const groupLabelPrefix = ref('')

  const groups = computed(() => new Array(numberOfGroups.value).fill(null).map((item, index) => `Group ${index + 1}`))

  function getHeatmapItem(group: string): HeatmapItem {
    return {
      id: getRandomString(),
      date: getRandomDate(oneWeekAgo, now),
      group,
    }
  }

  function getRandomString(): string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '')
  }

  function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  function add(): void {
    const group = groups.value[groupToAddTo.value]

    addMany(group, itemsToAdd.value)
  }

  function addMany(group: string, amount: number): void {
    const newItems = new Array(amount).fill(null).map(() => getHeatmapItem(group))

    items.value.push(...newItems)
  }

  function getHeatMapItems(): void {
    groups.value.forEach(group => addMany(group, 50))
  }

  watch(numberOfGroups, () => {
    items.value = []

    getHeatMapItems()
  }, { immediate: true })
</script>

<style lang="scss">
.heatmap {
  height: min-content;
  padding: 8px;
}

.controls {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.heatmap-row__bucket {
  background-color: v-bind(color);
}
</style>