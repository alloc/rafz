import { mockRaf } from '../src/jest'
import { raf } from '../src/raf'
import '../src/timeout'

describe('raf.setTimeout', () => {
  it('calls a function once the delay has passed', () => {
    const fn = jest.fn()
    raf.setTimeout(fn, 20)
    mockRaf.step()
    expect(fn).not.toBeCalled()
    mockRaf.step()
    expect(fn).toBeCalled()
  })

  it('can be cancelled', () => {
    const fn = jest.fn()
    const t = raf.setTimeout(fn, 20)
    mockRaf.step()
    t.cancel()
    mockRaf.step()
    expect(fn).not.toBeCalled()
  })

  it('can throw errors to raf.catch', () => {
    const onCatch = jest.fn()
    raf.catch = onCatch
    raf.setTimeout(() => {
      throw 'lol'
    }, 10)
    mockRaf.step()
    expect(onCatch).toBeCalledWith('lol')
  })

  it('calls its functions before raf.onStart', () => {
    const onStart = jest.fn()
    raf.onStart(onStart)
    raf.setTimeout(() => {
      expect(onStart).not.toBeCalled()
    }, 10)
    mockRaf.step()
    expect.assertions(1)
  })

  it('can cancel a pending timeout from a finished one', () => {
    const fn = jest.fn()
    const t = raf.setTimeout(fn, 20)
    raf.setTimeout(() => t.cancel(), 10)
    mockRaf.step({ count: 2 })
    expect(fn).not.toBeCalled()
  })

  it('cannot cancel one timeout from another if both are finished', () => {
    const fn = jest.fn()
    const t = raf.setTimeout(fn, 15)
    raf.setTimeout(() => t.cancel(), 10)
    mockRaf.step()
    expect(fn).toBeCalled()
  })
})
