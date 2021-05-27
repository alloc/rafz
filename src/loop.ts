import { batchedUpdates } from 'react-batched-updates'
import { nativeRaf } from './native'

export function startFrameLoop(onUpdate: (dt: number, clock: number) => void) {
  // Latest timestamp from nativeRaf
  let ts = -1
  // Delta time from last frame to this frame
  let dt: number
  // Sum of dt over time
  let clock = 0

  function update() {
    onUpdate((dt = Math.min(64, dt)), (clock += dt))
  }

  nativeRaf(function loop(now) {
    nativeRaf(loop)

    dt = ts >= 0 ? now - ts : 0
    ts = now

    // The first call is a no-op since we have no
    // reference time to calculate the delta time.
    dt && batchedUpdates(update)
  })
}
