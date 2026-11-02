import type { ReactNode } from 'react'

type Props = {
  pressed: boolean
  onClick: () => void
  count?: number
  children: ReactNode
}

/** A toggle in a row of filters. One shape for every filter on the site. */
export function Chip({ pressed, onClick, count, children }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-[3px] px-4 text-base whitespace-nowrap transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.97] ${
        pressed ? 'bg-lace text-veneer-deep' : 'bg-veneer-deep text-lace hover:bg-veneer'
      }`}
    >
      {children}
      {count !== undefined && <span className={pressed ? 'text-veneer' : 'text-lace-soft'}>{count}</span>}
    </button>
  )
}
