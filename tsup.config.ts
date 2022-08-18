import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    rafz: 'src/index.ts',
    // 'rafz-jest': 'src/jest.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
})
