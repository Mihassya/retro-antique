import { Reveal } from './Reveal'

const facts = [
  ['Адрес', 'ул. Казахстан, 77, рядом с Домом связи'],
  ['Часы', 'каждый день 10:00–18:00'],
  ['Оплата', 'наличные, перевод, QR'],
  ['Скупка', 'приносите вещь — оценим при вас'],
]

export function Visit() {
  return (
    <footer>
      <section id="visit" aria-labelledby="visit-title" className="grid gap-8 px-4 pt-24 pb-10 md:grid-cols-12 md:gap-6 md:px-9 md:pt-38">
        <Reveal as="h2" className="font-display text-[clamp(40px,5vw,84px)] leading-[.95] font-bold tracking-[-0.035em] md:col-span-7">
          <span id="visit-title">Открыто с 10 до 18</span>
        </Reveal>
        <Reveal as="dl" delay={90} className="grid grid-cols-[auto_1fr] gap-x-7 gap-y-3 self-end text-lg md:col-span-5 md:text-[19px]">
          {facts.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="text-lace-soft">{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      <p aria-hidden="true" className="overflow-hidden px-4 pt-10 font-display text-[clamp(80px,25vw,380px)] leading-[.8] font-bold tracking-[-0.06em] whitespace-nowrap text-brass md:px-9">
        ретро
      </p>
      <p className="max-w-[75ch] px-4 pt-5 pb-8 text-[15px] text-lace-soft md:px-9">
        Иллюстрации, пока нет своих фото: «Soviet porcelain 03» — shakko, CC BY-SA 3.0; «Figurine-girl after bathing» — Andshel,
        CC BY-SA 3.0 (Wikimedia Commons). Предметы каталога — Art Institute of Chicago и Metropolitan Museum, CC0. Монеты — серия
        RR3009 на Wikimedia Commons, общественное достояние. Банкноты — образцы из собрания Музея нации (moneymuseum.by),
        общественное достояние. Описания и цены — образец.
      </p>
    </footer>
  )
}
