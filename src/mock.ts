let now = 0
let queue: Function[] = []

export function mockRaf(cb: () => void) {
  queue.push(cb)
}

mockRaf.now = () => now

mockRaf.step = ({ count = 1, time = 16.667 } = {}) => {
  for (let i = 0; i < count; i++) {
    const current = queue
    queue = []

    now += time
    current.forEach(cb => cb(now))
  }
}

/** Step until nothing is queued. */
mockRaf.flush = () => {
  while (queue.length) {
    mockRaf.step()
  }
}
