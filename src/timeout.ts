import { addStepEffect, applyStepEffect } from './step'
import { raf } from './raf'
import type { Rafz } from './types'
import { frame, startFrameLoop } from './loop'

let timeouts: Rafz.Timeout[] = []

/**
 * Run a function on the soonest frame after the given time has passed,
 * and before any updates on that particular frame.
 */
export function rafTimeout(handler: () => void, ms: number) {
  const time = raf.now() + ms
  const cancel = () => {
    let i = timeouts.findIndex(t => t.cancel == cancel)
    if (~i) timeouts.splice(i, 1)
  }

  if (!timeouts.length) {
    addStepEffect(0, flushTimeouts)
    startFrameLoop()
  }

  const timeout: Rafz.Timeout = { time, handler, cancel }
  timeouts.splice(findTimeout(time), 0, timeout)

  return timeout
}

/** Find the index where the given time is not greater. */
const findTimeout = (time: number) =>
  ~(~timeouts.findIndex(t => t.time > time) || ~timeouts.length)

/** Flush timeouts whose time is up. */
function flushTimeouts(frame: Rafz.Frame) {
  timeouts.splice(0, findTimeout(frame.clock)).forEach(onTimeout)
  return timeouts.length > 0
}

/** Reuse this function for timeout handling. */
function onTimeout(t: Rafz.Timeout) {
  applyStepEffect(0, t.handler, frame)
}

declare module './types' {
  namespace Rafz {
    export interface Timeout {
      time: number
      handler: () => void
      cancel: () => void
    }
  }
}
