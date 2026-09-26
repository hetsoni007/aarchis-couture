import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom'
import { routes } from './App'

/** Render one URL to static HTML. `prerender` waits for every lazy route to resolve. */
export async function render(url: string) {
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request('https://www.aarchisbyarchanasoni.com' + url))
  if (context instanceof Response) throw new Error(`redirect at ${url}`)
  const router = createStaticRouter(handler.dataRoutes, context)
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </StrictMode>,
  )
  const html = await new Response(prelude).text()
  return { html, status: context.statusCode }
}
