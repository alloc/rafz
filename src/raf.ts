import { batchedUpdates } from 'react-batched-updates'
import { startFrameLoop } from './loop'
import { now } from './native'
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
raf.now = now

/** When non-zero, scheduled functions are called immediately. */
let sync = 0

raf.sync = fn => {
  sync++
  batchedUpdates(fn)
  sync--
}

function schedule(i: number, fn: FrameFn) {
  if (sync) {
    cancelStep(fn)
    if (!invoke(fn, 0, now())) {
      return
    }
  }
  onStep(i, fn)
  start()
}

function invoke(fn: FrameFn, dt: number, ts: number) {
  try {
    return fn(dt, ts)
  } catch (e) {
    raf.catch(e)
  }
}

/** This is called on every frame. */
let onUpdate: (dt: number, ts: number) => void

/** @internal */
export const start = (): any =>
  onUpdate ||
  startFrameLoop(
    (onUpdate = (dt, ts) =>
      applySteps(fn => {
        invoke(fn, dt, ts) && onStep(getStep(), fn)
      }))
  )
