import { batchedUpdates } from 'react-batched-updates'
import { nativeRaf, now } from './native'

export function startFrameLoop(onUpdate: (dt: number, ts: number) => void) {
  let ts = now()
  function update() {
    const prevTs = ts
    onUpdate(Math.min(64, (ts = now()) - prevTs), ts)
  }
  nativeRaf(function loop() {
    nativeRaf(loop)
    batchedUpdates(update)
  })
}
