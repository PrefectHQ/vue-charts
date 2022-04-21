import { extent } from 'd3'
import { DateExtentAccessor } from '@/types'

export function extentUndefined(extent: unknown[]): extent is [undefined, undefined] {
  return extent.some(value => value === undefined)
}

export function getDateExtent<T extends Record<string, unknown>>(items: T[], accessor: DateExtentAccessor<T>): [Date, Date] {
  const response = extent(items, accessor)
  const [start, end] = response

  if (extentUndefined(response) || start == end) {
    const dateNow = new Date
    const dayAgo = new Date(dateNow)

    dayAgo.setDate(dateNow.getDate() - 1)

    return [dayAgo, dateNow]
  }

  return response
}