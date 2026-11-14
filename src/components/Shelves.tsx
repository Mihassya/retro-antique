import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { countCoins, countNotes, formatPrice, getCoinPages, getNotePages, getShelves, useItems, type Item, type Shelf } from '../data'
import { useInView } from '../hooks/useInView'
import { Reveal } from './Reveal'

/** Pixels per real centimetre on a desktop shelf, and the limits that keep any one thing from breaking the row. */
const PX_PER_CM = 10
const MIN_PX = 110
const MAX_PX = 330

const shelfHeight = (item: Item) => Math.min(MAX_PX, Math.max(MIN_PX, item.heightCm * PX_PER_CM))

export function Shelves() {
  const { items } = useItems()
  return (
    <section id="shelves" aria-labelledby="shelves-title" className="bg-inside px-4 pt-24 pb-28 md:px-9 md:pt-38 md:pb-36">
      <Reveal as="h2" className="max-w-[14ch] font-display text-[clamp(40px,5vw,84px)] leading-[.95] font-bold tracking-[-0.035em]">
        <span id="shelves-title">Что сейчас на полках</span>
      </Reveal>
      <Reveal as="p" delay={90} className="mt-6 max-w-[46ch] text-lace-soft">
        Как в бабушкином серванте: за стеклом стоит лучшее, остальное — в каталоге. Цены — у каждой вещи.
      </Reveal>

      <div className="mt-20 flex flex-col gap-24 md:mt-28 md:gap-32">
        {getShelves(items ?? []).map((shelf) => (
          <ShelfRow key={shelf.category} shelf={shelf} />
        ))}
      </div>

      <Albums />
    </section>
  )
}

/**
 * One glass shelf with three fixed slots (two on a phone), so adding stock never changes the layout.
 * Rows of the grid: the objects, the glass top they stand on (and reflect in), the paper tags hanging
 * from its front edge. Each item spans all three rows via subgrid so the glass lines up however tall
 * the objects and tags are.
 */
function ShelfRow({ shelf }: { shelf: Shelf }) {
  const [ref, shown] = useInView<HTMLDivElement>()

  return (
    <div ref={ref} className={`grid gap-10 md:grid-cols-[4fr_8fr] md:items-center md:gap-6 ${shown ? 'is-shown' : ''}`}>
      <div>
        <Reveal as="h3" className="font-display text-[clamp(26px,2.2vw,36px)] leading-[1.05] font-medium tracking-[-0.02em]">
          {shelf.title}
        </Reveal>
        <Reveal as="p" delay={80} className="mt-3.5 max-w-[30ch] text-[17px] text-lace-soft">
          {shelf.note}
        </Reveal>
        <Reveal delay={140} className="mt-6">
          <Link
            to={`/catalog?cat=${shelf.category}`}
            className="group inline-flex min-h-11 items-center gap-2.5 text-[17px] font-medium text-brass underline-offset-[0.22em] hover:underline"
          >
            Смотреть {shelf.link}
            <span aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Reveal>
      </div>

      <ul className="grid grid-cols-2 grid-rows-[auto_auto_auto] gap-x-4 md:grid-cols-3 md:gap-x-8">
        <li
          aria-hidden="true"
          className="relative col-span-full row-start-2 -mx-4 bg-glass/10 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-glass/40 md:-mx-9 md:mr-0"
        />

        {shelf.items.map((item, i) => (
          <li
            key={item.id}
            className={`shelf-item row-span-3 row-start-1 grid grid-rows-subgrid justify-items-center ${i === 2 ? 'max-md:hidden' : ''}`}
            style={{ gridColumnStart: i + 1, '--d': `${i * 110}ms`, '--h': `${shelfHeight(item)}px` } as CSSProperties}
          >
            <img
              src={item.image}
              width={item.size[0]}
              height={item.size[1]}
              alt={item.alt}
              loading="lazy"
              className="shelf-object h-[calc(var(--h)*.58)] w-auto max-w-full self-end object-contain md:h-(--h)"
            />

            <div aria-hidden="true" className="relative h-9 w-full overflow-hidden md:h-12">
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="shelf-reflection absolute inset-x-0 top-0 mx-auto h-[calc(var(--h)*.58)] w-auto max-w-full object-contain md:h-(--h)"
              />
            </div>

            <div className="price-tag flex w-full max-w-[190px] flex-col items-center">
              <span aria-hidden="true" className="h-5 w-0.5 bg-lace-soft/60" />
              <p className="relative w-full rounded-[3px] bg-lace px-3 pt-4 pb-3 text-center text-[15px] leading-snug text-veneer-deep">
                <span aria-hidden="true" className="absolute top-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-inside" />
                <b className="line-clamp-2 text-base font-medium">{item.name}</b>
                {item.origin && <span className="line-clamp-1">{item.origin}</span>}
                <span className="mt-1.5 block font-display text-[17px] font-bold tracking-[-0.01em]">{formatPrice(item.price)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Coins and banknotes don't stand on shelves: they live in albums, each with its own page. */
function Albums() {
  const coins = getCoinPages()[0].coins.slice(0, 3)
  const note = getNotePages()[0].notes[0]

  return (
    <div className="mt-32 grid gap-4 md:mt-40 md:grid-cols-2 md:gap-6">
      <Reveal>
        <Link
          to="/catalog/coins"
          className="group flex min-h-56 items-center justify-between gap-6 rounded bg-album px-6 py-8 transition-[background-color,scale] duration-200 ease-out hover:bg-album-hi active:scale-[0.99] md:px-10"
        >
          <span>
            <span className="block font-display text-[clamp(26px,2.2vw,36px)] leading-[1.05] font-medium tracking-[-0.02em]">Альбом монет</span>
            <span className="mt-2 block text-lace-soft">{countCoins()} юбилейных рублей СССР</span>
          </span>
          <span aria-hidden="true" className="flex flex-none">
            {coins.map((coin, i) => (
              <img
                key={coin.id}
                src={coin.reverse}
                alt=""
                width={96}
                height={96}
                loading="lazy"
                className="-ml-8 size-20 rounded-full transition-transform duration-300 ease-out first:ml-0 group-hover:-translate-y-1.5 md:size-24"
                style={{ transitionDelay: `${i * 40}ms` }}
              />
            ))}
          </span>
        </Link>
      </Reveal>
      <Reveal delay={90}>
        <Link
          to="/catalog/banknotes"
          className="group flex min-h-56 items-center justify-between gap-6 overflow-hidden rounded bg-album px-6 py-8 transition-[background-color,scale] duration-200 ease-out hover:bg-album-hi active:scale-[0.99] md:px-10"
        >
          <span>
            <span className="block font-display text-[clamp(26px,2.2vw,36px)] leading-[1.05] font-medium tracking-[-0.02em]">Альбом банкнот</span>
            <span className="mt-2 block text-lace-soft">{countNotes()} банкнот СССР образца 1961 года</span>
          </span>
          <img
            src={note.front}
            alt=""
            width={960}
            height={480}
            loading="lazy"
            className="w-36 flex-none -rotate-6 transition-[rotate,translate] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-3 md:w-48"
          />
        </Link>
      </Reveal>
    </div>
  )
}
