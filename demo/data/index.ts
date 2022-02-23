import { BarChartItem } from '@/types'

// This is necessary until TypeScript 4.6 extends the crypto interface
declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}

export type BarChartData = BarChartItem<{ color: string }>

export type DataOptions = {
  buckets?: number,
  intervalStart?: Date,
  intervalEnd?: Date
}

type DataPayload = {
  intervalStart: Date,
  intervalEnd: Date,
  items: BarChartData[]
}

const generateData = (options?: DataOptions): DataPayload => {
  const items: BarChartData[] = []
  const { buckets = 30, intervalStart = new Date(), intervalEnd = new Date() } = options ?? {}

  if (!options?.intervalEnd) {
    intervalEnd.setHours(intervalEnd.getHours() + 1)
  }

  const millisecondsInterval = (intervalEnd.getTime() - intervalStart.getTime()) / buckets
  let currentTime = intervalStart.getTime()
  // Create items
  while (items.length < buckets) {
    const _intervalStart = new Date(currentTime)
    const _intervalEnd = new Date(_intervalStart.getTime() + millisecondsInterval)

    const target: BarChartData = {
      intervalStart: _intervalStart,
      intervalEnd: _intervalEnd,
      value: Math.floor(Math.random() * 100),
      data: {
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }
    }

    const proxy = new Proxy<BarChartData>(target, {})
    items.push(proxy)

    currentTime = _intervalEnd.getTime()
  }


  return { intervalStart, intervalEnd, items }
}

export default generateData
export { generateData }