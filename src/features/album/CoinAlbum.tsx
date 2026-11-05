import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatPrice, getCoinPages, largeImage } from '../../data'
import { rubleSpec, type Coin } from '../../data/coins'
import { Reveal } from '../../components/Reveal'
import { AlbumPanel, type PanelItem } from './AlbumPanel'
import { useTilt } from './useTilt'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wide = () => window.matchMedia('(min-width: 48rem)').matches

const decodeAll = (srcs: string[]) =>
  Promise.all(
    srcs.map((src) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {})
    }),
  )

const halves = (coins: Coin[]) => {
  const mid = Math.ceil(coins.length / 2)
  return [coins.slice(0, mid), coins.slice(mid)] as const
}

function toPanel(coin: Coin): PanelItem {
  const face = (src: string, side: string) => ({ src, large: largeImage(src), alt: `${coin.denomination} ${coin.year}, ${side}` })
  return {
    key: coin.id,
    title: `${coin.denomination} ${coin.year}`,
    subtitle: `«${coin.title}»`,
    facts: [
      ['Металл', rubleSpec.metal],
      ['Диаметр', rubleSpec.diameter],
      ...(coin.mintage ? [['Тираж', coin.mintage] as [string, string]] : []),
      ['Сохранность', coin.condition],
    ],
    price: coin.price,
    message: `Здравствуйте! Интересует монета ${coin.denomination} ${coin.year} «${coin.title}» с сайта. Есть в наличии?`,
    faces: [face(coin.reverse, 'реверс'), face(coin.obverse, 'аверс')],
    shape: 'coin',
  }
}

/**
 * A coin album as collectors keep them: navy cardboard pages with round cells and the name of each
 * coin printed under it. Bookmarks turn the page over the spine; a coin can be taken out and turned.
 */
export function CoinAlbum() {
  const pages = getCoinPages()
  const [current, setCurrent] = useState(0)
  const [flip, setFlip] = useState<{ from: number; to: number } | null>(null)
  const [selected, setSelected] = useState<Coin | null>(null)
  const leaf = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const turning = useRef(false)

  const goTo = async (to: number) => {
    if (to === current || turning.current) return
    if (!wide() || reduced()) return setCurrent(to)
    // Decode the next spread first, so its coins are already there when the leaf turns over.
    turning.current = true
    await decodeAll(pages[to].coins.map((coin) => coin.reverse))
    setFlip({ from: current, to })
  }

  useLayoutEffect(() => {
    if (!flip || !leaf.current || !shade.current) return
    const forward = flip.to > flip.from
    const timing = { duration: 900, easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)' }
    // `fill: forwards` keeps the leaf at the end of its turn until React removes it; without it the
    // leaf snaps back to the old page for a frame, which shows as a flash.
    const turn = leaf.current.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${forward ? -180 : 180}deg)` }], { ...timing, fill: 'forwards' })
    // The page uncovered by the leaf comes out of its shadow.
    const light = shade.current.animate([{ opacity: 0.55 }, { opacity: 0 }], { ...timing, fill: 'forwards' })
    const settle = () => {
      turning.current = false
      setCurrent(flip.to)
      setFlip(null)
    }
    // A hidden tab never finishes the animation; the page must still end up turned.
    const fallback = window.setTimeout(settle, 1400)
    turn.finished.then(settle).catch(() => {})
    return () => {
      window.clearTimeout(fallback)
      turn.cancel()
      light.cancel()
    }
  }, [flip])

  // While a page turns, the spread underneath already shows what the leaf will uncover.
  const forward = flip ? flip.to > flip.from : true
  const from = halves(pages[flip?.from ?? current].coins)
  const to = halves(pages[flip?.to ?? current].coins)
  const base = flip ? (forward ? [from[0], to[1]] : [to[0], from[1]]) : to
  const basePage = (side: 0 | 1) => (flip ? ((side === 0) === forward ? flip.from : flip.to) : current)

  const cellProps = { selected, onSelect: (coin: Coin) => setSelected((s) => (s?.id === coin.id ? null : coin)) }
  const allCoins = pages.flatMap((page) => page.coins)

  // Stepping through the viewer can land on a coin from the other section: open the album there,
  // so the empty cell is in sight when the viewer closes.
  useEffect(() => {
    if (!selected || flip) return
    const page = pages.findIndex((p) => p.coins.some((c) => c.id === selected.id))
    if (page !== current) setCurrent(page)
  }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
      <Reveal delay={200}>
        <div role="group" aria-label="Разделы альбома" className="flex justify-end gap-2 pr-6 md:pr-10">
          {pages.map((page, i) => (
            <button
              key={page.id}
              type="button"
              aria-pressed={i === (flip?.to ?? current)}
              onClick={() => goTo(i)}
              className={`relative z-10 -mb-3 min-h-11 px-4 pt-2.5 pb-7 text-base font-medium transition-[translate,background-color] duration-300 ease-out [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] ${
                i === (flip?.to ?? current) ? 'translate-y-2 bg-brass text-veneer-deep' : 'bg-veneer-hi text-lace hover:translate-y-1 hover:bg-veneer-hover'
              }`}
            >
              {page.title}
            </button>
          ))}
        </div>

        <div className="rounded-[6px] bg-album-cover p-2.5 md:p-4">
          <div className="relative grid gap-2.5 [perspective:2600px] md:grid-cols-2 md:gap-0">
            <AlbumPage side="left" heading={pages[basePage(0)].title} coins={base[0]} {...cellProps} />
            <AlbumPage side="right" heading={pages[basePage(1)].note} coins={base[1]} {...cellProps} />

            {flip && (
              <div
                ref={shade}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 w-1/2 bg-album-deep opacity-0 ${forward ? 'left-1/2' : 'left-0'}`}
              />
            )}
            {flip && (
              <div
                ref={leaf}
                aria-hidden="true"
                className={`album-leaf absolute inset-y-0 grid w-1/2 ${forward ? 'left-1/2 origin-left' : 'left-0 origin-right'}`}
              >
                <AlbumPage
                  side={forward ? 'right' : 'left'}
                  heading={forward ? pages[flip.from].note : pages[flip.from].title}
                  coins={forward ? from[1] : from[0]}
                  selected={null}
                  className="col-start-1 row-start-1"
                />
                <AlbumPage
                  side={forward ? 'left' : 'right'}
                  heading={forward ? pages[flip.to].title : pages[flip.to].note}
                  coins={forward ? to[0] : to[1]}
                  selected={null}
                  className="col-start-1 row-start-1"
                />
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <AlbumPanel
        item={selected && toPanel(selected)}
        items={allCoins.map(toPanel)}
        onSelect={(key) => setSelected(allCoins.find((c) => c.id === key) ?? null)}
        onClose={() => setSelected(null)}
        empty={
          <>
            <p className="font-display text-[clamp(22px,1.8vw,28px)] leading-[1.1] font-medium tracking-[-0.02em] text-lace">Альбом открыт</p>
            <img src={pages[0].coins[0].obverse} alt="" width={480} height={480} className="mt-8 mb-2 w-44 -rotate-12 rounded-full" />
            <p className="mt-3 text-album-ink-soft">Наведите на монету, чтобы рассмотреть её на свету. Нажмите — достанем из ячейки, а там можно перевернуть и рассмотреть в полный размер.</p>
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-base">
              <dt className="text-album-ink-soft">В альбоме</dt>
              <dd>{pages.reduce((n, p) => n + p.coins.length, 0)} монет</dd>
              <dt className="text-album-ink-soft">Цены</dt>
              <dd>от {formatPrice(Math.min(...pages.flatMap((p) => p.coins.map((c) => c.price ?? Infinity))))}</dd>
            </dl>
          </>
        }
      />
    </div>
  )
}

