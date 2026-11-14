import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router'
import { backend } from '../lib/backend'
import { ItemForm } from './ItemForm'
import { ItemList } from './ItemList'
import { Login } from './Login'
import { Showcase } from './Showcase'

/** /admin: the owner's corner for adding things, changing prices and arranging the sideboard. */
export default function AdminApp() {
  // undefined while the saved session is being checked, null when signed out.
  const [user, setUser] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let alive = true
    backend.currentUser().then((email) => alive && setUser(email))
    const stop = backend.onUserChange((email) => setUser(email))
    return () => {
      alive = false
      stop()
    }
  }, [])

  return (
    <div className="min-h-svh bg-inside text-lace">
      <title>Ретро · управление</title>
      <meta name="robots" content="noindex, nofollow" />

      {backend.mode === 'demo' && (
        <p className="bg-cobalt px-4 py-2.5 text-center text-[15px] leading-snug md:px-9">
          Демо-режим: изменения хранятся только в этом браузере. Подключите Supabase, чтобы они попали на сайт.
        </p>
      )}

      {user === undefined ? null : user === null ? (
        <Login />
      ) : (
        <>
          <header className="sticky top-0 z-10 bg-veneer px-4 md:px-9">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 py-3">
              <Link to="/" className="font-display text-xl font-bold tracking-[-0.03em] no-underline">
                Ретро
              </Link>
              <button type="button" onClick={() => backend.signOut()} className="min-h-11 text-base text-lace-soft hover:text-lace">
                Выйти
              </button>
            </div>
            <nav aria-label="Управление" className="mx-auto grid max-w-5xl grid-cols-3 gap-1.5 pb-3">
              {[
                { to: '/admin', label: 'Вещи', end: true },
                { to: '/admin/showcase', label: 'Витрина' },
                { to: '/admin/new', label: '+ Добавить' },
              ].map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center justify-center rounded-[3px] text-[17px] font-medium no-underline transition-colors ${
                      isActive ? 'bg-brass text-veneer-deep' : 'bg-veneer-hi hover:bg-veneer-hover'
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="mx-auto max-w-5xl px-4 pt-6 pb-24 md:px-9 md:pt-10">
            <Routes>
              <Route index element={<ItemList />} />
              <Route path="new" element={<ItemForm />} />
              <Route path="items/:id" element={<ItemForm />} />
              <Route path="showcase" element={<Showcase />} />
              <Route path="*" element={<ItemList />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  )
}
