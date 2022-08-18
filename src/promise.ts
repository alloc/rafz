import { raf } from './raf'
import type { Rafz } from './types'

type Promisable<T> = T | PromiseLike<T>

export const rafPromise = <T>(cb: (frame: Rafz.Frame) => Promisable<T>) =>
  new Promise<T>(resolve => raf(frame => resolve(cb(frame))))
