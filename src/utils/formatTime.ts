import { timeFormat } from 'd3'

const formatMillisecond = timeFormat('.%L')
const formatSecond = timeFormat(':%S')
const formatMinute = timeFormat('%I:%M')
const formatHour = timeFormat('%I %p')
const formatDay = timeFormat('%a %d')
const formatWeek = timeFormat('%b %d')
const formatMonth = timeFormat('%B')
const formatYear = timeFormat('%Y')

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