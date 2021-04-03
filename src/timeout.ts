import { now } from './native'
import { onStep } from './step'
import { raf, start } from './raf'

let timeouts: Timeout[] = []

raf.setTimeout = (handler, ms) => {
  const time = now() + ms
  const cancel = () => {
    let i = timeouts.findIndex(t => t.cancel == cancel)
    if (~i) timeouts.splice(i, 1)
  }

  if (!timeouts.length) {
    onStep(0, flushTimeouts)
    start()
  }

  const timeout: Timeout = { time, handler, cancel }
  timeouts.splice(findTimeout(time), 0, timeout)

  return timeout
}

/** Find the index where the given time is not greater. */
const findTimeout = (time: number) =>
  ~(~timeouts.findIndex(t => t.time > time) || ~timeouts.length)

/** Flush timeouts whose time is up. */
function flushTimeouts(_dt: number, ts: number) {
  timeouts.splice(0, findTimeout(ts)).forEach(onTimeout)
  return timeouts.length
}

/** Reuse this function for timeout handling. */
function onTimeout(t: Timeout) {
  try {
    t.handler()
  } catch (e) {
    raf.catch(e)
  }
}

export interface Timeout {
  time: number
  handler: () => void
  cancel: () => void
}

declare module './types' {
  interface Rafz {
    /**
     * Run a function on the soonest frame after the given time has passed,
     * and before any updates on that particular frame.
     */
    setTimeout: (handler: () => void, ms: number) => Timeout
  }
}
