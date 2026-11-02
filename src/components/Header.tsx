import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { whatsappLink } from '../data'

const links = [
  { to: '/catalog', label: 'Каталог', end: true },
  { to: '/catalog/coins', label: 'Монеты', end: false },
  { to: '/catalog/banknotes', label: 'Банкноты', end: false },
]

/**
 * A plain bar with the catalogue and WhatsApp always within reach. On the home page it stays out of
 * the way until the sideboard has scrolled off; everywhere else it is there from the start.
 */
export function Header() {
  const { pathname } = useLocation()
  const home = pathname === '/'
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    if (!home) return
    const hero = document.getElementById('top')
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), { rootMargin: '-80px 0px 0px 0px' })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [home])

  const shown = !home || pastHero

  return (
    <header
      inert={!shown}
      className={`sticky top-0 z-40 h-16 bg-veneer-deep transition-[translate] duration-300 ease-out md:h-18 ${
        shown ? 'translate-y-0' : '-translate-y-full'
      } ${home ? '-mb-16 md:-mb-18' : ''}`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-9">
        <Link to="/" className="font-display text-[22px] font-bold tracking-[-0.03em] no-underline md:text-[26px]">
          Ретро
        </Link>
        <nav aria-label="Основное" className="flex items-center gap-1 md:gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `items-center rounded-[3px] px-3 py-2.5 text-base no-underline transition-colors duration-150 hover:bg-veneer ${
                  link.to === '/catalog' ? 'flex' : 'hidden md:flex'
                } ${isActive ? 'text-brass' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href={whatsappLink('Здравствуйте! Пишу с сайта лавки «Ретро».')}
            target="_blank"
            rel="noreferrer"
            className="ml-1 flex min-h-11 items-center rounded-[3px] bg-cobalt px-4 text-base font-medium no-underline transition-[background-color,scale] duration-150 ease-out hover:bg-cobalt-hover active:scale-[0.97] md:ml-3"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
