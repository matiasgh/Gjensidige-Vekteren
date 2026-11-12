import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('onboarding', 'routes/onboarding.tsx'),
  route('chat', 'routes/chat.tsx'),
  route('skade/meld', 'routes/skade.meld.tsx'),
  route('skade/verksted', 'routes/skade.verksted.tsx'),
  route('skade/berging', 'routes/skade.berging.tsx'),
  route('components', 'routes/components.tsx'),
  route('api/chat', 'routes/api.chat.ts'),
] satisfies RouteConfig
