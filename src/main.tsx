import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
// Prerendered routes arrive with their HTML already painted — hydrate it straight away: the shell
// hydrates first and each lazy route boundary hydrates in time-sliced chunks when its code arrives
// (deferring the call made React hydrate everything in one long blocking task). The SPA fallback
// (200.html) starts empty and renders.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
