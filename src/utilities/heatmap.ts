import { HeatmapGroup, HeatmapItem } from '@/types'

export function areHeatmapGroups(values: HeatmapItem[] | HeatmapGroup[]): values is HeatmapGroup[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (values as any[]).every(value => isHeatMapGroup(value))
}

export function isHeatMapGroup(value: HeatmapItem | HeatmapGroup): value is HeatmapGroup {
  return 'items' in value
}