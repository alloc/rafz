export type NativeRaf = (cb: (timestamp: number) => void) => void

export interface Rafz {
  (update: Rafz.Effect): void

  /**
   * Prevent a queued call for any step.
   * If the given function is queued for the current step,
   * it won't be cancelled for that step, but it will be
   * for any other step.
   */
  cancel: (fn: Rafz.Effect) => void

  /**
   * To avoid performance issues, all mutations are batched with this function.
   * If the update loop is dormant, it will be started when you call this.
   */
  write: (fn: Rafz.Effect) => void

  /**
   * Run a function before updates are flushed.
   */
  onStart: (fn: Rafz.Effect) => void

  /**
   * Run a function before writes are flushed.
   */
  onFrame: (fn: Rafz.Effect) => void

  /**
   * Run a function after writes are flushed.
   */
  onFinish: (fn: Rafz.Effect) => void

  /**
   * Any function scheduled within the given callback is run immediately.
   * This escape hatch should only be used if you know what you're doing.
   */
  sync: (fn: () => void) => void

  /**
   * Set the error handler used when a queued function throws.
   */
  catch: (fn: (error: any) => void) => void

  /**
   * The sum of `frame.dt` values since the frameloop began.
   */
  now: () => number

  /**
   * Inject your own implementation of `requestAnimationFrame`
   */
  use: (nativeRaf: NativeRaf) => void
}

export namespace Rafz {
  export interface Frame {
    /** Latest timestamp from `nativeRaf` */
    ts: number
    /** Delta time from last frame to this frame */
    dt: number
    /** Sum of `dt` over time */
    clock: number
  }
  /**
   * Return `true` to be called again next frame.
   */
  export type Effect = (frame: Frame) => any
}
