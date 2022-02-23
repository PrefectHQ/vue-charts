import { BarChartItem, DivergingBarChartItem } from '@/types'
import { fruits } from './fruits'

// This is necessary until TypeScript 4.6 extends the crypto interface
declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}

export type DemoBarChartItem = BarChartItem<{ color: string }>

export type BarChartDataOptions = {
  buckets?: number,
  intervalStart?: Date,
  intervalEnd?: Date
}

type BarChartData = {
  intervalStart: Date,
  intervalEnd: Date,
  items: DemoBarChartItem[]
}

const generateBarChartData = (options?: BarChartDataOptions): BarChartData => {
  const items: DemoBarChartItem[] = []
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

    const target: DemoBarChartItem = {
      intervalStart: _intervalStart,
      intervalEnd: _intervalEnd,
      value: Math.floor(Math.random() * 100),
      data: {
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }
    }

    const proxy = new Proxy<DemoBarChartItem>(target, {})
    items.push(proxy)

    currentTime = _intervalEnd.getTime()
  }


  return { intervalStart, intervalEnd, items }
}

export type DivergingBarChartDataOptions = {
  buckets?: number,
  keys?: number,
  intervalStart?: Date,
  intervalEnd?: Date
}

type DivergingBarChartData = {
  intervalStart: Date,
  intervalEnd: Date,
  intervalSeconds: number,
  keys: string[],
  data: DivergingBarChartItem[]
}

const generateSentimentData = (options?: DivergingBarChartDataOptions): DivergingBarChartData => {
  const data: DivergingBarChartItem[] = []
  const { buckets = 30, keys = 10, intervalStart = new Date(), intervalEnd = new Date() } = options ?? {}

  if (!options?.intervalEnd) {
    intervalEnd.setHours(intervalEnd.getHours() + 1)
  }

  const keyFruits = []
  for (let i = 0; i < keys; ++i) {
    keyFruits.push(fruits[Math.floor(Math.random() * fruits.length)])
  }

  const millisecondsInterval = (intervalEnd.getTime() - intervalStart.getTime()) / buckets
  let currentTime = intervalStart.getTime()
  // Create items
  while (data.length < buckets) {
    const _intervalStart = new Date(currentTime)
    const _intervalEnd = new Date(_intervalStart.getTime() + millisecondsInterval)

    const target: DivergingBarChartItem = {
      intervalStart: _intervalStart,
      intervalEnd: _intervalEnd,
      data: {}
    }

    for (let i = 0; i < keyFruits.length; ++i) {
      const key = keyFruits[i]
      target.data[key] = Math.floor(Math.random() * 3000)
    }

    const proxy = new Proxy<DivergingBarChartItem>(target, {})
    data.push(proxy)

    currentTime = _intervalEnd.getTime()
  }


  return { intervalStart, intervalEnd, intervalSeconds: millisecondsInterval / 1000, data, keys: keyFruits }
}

export { generateBarChartData, generateSentimentData }