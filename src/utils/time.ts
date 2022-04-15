import * as d3 from 'd3'

export type TimeIntervalKey = 'years' | 'days' | 'hours' | 'minutes' | 'seconds'
export type TimeIntervals = {
  [k in TimeIntervalKey]: number
}

export type TimeIntervalRankingValue = 0 | 1 | 2 | 3 | 4

const _y = 31536000, // Seconds in a year
  _d = 86400, // Seconds in a day
  _h = 3600, // Seconds in an hour
  _m = 60, // Seconds in a minute
  _s = 1 // Seconds in a second :)

export const TimeIntervalRanking: { [K in TimeIntervalKey]: TimeIntervalRankingValue } = {
  'years': 4,
  'days': 3,
  'hours': 2,
  'minutes': 1,
  'seconds': 0,
}

export const TimeIntervalReverseRanking: { [K in TimeIntervalRankingValue]: TimeIntervalKey } = {
  4: 'years',
  3: 'days',
  2: 'hours',
  1: 'minutes',
  0: 'seconds',
}

const aggregateSeconds = (s: number): TimeIntervals => {
  const years = Math.floor(s / _y)
  const days = Math.floor(s % _y / _d)
  const hours = Math.floor(s % _y % _d / _h)
  const minutes = Math.floor(s % _y % _d % _h / _m)
  const seconds = Math.ceil(s % _y % _d % _h % _m)

  return { years, days, hours, minutes, seconds }
}

const intervalSeconds = (s: number): TimeIntervals => {
  const years = Math.floor(s / _y)
  const days = Math.floor(s / _d)
  const hours = Math.floor(s / _h)
  const minutes = Math.floor(s / _m)
  const seconds = s

  return { years, days, hours, minutes, seconds }
}

const getLargestInterval = (s: number): TimeIntervalKey => {
  const _t = aggregateSeconds(s)

  if (_t.years > 0) {
    return 'years'
  }

  if (_t.days > 0) {
    return 'days'
  }

  if (_t.hours > 0) {
    return 'hours'
  }

  if (_t.minutes > 0) {
    return 'minutes'
  }

  return 'seconds'
}

const getSmallestInterval = (s: number): TimeIntervalKey => {
  const { seconds, minutes, hours, days, years } = intervalSeconds(s)

  const s0 = seconds == 0
  const m0 = minutes == 0
  const h0 = hours == 0
  const d0 = days == 0
  const y0 = years == 0

  if (m0 && h0 && d0 && y0) {
    return 'seconds'
  }
  if (!s0 && h0 && d0 && y0) {
    return 'minutes'
  }
  if (!m0 && d0 && y0) {
    return 'hours'
  }
  if (!h0 && y0) {
    return 'days'
  }
  return 'years'
}

const getD3IntervalMethod = (interval: TimeIntervalKey): d3.CountableTimeInterval => {
  switch (interval) {
    case 'years':
      return d3.timeYear
    case 'days':
      return d3.timeDay
    case 'hours':
      return d3.timeHour
    case 'minutes':
      return d3.timeMinute
    case 'seconds':
    default:
      return d3.timeSecond
  }
}

const getNextLowestInterval = (interval: TimeIntervalKey): TimeIntervalKey => {
  switch (interval) {
    case 'years':
      return 'days'
    case 'days':
      return 'hours'
    case 'hours':
      return 'minutes'
    case 'minutes':
      return 'seconds'
    case 'seconds':
    default:
      return 'seconds'
  }
}

const getNextHighestInterval = (interval: TimeIntervalKey): TimeIntervalKey => {
  switch (interval) {
    case 'years':
      return 'years'
    case 'days':
      return 'years'
    case 'hours':
      return 'days'
    case 'minutes':
      return 'hours'
    case 'seconds':
    default:
      return 'minutes'
  }
}


const getMinInterval = (start: Date, end: Date, min: number = 5): TimeIntervalKey => {
  const timeStart = start.getTime() / 1000 // time in seconds
  const timeEnd = end.getTime() / 1000 // time in seconds

  const _s = aggregateSeconds(timeEnd - timeStart)
  const _t = getLargestInterval(timeEnd - timeStart)

  let _temp = _t
  if (_s[_t] < min) {
    _temp = getNextLowestInterval(_t)
  }

  console.log(start.toLocaleTimeString(), end.toLocaleTimeString(), _temp)

  return _temp
}

export {
  getD3IntervalMethod, getNextLowestInterval, getNextHighestInterval, getMinInterval, getLargestInterval, aggregateSeconds, getSmallestInterval, intervalSeconds
}