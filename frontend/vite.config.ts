import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) } },
  plugins: [tailwindcss(), reactRouter()],
  optimizeDeps: {
    // Pre-bundle route dependencies before the first load to keep React chunks stable.
    include: ['lucide-react'],
  },
})
