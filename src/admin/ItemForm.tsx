import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Chip } from '../components/Chip'
import { categories, formatPrice, refreshItems, useItems, type Category, type Item } from '../data'
import { backend, type Photo } from '../lib/backend'
import { preparePhoto } from './photo'
import { newItemId } from './slug'
import { Button, Field, inputClass } from './ui'

const categoryIds = Object.keys(categories) as Category[]
const LAST_CATEGORY_KEY = 'retro:admin-category'

/** Typical heights, used when the owner doesn't measure: they only set proportions on the shelf. */
const usualHeightCm: Record<Category, number> = { porcelain: 22, china: 25, bronze: 30, tableware: 18, busts: 30 }

const today = () => new Date().toISOString().slice(0, 10)

export function ItemForm() {
  const { id } = useParams()
  const { items } = useItems()

  if (id && items === null) return <p className="text-lace-soft">Загружаем…</p>
  const existing = id ? items?.find((i) => i.id === id) : undefined
  if (id && !existing) {
    return (
      <p>
        Такой вещи нет — возможно, её уже удалили.{' '}
        <Link to="/admin" className="text-brass underline">
          К списку
        </Link>
      </p>
    )
  }
  return <Form key={id ?? 'new'} existing={existing} all={items ?? []} />
}

type PhotoState =
  | { status: 'none' }
  | { status: 'working'; message: string }
  | { status: 'ready'; photo: Photo; preview: string }
  | { status: 'failed'; message: string }

