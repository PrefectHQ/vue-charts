import { AxisDomain, timeFormat, format } from 'd3'

const formatMillisecond = timeFormat('.%L')
const formatSecond = timeFormat(':%S')
const formatMinute = timeFormat('%I:%M')
const formatHour = timeFormat('%I %p')
const formatDay = timeFormat('%a %d')
const formatWeek = timeFormat('%b %d')
const formatMonth = timeFormat('%B')
const formatYear = timeFormat('%Y')

export const formatTime = (value: AxisDomain): string => {
  if (typeof value !== 'number') {
    return `${value.valueOf()}`
  }

  const formatter = format('.1f')
  const decimalFormat = format('.2f')

  if (value === 0) {
    return '0s'
  }

  if (value < 1) {
    return `${decimalFormat(value)}s`
  }

  return `${formatter(value)}s`
}

export {
  formatMillisecond,
  formatSecond,
  formatMinute,
  formatHour,
  formatDay,
  formatWeek,
  formatMonth,
  formatYear
}