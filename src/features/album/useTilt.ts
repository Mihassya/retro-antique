import { useCallback, type PointerEvent } from 'react'

const MAX_TILT = 14

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Tilts the `.coin-tilt` element inside the hovered cell towards the cursor and moves its glint.
 * Writes styles straight onto the two elements, so moving the mouse never re-renders React.
 */
export function useTilt() {
  const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || !canHover() || reduced()) return
    const cell = e.currentTarget
    if (cell.getAttribute('aria-pressed') === 'true') return
    const coin = cell.querySelector<HTMLElement>('.coin-tilt')
    const glint = cell.querySelector<HTMLElement>('.coin-glint')
    if (!coin) return
    const rect = coin.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    coin.classList.add('is-tracking')
    coin.style.transform = `perspective(700px) translateY(-6px) scale(1.07) rotateX(${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg) rotateY(${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg)`
    glint?.style.setProperty('--x', `${(x * 100).toFixed(1)}%`)
    glint?.style.setProperty('--y', `${(y * 100).toFixed(1)}%`)
  }, [])

  const onPointerLeave = useCallback((e: PointerEvent<HTMLElement>) => {
    const coin = e.currentTarget.querySelector<HTMLElement>('.coin-tilt')
    if (!coin) return
    coin.classList.remove('is-tracking')
    coin.style.transform = ''
  }, [])

  return { onPointerMove, onPointerLeave }
}
