import { useState } from 'react'
import { formatPrice, getNotePages } from '../../data'
import type { Note } from '../../data/notes'
import { Reveal } from '../../components/Reveal'
import { AlbumPanel, type PanelItem } from './AlbumPanel'

function toPanel(note: Note): PanelItem {
  const face = (src: string, side: string) => <img src={src} alt={`${note.value} 1961 года, ${side}`} width={960} height={480} className="size-full object-contain" />
  return {
    key: note.id,
    title: `${note.value}, 1961`,
    subtitle: note.issuer,
    facts: [
      ['Рисунок', note.design],
      ['Сохранность', note.condition],
    ],
    price: note.price,
    message: `Здравствуйте! Интересует банкнота ${note.value} 1961 года с сайта. Есть в наличии?`,
    front: face(note.front, 'лицевая сторона'),
    back: note.back && face(note.back, 'оборот'),
    shape: 'note',
  }
}

/**
 * A banknote album: sheets with clear pockets, one note in each. Under the cursor a note slides up
 * out of its pocket; pressed, it leaves the pocket for the panel, where it can be turned over.
 */
export function NoteAlbum() {
  const pages = getNotePages()
  const [selected, setSelected] = useState<Note | null>(null)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
      <Reveal delay={200} className="rounded-[6px] bg-album-cover p-2.5 md:p-4">
        <div className="grid gap-2.5 md:grid-cols-2 md:gap-0">
          {pages.map((page, i) => (
            <section
              key={page.id}
              aria-labelledby={`notes-${page.id}`}
              className={`relative bg-album px-4 pt-6 pb-8 max-md:rounded-[3px] md:px-7 md:pt-8 md:pb-10 ${
                i === 0
                  ? 'rounded-l-[3px] md:after:absolute md:after:inset-y-0 md:after:right-0 md:after:w-4 md:after:bg-album-deep/50'
                  : 'rounded-r-[3px] md:before:absolute md:before:inset-y-0 md:before:left-0 md:before:w-4 md:before:bg-album-deep/50'
              }`}
            >
              <h3 id={`notes-${page.id}`} className={`font-display text-[19px] font-medium tracking-[-0.01em] text-album-ink ${i === 1 ? 'md:text-right' : ''}`}>
                {page.title}
              </h3>
              <ul className="mt-10 grid gap-11 md:mt-12">
                {page.notes.map((note) => (
                  <li key={note.id}>
                    <Pocket note={note} pressed={selected?.id === note.id} onSelect={() => setSelected((s) => (s?.id === note.id ? null : note))} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Reveal>

      <AlbumPanel
        item={selected && toPanel(selected)}
        onClose={() => setSelected(null)}
        empty={
          <>
            <p className="font-display text-[clamp(22px,1.8vw,28px)] leading-[1.1] font-medium tracking-[-0.02em] text-lace">Образец 1961 года</p>
            <p className="mt-3 text-album-ink-soft">
              Деньги после реформы 1961 года ходили до 1991-го. Наведите на банкноту — она выглянет из кармашка, нажмите — достанем целиком.
            </p>
          </>
        }
      />
    </div>
  )
}

function Pocket({ note, pressed, onSelect }: { note: Note; pressed: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${note.value}, 1961, ${formatPrice(note.price)}`}
      onClick={onSelect}
      className="pocket group grid w-full cursor-pointer gap-3 text-left"
    >
      {/* The pocket: a clear sleeve over the lower part of the note, its open edge catching the light. */}
      <span className="relative block aspect-[2.1/1] rounded-[2px] bg-album-deep">
        <img
          src={note.front}
          alt=""
          width={960}
          height={480}
          loading="lazy"
          className="note-in-pocket absolute inset-x-[4%] bottom-[5%] w-[92%]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[80%] rounded-b-[2px] bg-white/10 after:absolute after:inset-x-0 after:top-0 after:h-[3px] after:bg-white/35"
        />
      </span>
      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="text-[15px] font-medium text-album-ink">{note.value} · 1961</span>
        <span className="text-[15px] text-brass">{formatPrice(note.price)}</span>
      </span>
    </button>
  )
}