function Form({ existing, all }: { existing?: Item; all: Item[] }) {
  const navigate = useNavigate()
  const [name, setName] = useState(existing?.name ?? '')
  const [price, setPrice] = useState(existing?.price != null ? String(existing.price) : '')
  const [onRequest, setOnRequest] = useState(existing ? existing.price === null : false)
  const [description, setDescription] = useState(existing?.description ?? '')
  const [category, setCategory] = useState<Category>(
    existing?.category ?? ((localStorage.getItem(LAST_CATEGORY_KEY) as Category | null) || 'porcelain'),
  )
  const [origin, setOrigin] = useState(existing?.origin ?? '')
  const [height, setHeight] = useState(existing ? String(existing.heightCm) : '')
  const [onShelf, setOnShelf] = useState(!!existing?.shelf)
  const [sold, setSold] = useState(!!existing?.sold)

  const [source, setSource] = useState<{ file: Blob; keepBackground: boolean } | null>(null)
  const [photo, setPhoto] = useState<PhotoState>({ status: 'none' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Re-run the photo pipeline whenever a new photo arrives or «оставить фон» flips.
  useEffect(() => {
    if (!source) return
    let cancelled = false
    setPhoto({ status: 'working', message: 'Читаем фото…' })
    preparePhoto(source.file, {
      keepBackground: source.keepBackground,
      onProgress: (message) => !cancelled && setPhoto({ status: 'working', message }),
    })
      .then((result) => !cancelled && setPhoto({ status: 'ready', photo: result, preview: URL.createObjectURL(result.blob) }))
      .catch((e: unknown) => {
        console.error(e)
        if (!cancelled) setPhoto({ status: 'failed', message: e instanceof Error ? e.message : 'Не удалось обработать фото' })
      })
    return () => {
      cancelled = true
    }
  }, [source])

  // Free the previous preview's memory when it is replaced.
  const preview = photo.status === 'ready' ? photo.preview : null
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview])

  const pick = (file: File | undefined) => file && setSource({ file, keepBackground: false })

  function validate() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Напишите название'
    if (!onRequest && !/^\d+$/.test(price.replace(/\s/g, ''))) next.price = 'Цена — только цифры, например 25000'
    if (height && !(Number(height.replace(',', '.')) > 0)) next.height = 'Высота — число сантиметров'
    if (!existing && photo.status !== 'ready') next.photo = 'Добавьте фото вещи'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  /** Keeps its slot when it already stands on this shelf; otherwise takes the first free one, if any. */
  function shelfFor(): { shelf: number | null; full: boolean } {
    if (!onShelf || sold) return { shelf: null, full: false }
    if (existing?.shelf && existing.category === category) return { shelf: existing.shelf, full: false }
    const taken = new Set(all.filter((i) => i.category === category && i.id !== existing?.id && i.shelf && !i.sold).map((i) => i.shelf))
    const free = [1, 2, 3].find((slot) => !taken.has(slot))
    return free ? { shelf: free, full: false } : { shelf: null, full: true }
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaveError('')
    if (photo.status === 'working' || !validate()) return

    const { shelf, full } = shelfFor()
    const title = name.trim()
    const item: Item = {
      id: existing?.id ?? newItemId(title),
      name: title,
      category,
      origin: origin.trim(),
      description: description.trim(),
      price: onRequest ? null : Number(price.replace(/\s/g, '')),
      heightCm: height ? Number(height.replace(',', '.')) : (existing?.heightCm ?? usualHeightCm[category]),
      image: existing?.image ?? '',
      size: existing?.size ?? [0, 0],
      alt: title,
      shelf,
      sold,
      addedAt: existing?.addedAt ?? today(),
    }

    setSaving(true)
    try {
      await backend.saveItem(item, photo.status === 'ready' ? photo.photo : undefined)
      localStorage.setItem(LAST_CATEGORY_KEY, category)
      await refreshItems()
      const where = backend.mode === 'demo' ? 'в этом браузере' : 'на сайте'
      const shelfNote = full ? ` Полка «${categories[category].label}» занята — поменяйте вещи в разделе «Витрина».` : ''
      navigate('/admin', { state: { notice: `Сохранено: «${title}». Уже видно ${where}.${shelfNote}` } })
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не удалось сохранить')
      setSaving(false)
    }
  }

  async function remove() {
    if (!existing) return
    if (!window.confirm(`Удалить «${existing.name}» насовсем? Если вещь продана, лучше отметить «Продано».`)) return
    setSaving(true)
    try {
      await backend.deleteItem(existing)
      await refreshItems()
      navigate('/admin', { state: { notice: `Удалено: «${existing.name}».` } })
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не удалось удалить')
      setSaving(false)
    }
  }

  const shownImage = photo.status === 'ready' ? photo.preview : existing?.image
  const priceNumber = Number(price.replace(/\s/g, ''))

  return (
    <form onSubmit={save} noValidate className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start md:gap-12">
      <h1 className="font-display text-[clamp(28px,3vw,40px)] leading-tight font-bold tracking-[-0.03em] md:col-span-2">
        {existing ? existing.name : 'Новая вещь'}
      </h1>

      {/* Photo: how it will stand on the shelf, and the two ways to get one. */}
      <section aria-label="Фото" className="grid gap-3 md:sticky md:top-36">
        <div className="relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-[3px] bg-veneer-deep px-[10%] pt-[6%] pb-[5%] md:aspect-[4/5] md:pt-[10%] md:pb-[8%]">
          {shownImage ? (
            <img src={shownImage} alt="" className={`max-h-full max-w-full object-contain ${photo.status === 'working' ? 'opacity-30' : ''}`} />
          ) : (
            <p className="self-center text-center text-lace-soft">Сфотографируйте вещь на однотонном фоне — фон уберём сами</p>
          )}
          {photo.status === 'working' && (
            <p role="status" className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-[17px]">
              {photo.message}
            </p>
          )}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 bg-glass/40" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="relative inline-flex min-h-13 cursor-pointer items-center justify-center rounded-[3px] bg-brass px-3 text-[17px] font-medium text-veneer-deep transition-[scale] active:scale-[0.97] has-focus-visible:ring-2 has-focus-visible:ring-lace">
            Снять фото
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          <label className="relative inline-flex min-h-13 cursor-pointer items-center justify-center rounded-[3px] bg-veneer-hi px-3 text-[17px] font-medium transition-[scale] hover:bg-veneer-hover active:scale-[0.97] has-focus-visible:ring-2 has-focus-visible:ring-lace">
            Из галереи
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
        </div>

        {source && (
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={source.keepBackground}
              disabled={photo.status === 'working'}
              onChange={(e) => setSource({ ...source, keepBackground: e.target.checked })}
              className="size-5 accent-brass"
            />
            Оставить фон как на фото
          </label>
        )}
        {photo.status === 'failed' && (
          <p role="alert" className="text-[#ffb4a2]">
            {photo.message}. Попробуйте другое фото или отметьте «Оставить фон».
          </p>
        )}
        {errors.photo && (
          <p role="alert" className="text-[#ffb4a2]">
            {errors.photo}
          </p>
        )}
      </section>

      <div className="grid gap-6">
        <Field label="Название" htmlFor="name" hint={errors.name && <span className="text-[#ffb4a2]">{errors.name}</span>}>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Статуэтка «Плясунья»" className={inputClass} aria-invalid={!!errors.name} />
        </Field>

        <Field
          label="Цена, ₸"
          htmlFor="price"
          hint={
            errors.price ? (
              <span className="text-[#ffb4a2]">{errors.price}</span>
            ) : !onRequest && priceNumber > 0 ? (
              `На сайте: ${formatPrice(priceNumber)}`
            ) : undefined
          }
        >
          <input
            id="price"
            inputMode="numeric"
            value={onRequest ? '' : price}
            disabled={onRequest}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={onRequest ? 'по запросу' : '25000'}
            className={`${inputClass} disabled:opacity-50`}
            aria-invalid={!!errors.price}
          />
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input type="checkbox" checked={onRequest} onChange={(e) => setOnRequest(e.target.checked)} className="size-5 accent-brass" />
            Цена по запросу
          </label>
        </Field>

        <Field label="Описание" htmlFor="description" hint="Необязательно: сохранность, история вещи.">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
            className={`${inputClass} py-3 leading-snug`}
          />
        </Field>

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-base font-medium">Раздел</legend>
          <div className="flex flex-wrap gap-2">
            {categoryIds.map((c) => (
              <Chip key={c} pressed={category === c} onClick={() => setCategory(c)}>
                {categories[c].label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <details open={!!existing} className="group rounded-[3px] bg-veneer-deep px-4 py-1">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-medium">
            Подробнее: откуда и какой высоты
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="grid gap-5 pt-2 pb-4">
            <Field label="Откуда, годы" htmlFor="origin" hint="Пишется на бирке под названием.">
              <input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="ЛФЗ, 1960-е" className={`${inputClass} bg-inside`} />
            </Field>
            <Field
              label="Высота, см"
              htmlFor="height"
              hint={errors.height ? <span className="text-[#ffb4a2]">{errors.height}</span> : `Чтобы на полке вещи стояли в пропорции. Не знаете — оставьте пустым (${usualHeightCm[category]} см).`}
            >
              <input id="height" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={String(usualHeightCm[category])} className={`${inputClass} bg-inside`} />
            </Field>
          </div>
        </details>

        <div className="grid gap-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input type="checkbox" checked={onShelf && !sold} disabled={sold} onChange={(e) => setOnShelf(e.target.checked)} className="size-5 accent-brass" />
            Поставить на витрину на главной
          </label>
          {existing && (
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" checked={sold} onChange={(e) => setSold(e.target.checked)} className="size-5 accent-brass" />
              Продано
            </label>
          )}
        </div>

        {saveError && (
          <p role="alert" className="text-[#ffb4a2]">
            Не сохранилось: {saveError}
          </p>
        )}

        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <Button type="submit" look="primary" disabled={saving || photo.status === 'working'} className="md:min-w-56">
            {saving ? 'Сохраняем…' : existing ? 'Сохранить' : 'Добавить на сайт'}
          </Button>
          {existing && (
            <Button look="danger" onClick={remove} disabled={saving}>
              Удалить
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
