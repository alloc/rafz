import { frame } from './loop'
import type { Rafz } from './types'

type Queue = Set<Rafz.Effect>

let queued = false
let queues: Queue[] = []
let catchStep: (error: any) => void = console.error
let currentStep = -1

/** Unused queues are saved here for future use */
const queuePool: Queue[] = []

export function hasStepEffects() {
  return queued
}

export function addStepEffect(i: number, fn: Rafz.Effect) {
  let queue = queues[i]
  if (!queue) {
    queue = queues[i] = queuePool.pop() || new Set()
    queued = true
  }
  queue.add(fn)
}

export function deleteStepEffect(fn: Rafz.Effect) {
  queues.forEach(queue => queue.delete(fn))
}

export function setCatchStep(fn: (error: any) => void) {
  catchStep = fn
}

export function applyCurrentFrame() {
  queued = false
  queues.forEach(applyCurrentStep)
}

function applyCurrentStep(queue: Queue, step: number) {
  currentStep = step
  delete queues[step]
  queue.forEach(applyCurrentEffect)
  queue.clear()
  queuePool.push(queue)
}

function applyCurrentEffect(effect: Rafz.Effect) {
  applyStepEffect(currentStep, effect, frame)
}

export function applyStepEffect(
  step: number,
  effect: Rafz.Effect,
  frame: Rafz.Frame
) {
  try {
    if (effect(frame) === true) {
      addStepEffect(step, effect)
      return true
    }
  } catch (e) {
    catchStep(e)
  }
}
