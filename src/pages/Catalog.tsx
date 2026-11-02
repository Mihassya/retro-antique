import { useSearchParams } from 'react-router'
import { PageHead } from '../components/PageHead'
import { Reveal } from '../components/Reveal'
import { Chip } from '../components/Chip'
import { categories, formatPrice, getItems, whatsappLink, type Category, type Item } from '../data'
import { budgets, filterItems, readFilters, sorts, writeFilters, type Filters } from '../features/catalog/filter'
import { plural } from '../lib/plural'

const categoryIds = Object.keys(categories) as Category[]
const isCategory = (v: string | null): v is Category => categoryIds.includes(v as Category)

export function Catalog() {
  const [params, setParams] = useSearchParams()
  const filters = readFilters(params, isCategory)
  const all = getItems()
  const found = filterItems(all, filters)

  const set = (patch: Partial<Filters>) => setParams(writeFilters({ ...filters, ...patch }), { replace: true, preventScrollReset: true })
  const countIn = (category: Category) => all.filter((i) => i.category === category && (filters.showSold || !i.sold)).length
  const filtered = filters.category || filters.budget || filters.showSold

  return (
    <main className="bg-inside px-4 pt-14 pb-28 md:px-9 md:pt-20 md:pb-36">
      <PageHead title="Каталог">
        Всё, что сейчас есть в лавке, с ценами. Купить можно на месте или с доставкой в другой город — напишите в WhatsApp.
      </PageHead>

      <section aria-label="Фильтры" className="mt-10 grid gap-6 md:mt-12 md:grid-cols-[auto_1fr] md:gap-x-10 md:gap-y-5">
        <h2 className="text-lace-soft md:pt-2.5">Что ищем</h2>
        <div className="flex flex-wrap gap-2">
          <Chip pressed={!filters.category} onClick={() => set({ category: null })}>
            Всё
          </Chip>
          {categoryIds.map((id) => (
            <Chip key={id} pressed={filters.category === id} count={countIn(id)} onClick={() => set({ category: filters.category === id ? null : id })}>
              {categories[id].label}
            </Chip>
          ))}
        </div>

        <h2 className="text-lace-soft md:pt-2.5">Бюджет</h2>
        <div className="flex flex-wrap gap-2">
          <Chip pressed={!filters.budget} onClick={() => set({ budget: null })}>
            Любой
          </Chip>
          {budgets.map((b) => (
            <Chip key={b.id} pressed={filters.budget === b.id} onClick={() => set({ budget: filters.budget === b.id ? null : b.id })}>
              {b.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-start-2">
          <label className="flex items-center gap-3">
            <span className="text-lace-soft">Порядок</span>
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as Filters['sort'] })}
              className="min-h-11 rounded-[3px] bg-veneer-deep px-3 text-base text-lace"
            >
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={filters.showSold}
              onChange={(e) => set({ showSold: e.target.checked })}
              className="size-5 accent-brass"
            />
            Показать проданные
          </label>
        </div>
      </section>

      <div className="mt-14 flex flex-wrap items-baseline justify-between gap-4 md:mt-16">
        <p aria-live="polite" className="font-display text-[clamp(22px,2vw,30px)] font-medium tracking-[-0.02em]">
          {found.length ? `Нашлось ${plural(found.length, ['вещь', 'вещи', 'вещей'])}` : 'Под такие условия ничего нет'}
        </p>
        {filtered && (
          <button type="button" onClick={() => setParams({}, { replace: true })} className="min-h-11 text-brass underline-offset-[0.22em] hover:underline">
            Сбросить фильтры
          </button>
        )}
      </div>

      {found.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 md:gap-y-16 xl:grid-cols-4">
          {found.map((item, i) => (
            <CatalogCard key={item.id} item={item} delay={(i % 4) * 70} />
          ))}
        </ul>
      ) : (
        <div className="mt-8 grid gap-6 rounded bg-veneer-deep px-6 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-10">
          <p className="max-w-[48ch]">
            Не всё успевает попасть на сайт. Опишите, что ищете, — Александр ответит, есть ли такое в лавке или когда появится.
          </p>
          <a
            href={whatsappLink('Здравствуйте! Ищу вещь, на сайте не нашёл: ')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-13 items-center justify-center rounded-[3px] bg-cobalt px-6 font-medium no-underline transition-[background-color,scale] duration-150 ease-out hover:bg-cobalt-hover active:scale-[0.97]"
          >
            Спросить в WhatsApp
          </a>
        </div>
      )}
    </main>
  )
}

function CatalogCard({ item, delay }: { item: Item; delay: number }) {
  return (
    <Reveal as="li" delay={delay} className="group">
      <div className="flex aspect-[4/5] items-end justify-center rounded bg-veneer-deep px-[12%] pt-[14%] pb-[10%]">
        <img
          src={item.image}
          width={item.size[0]}
          height={item.size[1]}
          alt={item.alt}
          loading="lazy"
          className={`max-h-full w-auto max-w-full object-contain transition-transform duration-300 ease-out ${
            item.sold ? 'opacity-55 grayscale' : 'group-hover:-translate-y-1.5'
          }`}
        />
      </div>
      <h3 className="mt-4 text-lg leading-snug font-medium">{item.name}</h3>
      <p className="text-base text-lace-soft">
        {item.origin}
      </p>
      {item.sold ? (
        <p className="mt-2 font-display text-[19px] font-bold text-lace-soft">Продано</p>
      ) : (
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-display text-[19px] font-bold tracking-[-0.01em] text-brass">{formatPrice(item.price)}</p>
          <a
            href={whatsappLink(`Здравствуйте! Интересует «${item.name}» (${item.origin}) с сайта. Есть в наличии?`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-base underline underline-offset-[0.22em] hover:text-brass"
          >
            Спросить
          </a>
        </div>
      )}
    </Reveal>
  )
}
