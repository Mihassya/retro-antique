import { useId, useState, type FormEvent } from 'react'
import { shop, whatsappLink } from '../data'
import { Reveal } from './Reveal'

type Intent = 'sell' | 'buy'

const kinds = ['Фарфор', 'Бронза и часы', 'Монеты', 'Банкноты', 'Китай и Восток', 'Другое']
const cities = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Павлодар', 'Семей', 'Риддер', 'Актобе', 'Костанай', 'Атырау']

const steps = [
  ['Фото в WhatsApp', 'Общий вид, клеймо или надпись, все сколы и трещины.'],
  ['Оценка', 'Александр смотрит фото и называет цену или задаёт вопросы.'],
  ['Доставка', 'Почтой или транспортной компанией, хрупкое упаковываем сами.'],
  ['Оплата', 'Переводом или по QR, когда обе стороны согласны.'],
]

/**
 * The shop works through WhatsApp and calls, so this is not a form with a backend: it writes the first
 * message for the visitor and opens the chat, where photos and the rest of the talk happen anyway.
 */
export function Trade() {
  const id = useId()
  const [intent, setIntent] = useState<Intent>('sell')
  const [city, setCity] = useState('')
  const [kind, setKind] = useState(kinds[2])
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<{ city?: string; text?: string }>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = {
      city: city.trim() ? undefined : 'Напишите город, чтобы посчитать доставку.',
      text: text.trim() ? undefined : intent === 'sell' ? 'Опишите вещь хотя бы парой слов.' : 'Напишите, что ищете.',
    }
    setErrors(next)
    if (next.city || next.text) return

    const message =
      intent === 'sell'
        ? `Здравствуйте! Хочу продать. Город: ${city.trim()}. Что: ${kind}. ${text.trim()} Фото пришлю в этот чат.`
        : `Здравствуйте! Хочу купить с доставкой. Город: ${city.trim()}. Что ищу: ${kind}. ${text.trim()}`
    window.open(whatsappLink(message), '_blank', 'noopener')
  }

  return (
    <section id="trade" aria-labelledby="trade-title" className="grid gap-14 bg-veneer-deep px-4 py-24 md:grid-cols-12 md:gap-6 md:px-9 md:py-38">
      <div className="md:col-span-5">
        <Reveal as="h2" className="max-w-[13ch] font-display text-[clamp(40px,5vw,84px)] leading-[.95] font-bold tracking-[-0.035em]">
          <span id="trade-title">Из другого города</span>
        </Reveal>
        <Reveal as="p" delay={90} className="mt-6 max-w-[40ch]">
          Лавка в {shop.city}е, но вещи покупаем и отправляем по всему Казахстану. Всё решается в переписке.
        </Reveal>
        <Reveal as="ol" delay={160} className="mt-12 grid gap-7">
          {steps.map(([title, note]) => (
            <li key={title} className="grid gap-1">
              <b className="text-lg font-medium">{title}</b>
              <span className="max-w-[40ch] text-lace-soft">{note}</span>
            </li>
          ))}
        </Reveal>
      </div>

      <Reveal delay={120} className="md:col-span-6 md:col-start-7">
        <form noValidate onSubmit={submit} className="rounded bg-lace px-5 py-8 text-veneer-deep md:px-10 md:py-11">
          <fieldset>
            <legend className="font-display text-[clamp(24px,2vw,32px)] leading-tight font-medium tracking-[-0.02em]">Что хотите сделать</legend>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {(['sell', 'buy'] as const).map((value) => (
                <label
                  key={value}
                  className={`flex min-h-13 cursor-pointer items-center justify-center rounded-[3px] text-[17px] font-medium transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.97] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-veneer ${
                    intent === value ? 'bg-veneer-deep text-lace' : 'bg-[#ebe0cf] hover:bg-[#e2d4bf]'
                  }`}
                >
                  <input type="radio" name="intent" value={value} checked={intent === value} onChange={() => setIntent(value)} className="sr-only" />
                  {value === 'sell' ? 'Продать вещь' : 'Купить с доставкой'}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-2">
            <label htmlFor={`${id}-city`} className="font-medium">
              Ваш город
            </label>
            <input
              id={`${id}-city`}
              list={`${id}-cities`}
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                setErrors((x) => ({ ...x, city: undefined }))
              }}
              autoComplete="address-level2"
              placeholder="Алматы"
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? `${id}-city-error` : undefined}
              className="min-h-13 rounded-[3px] bg-[#ebe0cf] px-4 text-[17px] placeholder:text-[#8a7362] focus:bg-white"
            />
            <datalist id={`${id}-cities`}>
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.city && (
              <p id={`${id}-city-error`} className="text-base text-[#a3260f]">
                {errors.city}
              </p>
            )}
          </div>

          <fieldset className="mt-8">
            <legend className="font-medium">{intent === 'sell' ? 'Что за вещь' : 'Что ищете'}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {kinds.map((k) => (
                <label
                  key={k}
                  className={`flex min-h-11 cursor-pointer items-center rounded-[3px] px-4 text-base transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.97] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-veneer ${
                    kind === k ? 'bg-veneer-deep text-lace' : 'bg-[#ebe0cf] hover:bg-[#e2d4bf]'
                  }`}
                >
                  <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                  {k}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-2">
            <label htmlFor={`${id}-text`} className="font-medium">
              {intent === 'sell' ? 'Пара слов о вещи' : 'Что именно нужно'}
            </label>
            <textarea
              id={`${id}-text`}
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setErrors((x) => ({ ...x, text: undefined }))
              }}
              placeholder={intent === 'sell' ? 'Рубль 1924 года, три штуки' : 'Статуэтка ЛФЗ в подарок маме, до 50 000 ₸'}
              aria-invalid={Boolean(errors.text)}
              aria-describedby={errors.text ? `${id}-text-error` : `${id}-text-hint`}
              className="rounded-[3px] bg-[#ebe0cf] px-4 py-3 text-[17px] placeholder:text-[#8a7362] focus:bg-white"
            />
            {errors.text ? (
              <p id={`${id}-text-error`} className="text-base text-[#a3260f]">
                {errors.text}
              </p>
            ) : (
              <p id={`${id}-text-hint`} className="text-base text-[#6b4a38]">
                {intent === 'sell' ? 'Фото приложите уже в чате: общий вид, клеймо, дефекты.' : 'Если вещь есть в каталоге, назовите её — так быстрее.'}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-9 flex min-h-15 w-full items-center justify-center rounded-[3px] bg-cobalt text-[17px] font-medium text-lace transition-[background-color,scale] duration-150 ease-out hover:bg-cobalt-hover active:scale-[0.98]"
          >
            Открыть WhatsApp с этим текстом
          </button>
        </form>
      </Reveal>
    </section>
  )
}
