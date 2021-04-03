import { mockRaf } from '../src/jest'
import { raf } from '../src/raf'
import '../src/throttle'

describe('raf.throttle', () => {
  it('only runs once per frame', () => {
    const fn = jest.fn()
    const tfn = raf.throttle(fn)
    tfn()
    tfn()
    expect(fn).not.toBeCalled()
    mockRaf.step()
    expect(fn).toBeCalledTimes(1)
  })

  it('uses the latest arguments', () => {
    const fn = jest.fn()
    const tfn = raf.throttle(fn)
    tfn(1)
    tfn(2)
    mockRaf.step()
    expect(fn).toBeCalledWith(2)
  })

  it('can be cancelled', () => {
    const fn = jest.fn()
    const tfn = raf.throttle(fn)
    tfn()
    tfn.cancel()
    mockRaf.step()
    expect(fn).not.toBeCalled()
  })

  it('runs in the onStart step', () => {
    const onStart1 = jest.fn()
    const onStart2 = jest.fn()
    const tfn = raf.throttle(() => {
      expect(onStart1).toBeCalled()
      expect(onStart2).not.toBeCalled()
    })
    raf.onStart(onStart1)
    tfn()
    raf.onStart(onStart2)
    mockRaf.step()
    expect.assertions(2)
  })
})
