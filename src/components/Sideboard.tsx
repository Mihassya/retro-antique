import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { getItems, whatsappLink } from '../data'
import { plural } from '../lib/plural'

const nav = [
	{ to: '/catalog', label: 'Каталог' },
	{ to: '/catalog/coins', label: 'Монеты и банкноты' },
	{ to: '/#visit', label: 'Адрес' },
]

type DrawerProps = { label: ReactNode; tone?: 'plain' | 'brass' | 'cobalt' } & (
	| { to: string; href?: never }
	| { href: string; to?: never }
)

const tones = {
	plain: 'bg-veneer-hi text-lace hover:bg-veneer-hover',
	brass: 'bg-brass text-veneer-deep hover:bg-[#e4c070]',
	cobalt: 'bg-cobalt text-lace hover:bg-cobalt-hover',
}

/** A sideboard drawer: slides out a little on hover, further on press. */
function Drawer({ to, href, label, tone = 'plain' }: DrawerProps) {
	const className = `group flex min-h-15 items-center justify-between gap-3 rounded-[3px] px-4 text-base font-medium leading-tight no-underline transition-[translate,background-color] duration-350 ease-drawer hover:translate-y-[5px] active:translate-y-2 md:min-h-19 md:px-6 md:text-[17px] ${tones[tone]}`
	const handle = (
		<span
			aria-hidden='true'
			className={`h-3 w-7.5 flex-none rounded-md transition-transform duration-350 ease-drawer group-hover:scale-x-110 ${tone === 'brass' ? 'bg-veneer-deep' : 'bg-brass'}`}
		/>
	)
	return to ? (
		<Link to={to} className={className}>
			{label}
			{handle}
		</Link>
	) : (
		<a
			href={href}
			target={href?.startsWith('http') ? '_blank' : undefined}
			rel='noreferrer'
			className={className}
		>
			{label}
			{handle}
		</a>
	)
}

/**
 * First screen: a polished sideboard whose glass doors slide open on their own once the photo
 * behind them has loaded. Scrolling is never held back; clicking the glass closes and reopens them.
 */
export function Sideboard() {
	const photo = useRef<HTMLImageElement>(null)
	const [open, setOpen] = useState(false)
	const stock = getItems().filter(item => !item.sold).length

	useEffect(() => {
		const img = photo.current
		if (!img) return
		let timer = 0
		const reveal = () => {
			timer = window.setTimeout(() => setOpen(true), 350)
		}
		if (img.complete) reveal()
		else img.addEventListener('load', reveal, { once: true })
		return () => {
			img.removeEventListener('load', reveal)
			window.clearTimeout(timer)
		}
	}, [])

	return (
		<section
			id='top'
			aria-labelledby='hero-title'
			className='grid h-[88svh] min-h-[560px] grid-rows-[auto_1fr_auto] gap-4.5 px-4 pt-5 pb-5.5 md:h-[90svh] md:min-h-[620px] md:px-9'
		>
			<div className='grid items-end gap-6 md:grid-cols-[1fr_auto]'>
				<h1
					id='hero-title'
					className='font-display text-[clamp(64px,9.4vw,152px)] leading-[.86] font-bold tracking-[-0.04em]'
				>
					Ретро
				</h1>
				<div className='flex flex-col gap-3.5 pb-2 md:items-end'>
					<nav aria-label='Разделы' className='hidden gap-6.5 text-base md:flex'>
						{nav.map(link => (
							<Link key={link.label} to={link.to} className='no-underline hover:underline'>
								{link.label}
							</Link>
						))}
					</nav>
					<p className='max-w-[34ch] text-[clamp(17px,1.35vw,21px)] text-lace-soft md:text-right'>
						Антикварная лавка в Усть-Каменогорске, ул. Казахстан, 77.
					</p>
				</div>
			</div>

			<div
				className={`relative overflow-hidden rounded border-12 border-veneer-hi bg-veneer-deep md:border-18 ${open ? 'is-open' : ''}`}
			>
				<div className='absolute inset-0 bg-inside'>
					{/* A wide shot fills the wide cabinet; a phone gets a closer one with the figures in the middle. */}
					<picture>
						<source media='(max-width: 47.999rem)' srcSet='/images/vitrine-tall.webp' width={1280} height={660} />
						<img
							ref={photo}
							src='/images/vitrine-wide.webp'
							width={1920}
							height={814}
							alt='Фарфоровые статуэтки на стеклянной полке витрины: пары в народных костюмах, девушка с ягнёнком, музыкант'
							className='cabinet-photo size-full object-cover object-[50%_80%]'
						/>
					</picture>
				</div>
				<div className='door door-left' aria-hidden='true' />
				<div className='door door-right' aria-hidden='true' />
				<div
					aria-hidden='true'
					className='cabinet-lamp absolute -top-px left-1/2 h-1.5 w-30 -translate-x-1/2 rounded-b bg-[#ffe9b0]'
				/>
				<button
					type='button'
					aria-pressed={open}
					aria-label={open ? 'Закрыть дверцы серванта' : 'Открыть дверцы серванта'}
					onClick={() => setOpen(v => !v)}
					className='absolute inset-0 cursor-pointer focus-visible:outline-offset-[-6px]'
				/>
			</div>

			<div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
				<Drawer
					to='/catalog'
					tone='brass'
					label={
						<span>
							Каталог{' '}
							<span className='font-normal whitespace-nowrap max-md:block'>
								<span className='max-md:hidden'>· </span>
								{plural(stock, ['вещь', 'вещи', 'вещей'])}
							</span>
						</span>
					}
				/>
				<Drawer to='/catalog/coins' label='Монеты и банкноты' />
				<Drawer to='/#visit' label='Как пройти' />
				<Drawer
					href={whatsappLink('Здравствуйте! Пишу с сайта лавки «Ретро».')}
					tone='cobalt'
					label={
						<>
							<span className='md:hidden'>WhatsApp</span>
							<span className='hidden md:inline'>Написать в WhatsApp</span>
						</>
					}
				/>
			</div>
		</section>
	)
}
