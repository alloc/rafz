import { NativeRaf } from './types'

let impl: NativeRaf =
  (typeof window != 'undefined' && window.requestAnimationFrame) || (() => {})

export function use(nativeRaf: NativeRaf) {
  impl = nativeRaf
}

export const nativeRaf: NativeRaf = cb => impl(cb)
