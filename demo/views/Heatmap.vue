<template>
  <div class="controls">
    <span>Buckets</span>
    <input v-model="bucketAmount" type="number">
    <span>Opacity Range</span>
    <input v-model="bucketOpacityRange" type="number">
  </div>
  <div class="controls">
    <span>Group Label Prefix</span>
    <input v-model="groupLabelPrefix" type="string">
    <span>Bucket Color</span>
  </div>
  <div class="controls">
    <input v-model="groupName" type="text">
    <button type="button" @click="addGroup(groupName)">
      Add Group
    </button>
  </div>
  <div class="controls">
    <select v-model="groupToAddTo">
      <template v-for="({ name }, index) in groups" :key="index">
        <option :value="name">
          {{ name }}
        </option>
      </template>
    </select>
    <input v-model="itemsToAdd" type="number">
    <button type="button" @click="add">
      Add Items
    </button>
    <span>Total Items: {{ items.length }}</span>
  </div>
  <Heatmap class="heatmap" :items="groups" v-bind="{ bucketAmount, bucketOpacityRange }">
    <template #group="{ group }">
      <template v-if="group.length">
        <input v-model="findGroup(group).color" type="color">
      </template>
      {{ groupLabelPrefix }}{{ group }}
    </template>
  </Heatmap>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue'
  import Heatmap from '@/components/Heatmap.vue'
  import { HeatmapGroup, HeatmapItem } from '@/types'

  const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7))
  const now = new Date()
  const bucketAmount = ref(30)
  const bucketOpacityRange = ref(4)
  const groupToAddTo = ref('')
  const itemsToAdd = ref(1)
  const groupLabelPrefix = ref('')
  const groupName = ref('')

  const groups: HeatmapGroup[] = reactive([])

  const items = computed(() => groups.flatMap(group => group.items))

  function findGroup(name: string): HeatmapGroup {
    return groups.find(group => group.name === name)!
  }

  function getRandomColor(): string {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`
  }

  function getHeatmapItem(): HeatmapItem {
    return {
      id: getRandomString(),
      date: getRandomDate(oneWeekAgo, now),
    }
  }

  function getRandomString(): string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '')
  }

  function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  function add(): void {
    addMany(groupToAddTo.value, itemsToAdd.value)
  }

  function addMany(name: string, amount: number): void {
    const newItems = new Array(amount).fill(null).map(() => getHeatmapItem())
    const group = findGroup(name)

    group.items.push(...newItems)
  }

  function addGroup(name: string): void {
    groups.push({
      name,
      items: [],
      color: getRandomColor(),
    })

    addMany(name, 50)
  }

  addGroup('Group 1')
  groupToAddTo.value = 'Group 1'
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
</style>