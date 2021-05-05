import { NativeRaf } from './types'

let impl: NativeRaf
if (typeof window != 'undefined') {
  impl = window.requestAnimationFrame
}

export function use(nativeRaf: NativeRaf) {
  impl = nativeRaf
}

export const nativeRaf: NativeRaf = cb => impl(cb)

export const now =
  typeof performance != 'undefined' ? () => performance.now() : Date.now
