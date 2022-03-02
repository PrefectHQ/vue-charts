import { ref, Ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'


// This is necessary until TypeScript 4.6 extends the crypto interface
declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}
export type SelectionType = d3.Selection<SVGGElement, unknown, HTMLElement, null>
export type ElementRef = Ref<HTMLElement | undefined>

export interface IBase {
  id: string
  height: Ref<number>
  width: Ref<number>
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
  onResize?: () => void,
  padding?: {
    top?: number,
    bottom?: number,
    middle?: number,
    left?: number,
    right?: number,
  }
}

// Starting these with an underscore allows us to use UUIDs as HTMLElement ids
const _uid = () => `_${crypto?.randomUUID?.() || (crypto?.getRandomValues?.(new Uint32Array(1))[0] || new Date().getTime()) * Math.pow(2, -32) * 16}`


export class Base implements IBase {
  private container: ElementRef
  private resizeObserver: ResizeObserver | undefined

  public id: string = _uid()

  public height = ref<number>(0)
  public width = ref<number>(0)

  public padding = {
    top: 0,
    bottom: 0,
    middle: 0,
    left: 0,
    right: 0
  }

  constructor(container: ElementRef, options?: IBaseOptions) {
    if (!container) {
      throw new Error('Error initializing chart; must pass valid reference to element.')
    }

    this.container = container

    if (options?.onResize) {
      this.onResize = options.onResize
    }

    if (options?.padding) {
      this.padding = { ...this.padding, ...options.padding }
    }
  }

  public initializeChart(): void {
    if (this.container.value) {
      this.resizeObserver = new ResizeObserver(this._onResize.bind(this))
      this.resizeObserver.observe(this.container.value)
      this._onResize()
    }
  }

  public teardown(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }

  public get paddingY(): number {
    return this.padding.top + this.padding.middle + this.padding.bottom
  }

  public get paddingX(): number {
    return this.padding.left + this.padding.right
  }

  public onResize(): void { }
  private _onResize(): void {
    if (!this.container.value) return

    this.height.value = this.container.value.offsetHeight
    this.width.value = this.container.value.offsetWidth

    this.onResize()
  }
}

const useBaseChart = (container: ElementRef, options?: IBaseOptions): Base => {
  const base = new Base(container, options)

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