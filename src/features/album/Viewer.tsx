import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { formatPrice, whatsappLink } from '../../data'
import type { PanelItem } from './AlbumPanel'

type Props = {
  items: PanelItem[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}

type View = { s: number; x: number; y: number }
type Point = { x: number; y: number }
type Gesture =
  | { kind: 'pan'; start: Point; from: View; moved: boolean; at: number }
  | { kind: 'pinch'; dist: number; mid: Point; from: View }

const MIN_ZOOM = 1
const MAX_ZOOM = 5
const TAP_ZOOM = 2.5
const STEP = 1.5
const FIT = 0.92

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
const middle = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/**
 * The piece full screen, from the scan the shop has at full size. Zoom with the wheel, two fingers,
 * a double tap or the buttons; drag to move around; ← → to the neighbours; Esc closes.
 * On a phone held upright a banknote turns sideways to use the whole height of the screen.
 */
export function Viewer({ items, index, onIndex, onClose }: Props) {
  const item = items[index]
  const dialog = useRef<HTMLDialogElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | null>(null)
  const lastTap = useRef(0)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 })
  const [smooth, setSmooth] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})

  // Size of the piece when it just fits the stage, and whether it lies sideways.
  const aspect = item.shape === 'coin' ? 1 : 2
  const rotated = item.shape === 'note' && box.h > box.w * 1.1
  const width = rotated ? Math.min(box.h, box.w * aspect) * FIT : Math.min(box.w, box.h * aspect) * FIT
  const height = width / aspect
  const shown = rotated ? { w: height, h: width } : { w: width, h: height }

  const clamp = useCallback(
    (v: View): View => {
      const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.s))
      const mx = Math.max(0, (shown.w * s - box.w) / 2)
      const my = Math.max(0, (shown.h * s - box.h) / 2)
      return { s, x: Math.min(mx, Math.max(-mx, v.x)), y: Math.min(my, Math.max(-my, v.y)) }
    },
    [shown.w, shown.h, box.w, box.h],
  )

  /** Zooms keeping the point (relative to the stage centre) under the finger or cursor where it is. */
  const zoomTo = useCallback(
    (s: (current: number) => number, at: Point = { x: 0, y: 0 }) =>
      setView((v) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s(v.s)))
        const k = next / v.s
        return clamp({ s: next, x: at.x - (at.x - v.x) * k, y: at.y - (at.y - v.y) * k })
      }),
    [clamp],
  )

  const fromStage = (clientX: number, clientY: number): Point => {
    const r = stage.current!.getBoundingClientRect()
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 }
  }

  useEffect(() => {
    const d = dialog.current!
    d.showModal()
    stage.current?.focus({ preventScroll: true })
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = overflow
      d.close()
    }
  }, [])

  useEffect(() => {
    const el = stage.current!
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Wheel and trackpad pinch zoom here, not the page: needs a listener that may call preventDefault.
  useEffect(() => {
    const el = stage.current!
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setSmooth(false)
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025))
      zoomTo((s) => s * factor, fromStage(e.clientX, e.clientY))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomTo])

  useEffect(() => {
    setView({ s: 1, x: 0, y: 0 })
    setFlipped(false)
  }, [index])

  // A resize (or turning the phone) must never leave the piece off screen.
  useEffect(() => setView((v) => clamp(v)), [clamp])

  const go = (step: number) => onIndex((index + step + items.length) % items.length)
  const zoomStep = (dir: 1 | -1) => {
    setSmooth(true)
    zoomTo((s) => (dir > 0 ? s * STEP : s / STEP))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setSmooth(false)
    const [a, b] = [...pointers.current.values()]
    const m = b && middle(a, b)
    gesture.current = m
      ? { kind: 'pinch', dist: distance(a, b), mid: fromStage(m.x, m.y), from: view }
      : { kind: 'pan', start: a, from: view, moved: false, at: performance.now() }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    if (!g) return
    if (g.kind === 'pan') {
      const dx = e.clientX - g.start.x
      const dy = e.clientY - g.start.y
      if (Math.hypot(dx, dy) > 6) g.moved = true
      if (g.from.s > 1) setView(clamp({ ...g.from, x: g.from.x + dx, y: g.from.y + dy }))
      return
    }
    const [a, b] = [...pointers.current.values()]
    if (!b) return
    const k = distance(a, b) / g.dist
    const m = middle(a, b)
    const mid = fromStage(m.x, m.y)
    const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, g.from.s * k))
    const ratio = s / g.from.s
    setView(clamp({ s, x: g.mid.x - (g.mid.x - g.from.x) * ratio + (mid.x - g.mid.x), y: g.mid.y - (g.mid.y - g.from.y) * ratio + (mid.y - g.mid.y) }))
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return
    const g = gesture.current
    const rest = [...pointers.current.values()]
    if (rest.length === 1) {
      // One finger lifted from a pinch: carry on panning with the other.
      gesture.current = { kind: 'pan', start: rest[0], from: view, moved: true, at: 0 }
      return
    }
    gesture.current = null
    if (g?.kind !== 'pan' || g.moved || performance.now() - g.at > 300) return
    // Two quick taps in place: zoom in there, or back out.
    const now = performance.now()
    if (now - lastTap.current < 320) {
      lastTap.current = 0
      setSmooth(true)
      const at = fromStage(e.clientX, e.clientY)
      zoomTo((s) => (s > 1.05 ? 1 : TAP_ZOOM), at)
    } else lastTap.current = now
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === '+' || e.key === '=') zoomStep(1)
    else if (e.key === '-') zoomStep(-1)
    else if (e.key === '0') {
      setSmooth(true)
      setView({ s: 1, x: 0, y: 0 })
    } else return
    e.preventDefault()
  }

  const prev = items[(index - 1 + items.length) % items.length]
  const next = items[(index + 1) % items.length]
  const zoomed = view.s > 1.01

  return (
    <dialog
      ref={dialog}
      aria-label={`${item.title}, просмотр`}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onKeyDown={onKeyDown}
      className="viewer fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-album-cover p-0 text-album-ink backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 px-4 pt-4 md:px-8 md:pt-6">
          <div className="min-w-0">
            <h2 className="font-display text-[clamp(20px,2vw,30px)] leading-[1.1] font-medium tracking-[-0.02em] text-lace">{item.title}</h2>
            <p className="mt-1 truncate text-base text-album-ink-soft">{item.subtitle}</p>
          </div>
          <div className="flex flex-none gap-2">
            {item.faces.length > 1 && (
              <ViewerButton label={flipped ? 'Лицевая сторона' : 'Перевернуть'} onClick={() => setFlipped((f) => !f)} wide>
                <span aria-hidden="true" className={`inline-block transition-transform duration-500 ease-out ${flipped ? 'rotate-180' : ''}`}>
                  ↻
                </span>
                <span className="max-md:sr-only">{flipped ? 'Лицевая сторона' : 'Перевернуть'}</span>
              </ViewerButton>
            )}
            <ViewerButton label="Уменьшить" onClick={() => zoomStep(-1)} disabled={!zoomed} className="max-md:hidden">
              −
            </ViewerButton>
            <ViewerButton label="Увеличить" onClick={() => zoomStep(1)} disabled={view.s >= MAX_ZOOM} className="max-md:hidden">
              +
            </ViewerButton>
            <ViewerButton label="Закрыть просмотр" onClick={onClose}>
              ×
            </ViewerButton>
          </div>
        </header>

        <div
          ref={stage}
          // The dialog focuses this on open rather than the first button, so no focus ring lights up.
          tabIndex={-1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative min-h-0 flex-1 touch-none overflow-hidden outline-none select-none ${zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        >
          <div
            className="absolute top-1/2 left-1/2 [perspective:1600px]"
            style={{
              width,
              height,
              marginLeft: -width / 2,
              marginTop: -height / 2,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})${rotated ? ' rotate(90deg)' : ''}`,
              transition: smooth ? 'transform 0.35s var(--ease-out)' : 'none',
            }}
          >
            <div className={`flip-card relative size-full ${flipped ? 'is-flipped' : ''}`}>
              {item.faces.map((face, i) => (
                <div key={face.src} className={`flip-face absolute inset-0 ${i === 1 ? 'flip-face-back' : ''}`}>
                  {/* The album image shows at once; the full-size scan fades in over it. */}
                  <img src={face.src} alt="" draggable={false} className={`absolute inset-0 size-full object-contain ${item.shape === 'coin' ? 'rounded-full' : ''}`} />
                  <img
                    src={face.large}
                    alt={face.alt}
                    draggable={false}
                    onLoad={() => setLoaded((l) => ({ ...l, [face.large]: true }))}
                    className={`absolute inset-0 size-full object-contain transition-opacity duration-300 ${item.shape === 'coin' ? 'rounded-full' : ''} ${loaded[face.large] ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {items.length > 1 && (
            <>
              <ViewerButton label={`Предыдущая: ${prev.title}`} onClick={() => go(-1)} className="absolute top-1/2 left-3 -translate-y-1/2 md:left-6">
                ←
              </ViewerButton>
              <ViewerButton label={`Следующая: ${next.title}`} onClick={() => go(1)} className="absolute top-1/2 right-3 -translate-y-1/2 md:right-6">
                →
              </ViewerButton>
            </>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-3 pb-4 md:px-8 md:pb-6">
          <p className="font-display text-[26px] leading-none font-bold tracking-[-0.02em] text-brass">{formatPrice(item.price)}</p>
          <a
            href={whatsappLink(item.message)}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center justify-center rounded-[3px] bg-cobalt px-5 font-medium text-lace no-underline transition-[background-color,scale] duration-150 ease-out hover:bg-cobalt-hover active:scale-[0.98] max-sm:flex-1"
          >
            Спросить в WhatsApp
          </a>
        </footer>
      </div>
    </dialog>
  )
}

type ButtonProps = {
  label: string
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  wide?: boolean
  className?: string
}

function ViewerButton({ label, onClick, children, disabled, wide, className = '' }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid min-h-11 min-w-11 place-items-center rounded-[3px] bg-album text-xl text-lace transition-[background-color,scale,opacity] duration-150 ease-out hover:bg-album-hi active:scale-[0.95] disabled:opacity-40 disabled:active:scale-100 ${
        wide ? 'grid-flow-col gap-2 px-3 text-base md:px-4' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}
