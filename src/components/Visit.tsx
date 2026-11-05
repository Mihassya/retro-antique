import type { ReactNode } from 'react'
import { shop } from '../data'
import { Reveal } from './Reveal'

const facts: [string, ReactNode][] = [
	['Город', shop.city],
	[
		'Адрес',
		<>
			{shop.address}, {shop.landmark}
			<a href={shop.map} target='_blank' rel='noreferrer' className='mt-1 block text-brass underline underline-offset-[0.22em]'>
				Открыть в 2ГИС
			</a>
		</>,
	],
	[
		'Часы',
		<>
			{shop.hours.map(([days, time]) => (
				<span key={days} className='block'>
					{days} {time}
				</span>
			))}
		</>,
	],
	['Оплата', 'наличные, перевод, QR'],
	['Скупка', 'приносите вещь — оценим при вас'],
]

export function Visit() {
	return (
		<footer>
			<section
				id='visit'
				aria-labelledby='visit-title'
				className='grid gap-8 px-4 pt-24 pb-10 md:grid-cols-12 md:gap-6 md:px-9 md:pt-38'
			>
				<Reveal
					as='h2'
					className='font-display text-[clamp(40px,5vw,84px)] leading-[.95] font-bold tracking-[-0.035em] md:col-span-7'
				>
					<span id='visit-title'>С 10 до 18, в&nbsp;субботу до&nbsp;14</span>
				</Reveal>
				<Reveal
					as='dl'
					delay={90}
					className='grid grid-cols-[auto_1fr] gap-x-7 gap-y-3 self-end text-lg md:col-span-5 md:text-[19px]'
				>
					{facts.map(([term, value]) => (
						<div key={term} className='contents'>
							<dt className='text-lace-soft'>{term}</dt>
							<dd>{value}</dd>
						</div>
					))}
				</Reveal>
			</section>

			<p
				aria-hidden='true'
				className='overflow-hidden px-4 pt-10 font-display text-[clamp(80px,25vw,380px)] leading-[.8] font-bold tracking-[-0.06em] whitespace-nowrap text-brass md:px-9'
			>
				ретро
			</p>
			<p className='max-w-[75ch] px-4 pt-5 pb-8 text-[15px] text-lace-soft md:px-9'>
				Описания и цены — образец.
			</p>
		</footer>
	)
}
