import { ref, Ref } from 'vue'

export type UseChartZoom = {
  startDate: Ref<Date | null>,
  endDate: Ref<Date | null>,
}

function chartZoomFactory(): UseChartZoom {
  const startDate = ref<Date | null>(null)
  const endDate = ref<Date | null>(null)

  return {
    startDate,
    endDate,
  }
}

function namedChartZoomFactory(): (name?: string) => UseChartZoom {
  const cursors = new Map<string, UseChartZoom>()

  function getChartZoomByName(name: string): UseChartZoom {
    if (cursors.has(name)) {
      return cursors.get(name)!
    }

    const cursor = chartZoomFactory()
    cursors.set(name, cursor)

    return cursor
  }

  return (name: string = 'default') => getChartZoomByName(name)
}

export const useChartZoom = namedChartZoomFactory()