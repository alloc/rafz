import { batchedUpdates } from 'react-batched-updates'
import { frame, instantFrame, startFrameLoop } from './loop'
import { use } from './native'
import {
  deleteStepEffect,
  addStepEffect,
  setCatchStep,
  applyStepEffect,
} from './step'
import type { Rafz } from './types'

/**
 * Schedule an update for next frame.
 * Your function can return `true` to repeat next frame.
 */
export const raf = (effect => schedule(3, effect)) as Rafz

raf.onStart = effect => schedule(1, effect)
raf.onFrame = effect => schedule(5, effect)
raf.write = effect => schedule(7, effect)
raf.onFinish = effect => schedule(9, effect)

raf.cancel = deleteStepEffect
raf.catch = setCatchStep
raf.now = () => frame.clock
raf.use = use

/** When non-zero, scheduled functions are called immediately. */
let sync = 0
raf.sync = fn => {
  sync++
  batchedUpdates(fn)
  sync--
}

function schedule(step: number, effect: Rafz.Effect) {
  if (sync) {
    deleteStepEffect(effect)
    applyStepEffect(step, effect, instantFrame) && startFrameLoop()
  } else {
    addStepEffect(step, effect)
    startFrameLoop()
  }
}
