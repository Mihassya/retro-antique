import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

type Props = {
  as?: ElementType
  delay?: number
  className?: string
  children: ReactNode
}

/** Rises into place once, when it first scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,translate] duration-800 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  )
}
