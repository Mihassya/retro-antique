import { NavLink } from 'react-router'
import { countCoins, countNotes, getItems } from '../data'

/** Things, coins and banknotes are three ways to look at the stock; each tab is its own page. */
export function CatalogTabs() {
  const tabs = [
    { to: '/catalog', label: 'Вещи', count: getItems().filter((i) => !i.sold).length },
    { to: '/catalog/coins', label: 'Монеты', count: countCoins() },
    { to: '/catalog/banknotes', label: 'Банкноты', count: countNotes() },
  ]

  return (
    <nav aria-label="Разделы каталога">
      <ul className="grid grid-cols-3 gap-2 md:flex">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end
              className={({ isActive }) =>
                `flex min-h-13 items-center justify-center gap-1.5 rounded-[3px] px-1.5 text-[15px] md:gap-2.5 md:px-6 md:text-[17px] font-medium no-underline transition-[background-color,scale] duration-150 ease-out active:scale-[0.97] ${
                  isActive ? 'bg-brass text-veneer-deep' : 'bg-veneer-hi text-lace hover:bg-veneer-hover'
                }`
              }
            >
              {tab.label}
              <span className="font-normal opacity-80">{tab.count}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
