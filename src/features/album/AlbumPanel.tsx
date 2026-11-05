import { useEffect, useState, type ReactNode } from 'react'
import { formatPrice, whatsappLink } from '../../data'
import { Viewer } from './Viewer'

export type Face = {
  /** The image the album shows. */
  src: string
  /** The full-size scan, loaded only for the viewer. */
  large: string
  alt: string
}

export type PanelItem = {
  key: string
  title: string
  subtitle: string
  facts: [term: string, value: string][]
  price: number | null
  message: string
  /** Front first; a piece with one face cannot be turned over. */
  faces: Face[]
  /** Coins turn on a round frame, notes on a wide one. */
  shape: 'coin' | 'note'
}

type Props = {
  item: PanelItem | null
  /** Everything in the album, in order, so the viewer can step to the neighbours. */
  items: PanelItem[]
  onSelect: (key: string) => void
  empty: ReactNode
  onClose: () => void
}

/** Below this width the panel is a sheet from the bottom, and a tap goes straight to the viewer. */
const isSheet = () => window.matchMedia('(max-width: 63.999rem)').matches

/**
 * The piece taken out of the album, large, with its facts and a way to ask about it.
 * A column beside the album on wide screens; a sheet from the bottom on phones (see .album-panel).
 * «Рассмотреть» opens it full screen at full size.
 */
export function AlbumPanel({ item, items, onSelect, empty, onClose }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [viewing, setViewing] = useState(false)

  useEffect(() => setFlipped(false), [item?.key])

  // On a phone the sheet is small: picking a piece opens it full screen straight away.
  useEffect(() => {
    if (item && isSheet()) setViewing(true)
  }, [item?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!item || viewing) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, viewing, onClose])

  const face = (f: Face) => (
    <img src={f.src} alt={f.alt} width={960} height={item?.shape === 'coin' ? 960 : 480} className={`size-full ${item?.shape === 'coin' ? 'rounded-full' : 'object-contain'}`} />
  )

  return (
    <aside
      aria-label="Выбранная вещь"
      aria-live="polite"
      className={`album-panel bg-album-cover px-5 pt-6 pb-8 text-album-ink md:px-8 lg:sticky lg:top-24 lg:rounded-[6px] lg:py-9 ${item ? 'is-open' : ''}`}
    >
      {item ? (
        <div key={item.key} className="picked-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-[clamp(22px,1.8vw,28px)] leading-[1.1] font-medium tracking-[-0.02em] text-lace">{item.title}</h2>
              <p className="mt-1.5 text-base text-album-ink-soft">{item.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Положить обратно в альбом"
              className="grid size-11 flex-none place-items-center rounded-[3px] bg-album text-xl transition-[background-color,scale] duration-150 ease-out hover:bg-album-hi active:scale-[0.95]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className={`mx-auto mt-7 [perspective:1100px] ${item.shape === 'coin' ? 'max-w-[340px]' : ''}`}>
            <button
              type="button"
              onClick={() => setViewing(true)}
              aria-label={`Рассмотреть: ${item.title}`}
              className={`flip-card group relative grid w-full cursor-zoom-in ${flipped ? 'is-flipped' : ''} ${item.shape === 'coin' ? 'aspect-square' : 'aspect-[2/1]'}`}
            >
              {item.faces.map((f, i) => (
                <span key={f.src} className={`flip-face col-start-1 row-start-1 transition-[scale] duration-300 ease-out group-hover:scale-[1.02] ${i === 1 ? 'flip-face-back' : ''}`}>
                  {face(f)}
                </span>
              ))}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {item.faces.length > 1 && (
              <button
                type="button"
                onClick={() => setFlipped((v) => !v)}
                className="flex min-h-11 items-center gap-2 rounded-[3px] px-4 text-base text-album-ink transition-[background-color,scale] duration-150 ease-out hover:bg-album active:scale-[0.97]"
              >
                <span aria-hidden="true" className={`inline-block transition-transform duration-500 ease-out ${flipped ? 'rotate-180' : ''}`}>
                  ↻
                </span>
                {flipped ? 'Лицевая сторона' : 'Перевернуть'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewing(true)}
              className="flex min-h-11 items-center gap-2 rounded-[3px] bg-album px-4 text-base text-lace transition-[background-color,scale] duration-150 ease-out hover:bg-album-hi active:scale-[0.97]"
            >
              <span aria-hidden="true">⤢</span>
              Рассмотреть
            </button>
          </div>
          {item.faces.length === 1 && <p className="mt-3 text-center text-base text-album-ink-soft">Фото оборота пришлём в WhatsApp</p>}

          <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-base">
            {item.facts.map(([term, value]) => (
              <div key={term} className="contents">
                <dt className="text-album-ink-soft">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-7 font-display text-[28px] leading-none font-bold tracking-[-0.02em] text-brass">{formatPrice(item.price)}</p>
          <a
            href={whatsappLink(item.message)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex min-h-13 items-center justify-center rounded-[3px] bg-cobalt px-5 font-medium text-lace no-underline transition-[background-color,scale] duration-150 ease-out hover:bg-cobalt-hover active:scale-[0.98]"
          >
            Спросить в WhatsApp
          </a>
        </div>
      ) : (
        <div className="max-lg:hidden">{empty}</div>
      )}

      {/* Outside the keyed block above, so stepping to a neighbour keeps the same viewer open. */}
      {viewing && item && (
        <Viewer
          items={items}
          index={Math.max(0, items.findIndex((i) => i.key === item.key))}
          onIndex={(i) => onSelect(items[i].key)}
          onClose={() => setViewing(false)}
        />
      )}
    </aside>
  )
}