type PageProps = {
  side: 'left' | 'right'
  heading: string
  coins: Coin[]
  selected: Coin | null
  onSelect?: (coin: Coin) => void
  className?: string
}

function AlbumPage({ side, heading, coins, selected, onSelect, className = '' }: PageProps) {
  const tilt = useTilt()

  return (
    <section
      className={`relative bg-album px-4 pt-6 pb-8 md:px-7 md:pt-8 md:pb-10 ${
        side === 'left' ? 'rounded-l-[3px] md:after:absolute md:after:inset-y-0 md:after:right-0 md:after:w-4 md:after:bg-album-deep/50' : 'rounded-r-[3px] md:before:absolute md:before:inset-y-0 md:before:left-0 md:before:w-4 md:before:bg-album-deep/50'
      } max-md:rounded-[3px] ${className}`}
    >
      <h3 className={`font-display text-[19px] font-medium tracking-[-0.01em] text-album-ink ${side === 'right' ? 'md:text-right' : ''}`}>{heading}</h3>
      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 md:mt-8 md:gap-x-5 md:gap-y-9">
        {coins.map((coin) => (
          <li key={coin.id}>
            <button
              type="button"
              tabIndex={onSelect ? undefined : -1}
              aria-pressed={selected?.id === coin.id}
              aria-label={`${coin.denomination} ${coin.year}, «${coin.title}», ${formatPrice(coin.price)}`}
              onClick={(e) => {
                const tilted = e.currentTarget.querySelector<HTMLElement>('.coin-tilt')
                if (tilted) tilted.style.transform = ''
                onSelect?.(coin)
              }}
              {...tilt}
              className="coin-cell group grid w-full cursor-pointer justify-items-center gap-3 rounded-[4px] py-1 text-center"
            >
              <span className="block aspect-square w-[84%] max-w-[176px] rounded-full bg-album-hi p-[3px]">
                <span className="block size-full rounded-full bg-album-deep p-[5%]">
                  <span className="coin-tilt relative block size-full rounded-full">
                    <img src={coin.reverse} alt="" width={480} height={480} decoding="sync" className="size-full rounded-full" />
                    <span aria-hidden="true" className="coin-glint pointer-events-none absolute inset-0 rounded-full" />
                  </span>
                </span>
              </span>
              <span className="text-[15px] leading-tight font-medium text-album-ink">
                {coin.denomination} · {coin.year}
              </span>
              <span className="-mt-1.5 line-clamp-2 max-w-[24ch] text-[14px] leading-snug text-album-ink-soft">{coin.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
