import * as d3 from 'd3'

export type HistogramData<T = unknown> = HistogramDataPoint<T>[]
export type HistogramDataPoint<T = unknown> = {
  value: number,
  intervalStart: Date,
  intervalEnd: Date,
  data?: T,
}

export type HistogramChartOptions = {
  showXAxis?: boolean,
  showYAxis?: boolean,
  curve?: d3.CurveFactory,
  transition?: boolean,
  transitionDuration?: number,
  selectionMinimumSeconds?: number,
  selectionMaximumSeconds?: number,
}