import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Chip } from '../components/Chip'
import { categories, formatPrice, useItems, type Category } from '../data'
import { Thumb, inputClass } from './ui'

const categoryIds = Object.keys(categories) as Category[]

export function ItemList() {
  const { items, failed } = useItems()
  const notice = (useLocation().state as { notice?: string } | null)?.notice
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | null>(null)

  const q = query.trim().toLowerCase()
  const shown = (items ?? []).filter(
    (i) => (!category || i.category === category) && (!q || `${i.name} ${i.origin} ${i.description ?? ''}`.toLowerCase().includes(q)),
  )

  return (
    <div className="grid gap-6">
      {notice && (
        <p role="status" className="rounded-[3px] bg-[#2f4a3a] px-4 py-3">
          {notice}
        </p>
      )}

      <div className="grid gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти по названию"
          aria-label="Найти по названию"
          className={inputClass}
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <Chip pressed={!category} onClick={() => setCategory(null)}>
            Всё
          </Chip>
          {categoryIds.map((id) => (
            <Chip key={id} pressed={category === id} onClick={() => setCategory(category === id ? null : id)}>
              {categories[id].label}
            </Chip>
          ))}
        </div>
      </div>

      {items === null ? (
        <p className="text-lace-soft">Загружаем…</p>
      ) : failed ? (
        <p role="alert">Не удалось загрузить вещи. Проверьте интернет и обновите страницу.</p>
      ) : shown.length === 0 ? (
        <div className="grid justify-items-start gap-4 rounded-[3px] bg-veneer-deep p-6">
          <p>{items.length ? 'Ничего не нашлось.' : 'Пока ни одной вещи.'}</p>
          <Link to="/admin/new" className="text-brass underline">
            Добавить вещь
          </Link>
        </div>
      ) : (
        <ul className="grid gap-2">
          {shown.map((item) => (
            <li key={item.id}>
              <Link
                to={`/admin/items/${item.id}`}
                className="grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-[3px] bg-veneer-deep p-2 pr-4 no-underline transition-colors hover:bg-veneer"
              >
                <Thumb src={item.image} className={`size-18 ${item.sold ? 'opacity-50 grayscale' : ''}`} />
                <span className="min-w-0">
                  <span className="block truncate text-[17px] font-medium">{item.name}</span>
                  <span className="block truncate text-[15px] text-lace-soft">
                    {categories[item.category].label}
                    {item.shelf ? ` · на витрине, место ${item.shelf}` : ''}
                    {item.sold ? ' · продано' : ''}
                  </span>
                </span>
                <span className="text-right font-display text-base font-bold whitespace-nowrap text-brass">{formatPrice(item.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
