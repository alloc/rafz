import { setBatchedUpdates } from 'react-batched-updates'
import { mockRaf, isIdle } from '../src/jest'
import { raf } from '../src/raf'

describe('raf', () => {
  it('queues a function for next frame', () => {
    const fn = jest.fn()
    expect(isIdle()).toBeTruthy()

    raf(fn)
    expect(fn).not.toHaveBeenCalled()
    expect(isIdle()).toBeFalsy()

    mockRaf.step()
    expect(fn).toHaveBeenCalled()
    expect(isIdle()).toBeTruthy()
  })

  it('ignores a function if already queued', () => {
    const fn = jest.fn()
    raf(fn)
    raf(fn)

    mockRaf.step()
    expect(fn).toBeCalledTimes(1)
  })

  it('receives the delta time and timestamp', () => {
    raf((dt, ts) => {
      expect(dt).toBe(64) // dt maxes out at 64
      expect(ts).toBe(100)
    })
    mockRaf.step({ time: 100 })
    expect.assertions(2)
  })

  it('can be called recursively', () => {
    const onUpdate = jest.fn(() => {
      raf(onUpdate)
    })
    raf(onUpdate)
    mockRaf.step()
    expect(onUpdate).toBeCalledTimes(1)
    mockRaf.step()
    expect(onUpdate).toBeCalledTimes(2)
  })

  it('reuses the callback for next frame if truthy is returned', () => {
    const onUpdate = jest.fn(() => true)
    raf(onUpdate)
    mockRaf.step()
    expect(onUpdate).toBeCalledTimes(1)
    mockRaf.step()
    expect(onUpdate).toBeCalledTimes(2)
  })

  it('can throw errors to raf.catch', () => {
    const onCatch = jest.fn()
    raf.catch = onCatch
    raf(() => {
      throw 'lol'
    })
    mockRaf.step()
    expect(onCatch).toBeCalledWith('lol')
  })

  it('batches React updates', () => {
    const batchedUpdates = jest.fn(cb => cb())
    setBatchedUpdates(batchedUpdates)

    raf(() => {})
    raf(() => {})

    mockRaf.step()
    expect(batchedUpdates).toBeCalledTimes(1)
  })

  afterAll(() => {
    setBatchedUpdates(cb => cb())
  })
})

describe('raf.onStart', () => {
  it('queues a function to run before `raf` updates', () => {
    const onUpdate = jest.fn()
    raf(onUpdate)
    raf.onStart(() => {
      expect(onUpdate).not.toHaveBeenCalled()
    })
    mockRaf.step()
    expect.assertions(1)
  })

  it('can call `raf` from its callback', () => {
    const onUpdate = jest.fn()
    raf.onStart(() => {
      raf(onUpdate)
    })
    mockRaf.step()
    expect(onUpdate).toHaveBeenCalled()
  })
})

describe('raf.onFrame', () => {
  it('queues a function to run after `raf` updates', () => {
    const onUpdate = jest.fn()
    raf.onFrame(() => {
      expect(onUpdate).toHaveBeenCalled()
    })
    raf(onUpdate)
    mockRaf.step()
    expect.assertions(1)
  })
})

describe('raf.write', () => {
  it('queues a function to run after `onFrame` callbacks', () => {
    const onFrame = jest.fn()
    raf.write(() => {
      expect(onFrame).toHaveBeenCalled()
    })
    raf.onFrame(onFrame)
    mockRaf.step()
    expect.assertions(1)
  })
})

describe('raf.onFinish', () => {
  it('queues a function to run after writes', () => {
    const write = jest.fn()
    raf.onFinish(() => {
      expect(write).toHaveBeenCalled()
    })
    raf.write(write)
    mockRaf.step()
    expect.assertions(1)
  })
})

describe('raf.cancel', () => {
  it('removes a function from all queues', () => {
    const fn = jest.fn()
    raf.onStart(fn)
    raf(fn)
    raf.write(fn)
    raf.cancel(fn)
    mockRaf.step()
    expect(fn).not.toBeCalled()
  })
})

describe('raf.sync', () => {
  it('causes queued functions to be called immediately', () => {
    raf.sync(() => {
      const fn = jest.fn()
      raf(fn)
      expect(fn).toBeCalled()
    })
  })
})
