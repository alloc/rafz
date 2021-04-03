import { raf } from './raf'

type VoidFn = (...args: any[]) => undefined | void

raf.throttle = fn => {
  let lastArgs: any
  function queuedFn() {
    try {
      fn(...lastArgs)
    } finally {
      lastArgs = null
    }
  }
  function throttled(...args: any) {
    lastArgs = args
    raf.onStart(queuedFn)
  }
  throttled.handler = fn
  throttled.cancel = () => {
    raf.cancel(queuedFn)
    lastArgs = null
  }
  return throttled as any
}

export type Throttled<T extends VoidFn> = T & {
  handler: T
  cancel: () => void
}

declare module './types' {
  interface Rafz {
    /**
     * Wrap a function so its execution is limited to once per frame. If called
     * more than once in a single frame, the last call's arguments are used.
     */
    throttle: <T extends VoidFn>(fn: T) => Throttled<T>
  }
}
