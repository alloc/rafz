import { batchedUpdates } from 'react-batched-updates'
import { nativeRaf } from './native'
import { applyCurrentFrame, hasStepEffects } from './step'
import { Rafz } from './types'

const initialFrame: Rafz.Frame = { ts: -1, dt: 0, clock: 0 }

/** For synchronous effects, the frame state is all zeroes. */
export const instantFrame: Rafz.Frame = { ...initialFrame, ts: 0 }

/** The current frame state */
export const frame = { ...initialFrame }

let loop: ((now: number) => void) | undefined

/** @internal */
export const startFrameLoop = (): any =>
  loop ||
  nativeRaf(
    (loop = now => {
      if (loop && hasStepEffects()) {
        nativeRaf(loop)

        frame.dt = frame.ts >= 0 ? Math.min(64, now - frame.ts) : 0
        frame.clock += frame.dt
        frame.ts = now

        batchedUpdates(applyCurrentFrame)
      } else {
        stopFrameLoop()
      }
    })
  )

/** @internal */
export function stopFrameLoop() {
  Object.assign(frame, initialFrame)
  loop = undefined
}
