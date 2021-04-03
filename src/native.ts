type NativeRaf = (cb: () => void) => void

export const nativeRaf =
  typeof window != 'undefined'
    ? (window.requestAnimationFrame as NativeRaf)
    : () => {}

export const now =
  typeof performance != 'undefined' ? () => performance.now() : Date.now
