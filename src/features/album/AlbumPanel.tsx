import { useEffect, useRef, useState, type ReactNode } from 'react'
import { formatPrice, whatsappLink } from '../../data'

export type PanelItem = {
  key: string
  title: string
  subtitle: string
  facts: [term: string, value: string][]
  price: number | null
  message: string
  front: ReactNode
  /** Without a back the piece cannot be turned over. */
  back?: ReactNode
  /** Coins turn on a round frame, notes on a wide one. */
  shape: 'coin' | 'note'
}

type Props = {
  item: PanelItem | null
  empty: ReactNode
  onClose: () => void
}

/**
 * The piece taken out of the album, large, with its facts and a way to ask about it.
 * A column beside the album on wide screens; a sheet from the bottom on phones (see .album-panel).
 */
export function AlbumPanel({ item, empty, onClose }: Props) {
  const [flipped, setFlipped] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setFlipped(false), [item?.key])

  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

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
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Положить обратно в альбом"
              className="grid size-11 flex-none place-items-center rounded-[3px] bg-album text-xl transition-[background-color,scale] duration-150 ease-out hover:bg-album-hi active:scale-[0.95]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className={`mx-auto mt-7 [perspective:1100px] ${item.shape === 'coin' ? 'max-w-[300px]' : 'max-w-[460px]'}`}>
            <button
              type="button"
              disabled={!item.back}
              onClick={() => setFlipped((v) => !v)}
              aria-label={item.back ? (flipped ? 'Показать лицевую сторону' : 'Показать оборот') : undefined}
              className={`flip-card relative grid w-full enabled:cursor-pointer ${flipped ? 'is-flipped' : ''} ${item.shape === 'coin' ? 'aspect-square' : 'aspect-[2/1]'}`}
            >
              <span className="flip-face col-start-1 row-start-1">{item.front}</span>
              {item.back && <span className="flip-face flip-face-back col-start-1 row-start-1">{item.back}</span>}
            </button>
          </div>
          {item.back ? (
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              className="mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-[3px] px-4 text-base text-album-ink transition-[background-color,scale] duration-150 ease-out hover:bg-album active:scale-[0.97]"
            >
              <span aria-hidden="true" className={`inline-block transition-transform duration-500 ease-out ${flipped ? 'rotate-180' : ''}`}>
                ↻
              </span>
              {flipped ? 'Лицевая сторона' : 'Перевернуть'}
            </button>
          ) : (
            <p className="mt-5 text-center text-base text-album-ink-soft">Фото оборота пришлём в WhatsApp</p>
          )}

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
    </aside>
  )
}
