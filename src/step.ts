import { FrameFn } from './types'

type Queue = Set<FrameFn>

let step = -1
let queues: Queue[] = []

/** Unused queues are saved here for future use */
const queuePool: Queue[] = []

export const getStep = () => step

export const onStep = (i: number, fn: FrameFn) =>
  (queues[i] || (queues[i] = queuePool.pop() || new Set())).add(fn)

export function cancelStep(fn: FrameFn) {
  queues.forEach(queue => queue.delete(fn))
}

export function applySteps(apply: (fn: FrameFn) => void, onIdle?: () => void) {
  step = -1
  for (;;) {
    const queue = queues[++step]
    if (queue) {
      delete queues[step]
      queue.forEach(apply)
      queue.clear()
      queuePool.push(queue)
    }
    if (step == queues.length) {
      // Find the last queue for next frame.
      while (!queues[--step] && ~step) {}
      // Update the queue count.
      queues.length = step + 1
      // Notify caller when nothing is queued for next frame.
      return step < 0 && onIdle && onIdle()
    }
  }
}
