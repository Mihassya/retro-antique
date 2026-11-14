import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router'
import { Header } from './components/Header'
import { Visit } from './components/Visit'
import { Banknotes } from './pages/Banknotes'
import { Catalog } from './pages/Catalog'
import { Coins } from './pages/Coins'
import { Home } from './pages/Home'

// The owner's admin is its own bundle: visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

/** New page → top; a link with a hash (/#visit) → that section, once it has rendered. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Layout() {
  return (
    <>
      <ScrollManager />
      <Header />
      <Outlet />
      <Visit />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="catalog/coins" element={<Coins />} />
          <Route path="catalog/banknotes" element={<Banknotes />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
