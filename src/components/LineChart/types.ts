import { CurveFactory } from 'd3'

export type LineChartOptions = {
  minDate?: Date,
  maxDate?: Date,
  minValue?: number,
  maxValue?: number,
  curve?: CurveFactory,
  showXAxis?: boolean,
  showYAxis?: boolean,
}

export type LineChartDataPoint = [x: Date, y: number]
export type LineChartData = LineChartDataPoint[]
export type PointPosition = [x: number, y: number]