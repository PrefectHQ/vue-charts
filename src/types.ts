export type BarChartItem<T = unknown> = {
  intervalStart: Date,
  intervalEnd: Date,
  value: number,
  data?: T,
}

export type DivergingBarChartItem<T = unknown> = {
  intervalStart: Date,
  intervalEnd: Date,
  data?: T,
}

export type itemValueAccesor = ((item: DivergingBarChartItem) => number) | number

export type GroupSelection = d3.Selection<SVGGElement, unknown, HTMLElement, null>
export type TransitionSelection = d3.Transition<SVGGElement, unknown, HTMLElement, null>

export type DivergingBarChartSeries = d3.Series<DivergingBarChartItem<any>, string>