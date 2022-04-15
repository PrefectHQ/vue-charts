import {
  timeMinute,
  timeHour,
  timeDay,
  timeMonth,
  timeWeek,
  timeYear, timeSecond
} from 'd3'
import { AxisDomain } from 'd3-axis'
import {
  formatMillisecond,
  formatSecond,
  formatMinute,
  formatHour,
  formatDay,
  formatWeek,
  formatMonth,
  formatYear
} from './formatTime'

const formatLabel = (date: AxisDomain): string => {
  if (!(date instanceof Date)) {
    return ''
  }
  return (
    timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
        ? formatSecond
        : timeHour(date) < date
          ? formatMinute
          : timeDay(date) < date
            ? formatHour
            : timeMonth(date) < date
              ? timeWeek(date) < date
                ? formatDay
                : formatWeek
              : timeYear(date) < date
                ? formatMonth
                : formatYear
  )(date)
}

export default formatLabel
export { formatLabel }