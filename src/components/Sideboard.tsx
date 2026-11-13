import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { getCoinPages, getItems, whatsappLink } from '../data'
import { plural } from '../lib/plural'

const nav = [
	{ to: '/catalog', label: 'Каталог' },
	{ to: '/catalog/coins', label: 'Монеты и банкноты' },
	{ to: '/#visit', label: 'Адрес' },
]

type DrawerProps = {
	label: ReactNode
	/** What shows at the top of the drawer when it slides out. */
	contents: ReactNode
	/** The card in the brass holder: plain paper, brass for the catalogue, enamel blue for WhatsApp. */
	card?: 'paper' | 'brass' | 'cobalt'
} & ({ to: string; href?: never } | { href: string; to?: never })

const cards = {
	paper: 'bg-lace text-veneer-deep',
	brass: 'bg-brass text-veneer-deep',
	cobalt: 'bg-cobalt text-lace',
}

/**
 * A drawer of the sideboard: a sunk panel, a brass holder with a card naming what is inside and a
 * bail pull under it. Under the cursor the front slides out towards you and the top of what lies
 * inside shows above it; pressed, it comes out further.
 */
function Drawer({ to, href, label, contents, card = 'paper' }: DrawerProps) {
	const className =
		'group relative block h-13 overflow-hidden bg-inside no-underline focus-visible:outline-offset-2 md:h-19'
	const body = (
		<>
			<span
				aria-hidden='true'
				className='absolute inset-x-0 top-0 flex h-3.5 items-start justify-center gap-1.5 overflow-hidden px-4 pt-0.5'
			>
				{contents}
			</span>
			<span className='absolute inset-0 flex flex-col items-center justify-center gap-1 bg-veneer-hover transition-[translate,background-color] duration-350 ease-drawer group-hover:translate-y-3 group-hover:bg-[#8c4022] group-active:translate-y-4 motion-reduce:transition-none md:gap-1.5'>
				<span aria-hidden='true' className='absolute inset-1.5 bg-veneer-hi md:inset-2' />
				<span
					className={`relative rounded-[2px] border-2 border-brass px-3 py-px text-[15px] leading-snug font-medium whitespace-nowrap md:px-4 md:py-0.5 md:text-base ${cards[card]}`}
				>
					{label}
				</span>
				<span
					aria-hidden='true'
					className='relative h-2 w-10 rounded-b-[10px] border-[3px] border-t-0 border-brass transition-[scale] duration-350 ease-drawer group-hover:scale-y-125 md:h-2.5 md:w-12'
				/>
			</span>
		</>
	)
	return to ? (
		<Link to={to} className={className}>
			{body}
		</Link>
	) : (
		<a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel='noreferrer' className={className}>
			{body}
		</a>
	)
}

/** Index cards standing in the catalogue drawer, one with a taller tab. */
const indexCards = [0, 1, 2, 3, 4].map(i => (
	<span key={i} className={`w-5 rounded-t-[1px] bg-lace ${i === 2 ? 'h-3' : 'h-2.5'}`} />
))

const envelope = (
	<span className='relative h-2.5 w-9 bg-lace'>
		<span className='absolute inset-x-0 top-0 h-2 bg-lace-soft [clip-path:polygon(0_0,100%_0,50%_100%)]' />
	</span>
)

const foldedMap = (
	<span className='flex h-2.5 w-16'>
		<span className='flex-1 bg-glass' />
		<span className='flex-1 bg-[#8fb2a5]' />
		<span className='flex-1 bg-glass' />
	</span>
)

/**
 * First screen: a polished sideboard whose glass doors slide open on their own once the photo
 * behind them has loaded. Scrolling is never held back; clicking the glass closes and reopens them.
 */
export function Sideboard() {
	const photo = useRef<HTMLImageElement>(null)
	const [open, setOpen] = useState(false)
	const stock = getItems().filter(item => !item.sold).length
	const coins = getCoinPages()[0].coins.slice(0, 5)

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
			className='grid h-[88svh] min-h-[600px] grid-rows-[auto_1fr] gap-4.5 px-4 pt-5 pb-5.5 md:h-[90svh] md:min-h-[620px] md:px-9'
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

			{/* One body of veneer: the glass case on top, a rail, the drawers below. */}
			<div className='flex min-h-0 flex-col gap-3 rounded bg-veneer-hi p-3 md:gap-[18px] md:p-[18px]'>
				<div
					className={`relative min-h-0 flex-1 overflow-hidden bg-veneer-deep ${open ? 'is-open' : ''}`}
				>
					<div className='absolute inset-0 bg-inside'>
						{/* An archive photo of a real porcelain cabinet: two shelves fill the wide case, the whole cabinet the phone. */}
						<picture>
							<source media='(max-width: 47.999rem)' srcSet='/images/vitrine-tall.webp' width={1200} height={828} />
							<img
								ref={photo}
								src='/images/vitrine-wide.webp'
								width={1400}
								height={641}
								alt='Полки старинного шкафа с фарфором: совы, вазы с цветочной росписью, птицы, каминные часы'
								className='cabinet-photo size-full object-cover object-[50%_45%]'
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

				{/* A chest of drawers: side by side on a wide screen, one above another on a phone. */}
				<div className='grid gap-1 bg-inside md:grid-cols-4 md:gap-1.5'>
					<Drawer
						to='/catalog'
						card='brass'
						label={
							<>
								Каталог <span className='font-normal'>· {plural(stock, ['вещь', 'вещи', 'вещей'])}</span>
							</>
						}
						contents={indexCards}
					/>
					<Drawer
						to='/catalog/coins'
						label='Монеты и банкноты'
						contents={coins.map(coin => (
							<img key={coin.id} src={coin.reverse} alt='' width={14} height={14} className='size-3.5 rounded-full' />
						))}
					/>
					<Drawer to='/#visit' label='Как пройти' contents={foldedMap} />
					<Drawer
						href={whatsappLink('Здравствуйте! Пишу с сайта лавки «Ретро».')}
						card='cobalt'
						label='Написать в WhatsApp'
						contents={envelope}
					/>
				</div>
			</div>
		</section>
	)
}
