import { lazy } from 'react'
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { Shell } from './components/layout/Shell'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const Product = lazy(() => import('./pages/Product'))
const Bag = lazy(() => import('./pages/Bag'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Reserved = lazy(() => import('./pages/Reserved'))
const Account = lazy(() => import('./pages/Account'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const About = lazy(() => import('./pages/About'))
const Nri = lazy(() => import('./pages/Nri'))
const Navratri = lazy(() => import('./pages/Navratri'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const SizeGuide = lazy(() => import('./pages/SizeGuide'))

export const routes: RouteObject[] = [
  {
    element: <Shell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', element: <Shop /> },
      { path: '/shop/:category', element: <Shop /> },
      { path: '/search', element: <Shop /> },
      { path: '/catalogue', element: <Shop /> },
      { path: '/catalogue/:slug', element: <Product /> },
      { path: '/bag', element: <Bag /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/reserved/:ref', element: <Reserved /> },
      { path: '/account', element: <Account /> },
      { path: '/wishlist', element: <Wishlist /> },
      { path: '/how-it-works', element: <HowItWorks /> },
      { path: '/about', element: <About /> },
      { path: '/nri-brides', element: <Nri /> },
      { path: '/nri-brides/:country', element: <Nri /> },
      { path: '/navratri-outfits-ahmedabad', element: <Navratri /> },
      { path: '/contact', element: <Contact /> },
      { path: '/size-guide', element: <SizeGuide /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export default function App() {
  const router = createBrowserRouter(routes, {
    // prerendered pages carry the router state they were rendered with
    hydrationData: (window as Window & { __staticRouterHydrationData?: object }).__staticRouterHydrationData,
  })
  return <RouterProvider router={router} />
}
