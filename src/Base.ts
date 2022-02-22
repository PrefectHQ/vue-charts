import { ref, onMounted, onUnmounted } from 'vue'
import d3 from 'd3'


// This is necessary until TypeScript 4.6 extends the crypto interface
declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}
export type SelectionType = d3.Selection<SVGGElement, unknown, HTMLElement, null>

export interface IBase {
  id: string
  height: number
  width: number
  container: HTMLElement
  svg: any
  padding: {
    top: number,
    bottom: number,
    middle: number,
    left: number,
    right: number,
  }

  paddingY: number
  paddingX: number

  onResize(): void

  initializeChart(): void
}

export interface IBaseOptions {
  onResize?: () => void
}

// Starting these with an underscore allows us to use UUIDs as HTMLElement ids
const _uid = () => `_${crypto.randomUUID()}`


export class Base implements IBase {
  public id: string = _uid()

  public height: number = 0
  public width: number = 0

  public container = ref<HTMLElement>() as unknown as HTMLElement
  public svg: SelectionType = null as unknown as d3.Selection<
    SVGGElement,
    unknown,
    HTMLElement,
    null
  >

  public padding = {
    top: 0,
    bottom: 0,
    middle: 0,
    left: 0,
    right: 0
  }

  constructor(options?: IBaseOptions) {
    if (options?.onResize) {
      this.onResize = options.onResize
    }
  }

  public initializeChart(): void {
    if (this.container) {
      window.addEventListener('resize', this._onResize)
      this._onResize()
    }
  }

  public teardown(): void {
    window.removeEventListener('resize', this._onResize)
  }

  public get paddingY(): number {
    return this.padding.top + this.padding.middle + this.padding.bottom
  }

  public get paddingX(): number {
    return this.padding.left + this.padding.right
  }

  public onResize(): void { }
  private _onResize(): void {
    this.height = this.container.offsetHeight
    this.width = this.container.offsetWidth

    if (this.svg) {
      this.svg.attr(
        'viewbox',
        `0, 0, ${this.width - this.paddingX}, ${this.height - this.paddingY}`,
      )
    }

    this.onResize()
  }
}

const useBaseChart = (): Base => {
  const base = new Base()

  onMounted(() => {
    requestAnimationFrame(() => {
      base.initializeChart()
    })
  })

  onUnmounted(() => {
    base.teardown()
  })

  return base
}

export default useBaseChart
export { useBaseChart }