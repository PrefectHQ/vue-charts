export type BarChartItem<T = unknown> = {
  intervalStart: Date,
  intervalEnd: Date,
  value: number,
  data?: T,
}

export type DivergingBarChartItem<T = Record<string, number>> = {
  intervalStart: Date,
  intervalEnd: Date,
  data: T,
}

export type itemValueAccesor = ((item: DivergingBarChartItem) => number) | number

export type GroupSelection = d3.Selection<SVGGElement, unknown, HTMLElement, null>
export type TransitionSelection = d3.Transition<SVGGElement, unknown, HTMLElement, null>

export type DivergingBarChartData = DivergingBarChartItem['data']
export type DivergingBarChartSeries = d3.Series<DivergingBarChartData, string>
export type DivergingBarChartStack = d3.Stack<any, DivergingBarChartSeries, string>
export type DivergingBarChartSeriesPoint = d3.SeriesPoint<DivergingBarChartData>

export type TimelineChartItem<T = unknown> = {
  id: string | number,
  start: Date,
  end?: Date,
  data?: T,
}

export type ScatterPlotItem = {
  id: string,
  x: Date,
  y: number,
  itemClass?: string,
}
export type ChartProps = {
  items: ScatterPlotItem[],
}
