import { ref, Ref } from 'vue'

export type UseChartDateRange = {
  startDate: Ref<Date | null>,
  endDate: Ref<Date | null>,
}

function dateRangeFactory(): UseChartDateRange {
  const startDate = ref<Date | null>(null)
  const endDate = ref<Date | null>(null)

  return {
    startDate,
    endDate,
  }
}

function namedDateRangeFactory(): (name?: string) => UseChartDateRange {
  const cursors = new Map<string, UseChartDateRange>()

  function getDateRangeByName(name: string): UseChartDateRange {
    if (cursors.has(name)) {
      return cursors.get(name)!
    }

    const cursor = dateRangeFactory()
    cursors.set(name, cursor)

    return cursor
  }

  return (name: string = 'default') => getDateRangeByName(name)
}

export const useChartDateRange = namedDateRangeFactory()