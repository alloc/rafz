import { batchedUpdates } from 'react-batched-updates'
import { startFrameLoop } from './loop'
import { use } from './native'
import { applySteps, cancelStep, getStep, onStep } from './step'
import type { FrameFn, Rafz } from './types'

export { FrameFn }

/**
 * Schedule an update for next frame.
 * Your function can return `true` to repeat next frame.
 */
export const raf = (fn => schedule(3, fn)) as Rafz

raf.onStart = fn => schedule(1, fn)
raf.onFrame = fn => schedule(5, fn)
raf.write = fn => schedule(7, fn)
raf.onFinish = fn => schedule(9, fn)

raf.cancel = cancelStep
raf.catch = console.error
raf.use = use

/** When non-zero, scheduled functions are called immediately. */
let sync = 0

raf.sync = fn => {
  sync++
  batchedUpdates(fn)
  sync--
}

/** The last clock passed to `onUpdate` */
let now = 0
raf.now = () => now

function schedule(i: number, fn: FrameFn) {
  if (sync) {
    cancelStep(fn)
    if (!invoke(fn, 0, now)) {
      return
    }
  }
  onStep(i, fn)
  start()
}

function invoke(fn: FrameFn, dt: number, clock: number) {
  try {
    return fn(dt, clock) === true
  } catch (e) {
    raf.catch(e)
  }
}

/** This is called on every frame. */
let onUpdate: (dt: number, clock: number) => void

/** @internal */
export const start = (): any =>
  onUpdate ||
  startFrameLoop(
    (onUpdate = (dt, clock) => {
      now = clock
      applySteps(fn => {
        invoke(fn, dt, clock) && onStep(getStep(), fn)
      })
    })
  )
