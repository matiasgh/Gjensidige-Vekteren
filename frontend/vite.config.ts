import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  optimizeDeps: {
    // Pre-bundle route dependencies before the first load to keep React chunks stable.
    include: ['lucide-react'],
  },
})
