import type { ReactNode } from 'react'
import { CatalogTabs } from './CatalogTabs'
import { Reveal } from './Reveal'

/** Title, one plain sentence and the catalogue tabs: the top of every catalogue page. */
export function PageHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <Reveal as="h1" className="font-display text-[clamp(48px,7vw,112px)] leading-[.9] font-bold tracking-[-0.04em] md:col-span-7">
          {title}
        </Reveal>
        <Reveal as="p" delay={80} className="max-w-[44ch] text-lace-soft md:col-span-5">
          {children}
        </Reveal>
      </div>
      <Reveal delay={160} className="mt-12 md:mt-16">
        <CatalogTabs />
      </Reveal>
    </>
  )
}
