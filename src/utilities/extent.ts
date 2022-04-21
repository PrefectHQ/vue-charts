import { extent } from 'd3'
import { DateExtentAccessor } from '@/types'

export function extentUndefined(extent: unknown[]): extent is [undefined, undefined] {
  return extent.some(value => value === undefined)
}

export function getDateExtent<T extends Record<string, unknown>>(items: T[], accessor: DateExtentAccessor<T>): [Date, Date] {
  const response = extent(items, accessor)

  if (extentUndefined(response)) {
    const dateNow = new Date
    const offset = dateNow.setDate(dateNow.getDate() - 1)
    const dayAgo = new Date(offset)

    return [dayAgo, dateNow]
  }

  return response
}