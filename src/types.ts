export type BarChartItem<T = unknown> = {
  intervalStart: Date,
  intervalEnd: Date,
  value: number,
  data?: T,
}