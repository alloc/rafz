export * from './mock'

/** Equals true when nothing is queued. */
export const isIdle = () => idle

let idle = true
var resetMap: Map<string, Function>
var moduleMap: Map<string, any>

afterEach(() => {
  idle = true
  resetMap.forEach(reset => reset())
})

jest.mock('./raf', getMainModule())
jest.mock('./step', getStepModule())
jest.mock('./native', getNativeModule())
jest.mock('./mock', getMockModule())

function getMainModule() {
  let module: any
  beforeEach(() => {
    // Reset the error handler, so Jest can fail tests properly.
    module.raf.catch = (err: Error) => {
      throw err
    }
  })
  return () =>
    getProxiedModule('./raf', () => {
      module = jest.requireActual('./raf')
      return module
    })
}

function getStepModule() {
  type StepModule = typeof import('./step')
  return () =>
    getProxiedModule('./step', () => {
      const module: StepModule = jest.requireActual('./step')

      return <StepModule>{
        ...module,
        onStep(i, fn) {
          idle = false
          return module.onStep(i, fn)
        },
        applySteps(apply) {
          module.applySteps(apply, () => {
            idle = true
          })
        },
      }
    })
}

function getNativeModule() {
  return () =>
    getProxiedModule('./native', () => {
      const { mockRaf } = jest.requireMock('./mock')
      return {
        nativeRaf: mockRaf,
        now: mockRaf.now,
      }
    })
}

function getMockModule() {
  return () =>
    getProxiedModule('./mock', () => {
      return jest.requireActual('./mock')
    })
}

function getProxiedModule(name: string, getModule: () => void) {
  let module = moduleMap?.get(name)
  if (module) {
    return module
  }
  try {
    jest.isolateModules(() => {
      module = getModule()
    })
  } catch (err) {
    // Since `getModule` might require another module, there's a chance
    // that the other module is also mocked with `getProxiedModule`,
    // which leads to an error from `isolateModules` nesting.
    if (/isolateModules/.test(err.message)) {
      module = getModule()
    } else {
      throw err
    }
  }
  resetMap ??= new Map()
  resetMap.set(name, () => {
    jest.isolateModules(() => {
      module = getModule()
    })
  })
  const proxy: any = {}
  for (const [key, { enumerable }] of Object.entries(
    Object.getOwnPropertyDescriptors(module)
  )) {
    let value = module[key]
    if (typeof value == 'function') {
      // Ensure cached functions reference the latest module.
      value = (...args: any[]) => {
        return module[key](...args)
      }
    }
    if (value instanceof Object) {
      for (const prop in module[key]) {
        if (typeof module[key][prop] == 'function') {
          // Ensure nested functions reference the latest module.
          const shim = (...args: any[]) => {
            return module[key][prop](...args)
          }
          Object.defineProperty(value, prop, {
            get: () => shim,
            set(value) {
              module[key][prop] = value
            },
            enumerable: true,
            configurable: true,
          })
        }
      }
    }
    Object.defineProperty(proxy, key, {
      value,
      enumerable,
      configurable: true,
    })
  }
  moduleMap ??= new Map()
  moduleMap.set(name, proxy)
  return proxy
}
