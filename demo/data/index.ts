import { BarChartItem, DivergingBarChartItem, TimelineChartItem } from '@/types'
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
  skew?: 'positive' | 'negative' | undefined,
  skewMultiplier?: number,
  intervalStart?: Date,
  intervalEnd?: Date
}

type DivergingBarChartData = {
  intervalStart: Date,
  intervalEnd: Date,
  intervalSeconds: number,
  keys: string[],
  positiveSentimentKeys: string[],
  negativeSentimentKeys: string[],
  data: DivergingBarChartItem[]
}

const generateSentimentData = (options?: DivergingBarChartDataOptions): DivergingBarChartData => {
  const data: DivergingBarChartItem[] = []
  const { buckets = 30, keys = 10, intervalStart = new Date(), intervalEnd = new Date(), skew, skewMultiplier = 2 } = options ?? {}

  if (!options?.intervalEnd) {
    intervalEnd.setHours(intervalEnd.getHours() + 1)
  }

  const keyFruits: string[] = []
  for (let i = 0; i < keys; ++i) {
    const fruit = fruits[Math.floor(Math.random() * fruits.length)]
    if (!keyFruits.includes(fruit)) {
      keyFruits.push(fruit)
    }
  }

  const positiveSentimentKeys = keyFruits.slice(0, keyFruits.length / 2)
  const negativeSentimentKeys = keyFruits.slice(keyFruits.length / 2)

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
      let multiplier = 10

      if (skew == 'positive' && positiveSentimentKeys.includes(key)) {
        multiplier = multiplier * skewMultiplier
      }

      if (skew == 'negative' && negativeSentimentKeys.includes(key)) {
        multiplier = multiplier * skewMultiplier
      }

      target.data[key] = Math.floor(Math.random() * multiplier)
    }

    const proxy = new Proxy<DivergingBarChartItem>(target, {})
    data.push(proxy)

    currentTime = _intervalEnd.getTime()
  }


  return {
    intervalStart, intervalEnd, intervalSeconds: millisecondsInterval / 1000, data, keys: keyFruits, positiveSentimentKeys, negativeSentimentKeys
  }
}

export type TimelineDataOptions = {
  start?: Date,
  end?: Date,
  items?: number
}

type TimelineData = {
  start: Date,
  end: Date,
  data: TimelineChartItem[]
}

const randomDate = (start: Date, end: Date): Date => {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const date = new Date(startTime + Math.random() * (endTime - startTime))
  return date
}

const generateTimelineData = (options?: TimelineDataOptions): TimelineData => {
  const data: TimelineChartItem[] = []
  const { items = 30, start = new Date(), end = new Date() } = options ?? {}

  if (!options?.end) {
    end.setHours(end.getHours() + 1)
  }

  // Create items
  while (data.length < items) {
    const _start = randomDate(start, end)
    const _end = randomDate(_start, end)

    const target = {
      id: crypto.randomUUID(),
      start: _start,
      end: _end,
      data: {
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }
    }

    const proxy = new Proxy<TimelineChartItem>(target, {})
    data.push(proxy)
  }


  return { start, end, data }
}

export { generateBarChartData, generateSentimentData, generateTimelineData }