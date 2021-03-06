let now = 0
let queue: Function[] = []

export interface MockRaf {
  (cb: (now: number) => void): void
  now(): number
  step(options?: { count?: number; time?: number }): void
  flush(): void
}

export function mockRaf(cb: (now: number) => void) {
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
