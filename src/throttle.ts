import { raf } from './raf'
import type { Rafz } from './types'

type VoidFn = (...args: any[]) => undefined | void

/**
 * Wrap a function so its execution is limited to once per frame. If called
 * more than once in a single frame, the last call's arguments are used.
 */
export function rafThrottle<T extends VoidFn>(fn: T): Rafz.Throttled<T> {
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

declare module './types' {
  namespace Rafz {
    export type Throttled<T extends VoidFn> = T & {
      handler: T
      cancel: () => void
    }
  }
}
