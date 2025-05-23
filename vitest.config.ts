import autoImport from 'unplugin-auto-import/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,js}'],
  },
  plugins: [
    autoImport({
      imports: ['vitest'],
    }),
    tsConfigPaths(),
  ],
})
