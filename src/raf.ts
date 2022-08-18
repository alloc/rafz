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

const withStep = schedule.bind.bind(schedule as any, null) as {
  (step: number): (effect: Rafz.Effect, prepend?: boolean) => void
}

/**
 * Schedule an update for next frame.
 * Your function can return `true` to repeat next frame.
 */
export const raf = withStep(3) as Rafz

raf.onStart = withStep(1)
raf.onFrame = withStep(5)
raf.write = withStep(7)
raf.onFinish = withStep(9)
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

function schedule(step: number, effect: Rafz.Effect, prepend?: boolean) {
  prepend && step--
  if (sync) {
    deleteStepEffect(effect)
    applyStepEffect(step, effect, instantFrame) && startFrameLoop()
  } else {
    addStepEffect(step, effect)
    startFrameLoop()
  }
}
