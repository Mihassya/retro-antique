import { useState } from 'react'
import { Link } from 'react-router'
import { categories, formatPrice, refreshItems, useItems, type Category, type Item } from '../data'
import { backend } from '../lib/backend'
import { Thumb } from './ui'

const categoryIds = Object.keys(categories) as Category[]
const SLOTS = 3

/**
 * The sideboard's shelves as the owner arranges them: up to three things per section, left to right.
 * Every change is saved at once; the site shows it on the next page load.
 */
export function Showcase() {
  const { items } = useItems()
  const [picking, setPicking] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (items === null) return <p className="text-lace-soft">Загружаем…</p>

  const shelfOf = (category: Category) =>
    items.filter((i) => i.category === category && i.shelf && !i.sold).sort((a, b) => (a.shelf ?? 0) - (b.shelf ?? 0))

  async function arrange(category: Category, next: Item[]) {
    setBusy(true)
    setError('')
    try {
      await backend.setShelf(category, next.map((i) => i.id))
      await refreshItems()
      setPicking(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить витрину')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-12">
      <div className="grid gap-2">
        <h1 className="font-display text-[clamp(28px,3vw,40px)] leading-tight font-bold tracking-[-0.03em]">Витрина</h1>
        <p className="max-w-[56ch] text-lace-soft">
          Что стоит на полках серванта на главной: до трёх вещей в каждом разделе, слева направо. Проданные вещи уходят с полки сами.{' '}
          <Link to="/#shelves" className="text-brass underline">
            Посмотреть на сайте
          </Link>
        </p>
        {error && (
          <p role="alert" className="text-[#ffb4a2]">
            {error}
          </p>
        )}
      </div>

      {categoryIds.map((category) => {
        const shelf = shelfOf(category)
        const candidates = items.filter((i) => i.category === category && !i.sold && !i.shelf)
        const move = (from: number, to: number) => {
          const next = [...shelf]
          ;[next[from], next[to]] = [next[to], next[from]]
          void arrange(category, next)
        }

        return (
          <section key={category} aria-labelledby={`shelf-${category}`} className="grid gap-4">
            <h2 id={`shelf-${category}`} className="font-display text-2xl font-medium tracking-[-0.02em]">
              {categories[category].label}
            </h2>

            {/* The glass shelf: objects stand on its edge, as on the site. */}
            <ol className="grid grid-cols-3 gap-2 border-b-[6px] border-glass/40 pb-0 md:gap-4">
              {Array.from({ length: SLOTS }, (_, slot) => {
                const item = shelf[slot]
                if (!item) {
                  return (
                    <li key={slot} className="flex">
                      {slot === shelf.length ? (
                        <button
                          type="button"
                          disabled={busy || candidates.length === 0}
                          aria-expanded={picking === category}
                          onClick={() => setPicking(picking === category ? null : category)}
                          className="flex min-h-40 w-full flex-col items-center justify-center gap-1 rounded-t-[3px] border-2 border-dashed border-lace-soft/40 p-3 text-center text-base transition-colors hover:border-brass hover:text-brass disabled:opacity-50 md:min-h-52"
                        >
                          <span aria-hidden="true" className="text-3xl leading-none">
                            +
                          </span>
                          {candidates.length ? 'Поставить вещь' : 'Нет свободных вещей'}
                        </button>
                      ) : (
                        <span className="min-h-40 w-full md:min-h-52" aria-label="Пустое место" />
                      )}
                    </li>
                  )
                }
                return (
                  <li key={item.id} className="grid min-w-0 content-end gap-2">
                    <Thumb src={item.image} alt={item.name} className="h-32 bg-transparent md:h-44" />
                    <div className="flex min-h-19 min-w-0 flex-col justify-center rounded-[3px] bg-lace px-2 py-2 text-center text-veneer-deep">
                      <p className="line-clamp-2 text-[14px] leading-snug font-medium break-words md:text-[15px]">{item.name}</p>
                      <p className="text-[15px] font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 pb-2 md:grid-cols-[1fr_2fr_1fr]">
                      <button
                        type="button"
                        disabled={busy || slot === 0}
                        onClick={() => move(slot, slot - 1)}
                        aria-label={`Сдвинуть «${item.name}» левее`}
                        className="min-h-11 rounded-[3px] bg-veneer-hi text-lg hover:bg-veneer-hover disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void arrange(category, shelf.filter((i) => i.id !== item.id))}
                        aria-label={`Убрать «${item.name}» с витрины`}
                        className="order-last col-span-2 min-h-11 rounded-[3px] bg-veneer-hi text-[15px] hover:bg-veneer-hover disabled:opacity-30 md:order-none md:col-span-1"
                      >
                        Убрать
                      </button>
                      <button
                        type="button"
                        disabled={busy || slot === shelf.length - 1}
                        onClick={() => move(slot, slot + 1)}
                        aria-label={`Сдвинуть «${item.name}» правее`}
                        className="min-h-11 rounded-[3px] bg-veneer-hi text-lg hover:bg-veneer-hover disabled:opacity-30"
                      >
                        →
                      </button>
                    </div>
                  </li>
                )
              })}
            </ol>

            {picking === category && (
              <div className="grid gap-2 rounded-[3px] bg-veneer-deep p-3">
                <p className="px-1 text-lace-soft">Какую вещь поставить?</p>
                <ul className="grid gap-1.5 md:grid-cols-2">
                  {candidates.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void arrange(category, [...shelf, item])}
                        className="grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 rounded-[3px] bg-inside p-1.5 pr-3 text-left transition-colors hover:bg-veneer disabled:opacity-50"
                      >
                        <Thumb src={item.image} className="size-14" />
                        <span className="truncate">{item.name}</span>
                        <span className="text-[15px] whitespace-nowrap text-brass">{formatPrice(item.price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
