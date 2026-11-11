import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import './app.css'

export const meta: Route.MetaFunction = () => [
  { title: "Vekter'n – Gjensidige" },
  { name: 'description', content: 'Vekteren – en AI-assistent for Gjensidige-hackathonet.' },
  { name: 'theme-color', content: '#090c33' },
]

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: 'https://cdn.gjensidige.no/builders/builders-platform/assets/favicons/gjensidige/favicon-32x32.png', sizes: '32x32' },
]

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="nb">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
