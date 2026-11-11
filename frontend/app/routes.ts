import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/onboarding.tsx'),
  route('chat', 'routes/chat.tsx'),
  route('components', 'routes/components.tsx'),
  route('api/chat', 'routes/api.chat.ts'),
] satisfies RouteConfig
