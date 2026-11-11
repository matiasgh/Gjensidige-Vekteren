import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { POST } from './api/chat'

// Serves api/chat.ts at /api/chat during `npm run dev` (Vercel does this in production).
function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), 'OPENAI_'))
      server.middlewares.use('/api/chat', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk)
        const response = await POST(
          new Request('http://localhost/api/chat', {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
          }),
        )
        res.writeHead(response.status, Object.fromEntries(response.headers))
        if (response.body) for await (const chunk of response.body) res.write(chunk)
        res.end()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServer()],
})
