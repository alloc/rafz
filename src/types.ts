export type NativeRaf = (cb: (timestamp: number) => void) => void

/**
 * Return `true` to be called again next frame.
 */
export type FrameFn = (dt: number, clock: number) => any

export interface Rafz {
  (update: FrameFn): void

  /**
   * Prevent a queued call for any step.
   * If the given function is queued for the current step,
   * it won't be cancelled for that step, but it will be
   * for any other step.
   */
  cancel: (fn: FrameFn) => void

  /**
   * To avoid performance issues, all mutations are batched with this function.
   * If the update loop is dormant, it will be started when you call this.
   */
  write: (fn: FrameFn) => void

  /**
   * Run a function before updates are flushed.
   */
  onStart: (fn: FrameFn) => void

  /**
   * Run a function before writes are flushed.
   */
  onFrame: (fn: FrameFn) => void

  /**
   * Run a function after writes are flushed.
   */
  onFinish: (fn: FrameFn) => void

  /**
   * Any function scheduled within the given callback is run immediately.
   * This escape hatch should only be used if you know what you're doing.
   */
  sync: (fn: () => void) => void

  /**
   * The error handler used when a queued function throws.
   */
  catch: (error: Error) => void

  /**
   * This is responsible for providing the current time,
   * which is used when calculating the elapsed time.
   *
   * It defaults to `performance.now` when it exists,
   * otherwise `Date.now` is used.
   */
  now: () => number

  /**
   * Inject your own implementation of `requestAnimationFrame`
   */
  use: (nativeRaf: NativeRaf) => void
}
