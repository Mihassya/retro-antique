export type Category = 'porcelain' | 'china' | 'bronze' | 'tableware' | 'busts'

export type Item = {
  id: string
  name: string
  category: Category
  /** Maker, place or period, as it goes on the tag. */
  origin: string
  /** Tenge; null means «по запросу». */
  price: number | null
  /** Real height of the object. The shelf turns it into pixels, so things keep their proportions. */
  heightCm: number
  /** Cut-out photo on a transparent ground. */
  image: string
  /** Intrinsic size of `image`, for layout before it loads. */
  size: [width: number, height: number]
  alt: string
  /** Stands in the sideboard on the home page. Three per category at most. */
  featured?: boolean
  sold?: boolean
  /** ISO date the item came into the shop, for «сначала новые». */
  addedAt: string
}

export const categories: Record<Category, { label: string; shelf: string; note: string }> = {
  porcelain: {
    label: 'Фарфор',
    shelf: 'весь фарфор',
    note: 'ЛФЗ, Полонное, Дулёво и старая Европа. Статуэтки, которые стояли почти в каждом доме.',
  },
  china: {
    label: 'Китай и Восток',
    shelf: 'весь Китай и Восток',
    note: 'Вазы, чайники, бронзовые будды. Роспись кобальтом, селадон, бисквит.',
  },
  bronze: {
    label: 'Бронза и часы',
    shelf: 'всю бронзу и часы',
    note: 'Литьё, позолота, механика. Самые тяжёлые вещи в лавке.',
  },
  tableware: {
    label: 'Посуда',
    shelf: 'всю посуду',
    note: 'Чайники, сервизы, письменные приборы.',
  },
  busts: {
    label: 'Бюсты',
    shelf: 'все бюсты',
    note: 'Мрамор, бисквит, гипс.',
  },
}

// Sample content: names, dates and prices must be confirmed by the shop.
export const items: Item[] = [
  {
    id: 'girl-after-bathing',
    name: 'Девочка после купания',
    category: 'porcelain',
    origin: 'ЛФЗ, 1960-е',
    price: 38000,
    heightCm: 24,
    image: '/images/cutouts/figurine.webp',
    size: [395, 900],
    alt: 'Статуэтка девочки в голубом купальнике',
    featured: true,
    addedAt: '2026-10-28',
  },
  {
    id: 'girl-with-flowers',
    name: 'Девушка с цветами',
    category: 'porcelain',
    origin: 'Германия, XIX век',
    price: 45000,
    heightCm: 21,
    image: '/images/cutouts/girl-porcelain.webp',
    size: [337, 884],
    alt: 'Фарфоровая статуэтка девушки в розовом платье с корзиной цветов',
    featured: true,
    addedAt: '2026-10-12',
  },
  {
    id: 'man-with-grapes',
    name: 'Кавалер с виноградом',
    category: 'porcelain',
    origin: 'Германия, XIX век',
    price: 45000,
    heightCm: 21,
    image: '/images/cutouts/man-grapes.webp',
    size: [356, 878],
    alt: 'Фарфоровая статуэтка мужчины в розовом камзоле с корзиной винограда',
    featured: true,
    addedAt: '2026-10-12',
  },
  {
    id: 'teapot-bamboo',
    name: 'Чайник «Стебли бамбука»',
    category: 'china',
    origin: 'Китай',
    price: 67000,
    heightCm: 17,
    image: '/images/cutouts/teapot-bianhu.webp',
    size: [782, 817],
    alt: 'Белый плоский чайник с деревянной крышкой',
    featured: true,
    addedAt: '2026-09-30',
  },
  {
    id: 'hexagonal-vase',
    name: 'Ваза шестигранная',
    category: 'china',
    origin: 'Китай, селадон',
    price: 85000,
    heightCm: 19,
    image: '/images/cutouts/vase-hex.webp',
    size: [680, 617],
    alt: 'Шестигранная ваза бледно-зелёной глазури',
    featured: true,
    addedAt: '2026-10-20',
  },
  {
    id: 'vase-peonies',
    name: 'Ваза с пионами',
    category: 'china',
    origin: 'Китай, резной узор',
    price: null,
    heightCm: 30,
    image: '/images/cutouts/jar-peonies.webp',
    size: [521, 900],
    alt: 'Зелёная ваза с рельефным узором пионов',
    featured: true,
    addedAt: '2026-08-14',
  },
  {
    id: 'buddha-amitabha',
    name: 'Будда Амитабха',
    category: 'china',
    origin: 'серебрение, XIX век',
    price: 50000,
    heightCm: 26,
    image: '/images/cutouts/buddha.webp',
    size: [632, 799],
    alt: 'Серебристая фигура сидящего Будды на ступенчатом постаменте',
    addedAt: '2026-07-02',
  },
  {
    id: 'candlestick-crest',
    name: 'Подсвечник с гербом',
    category: 'china',
    origin: 'Китай, экспорт',
    price: null,
    heightCm: 25,
    image: '/images/cutouts/candlestick.webp',
    size: [348, 900],
    alt: 'Фарфоровый подсвечник с кобальтовыми поясками',
    addedAt: '2026-06-18',
  },
  {
    id: 'lion',
    name: 'Лев',
    category: 'bronze',
    origin: 'бронза, конец XIX века',
    price: 115000,
    heightCm: 14,
    image: '/images/cutouts/lion.webp',
    size: [900, 671],
    alt: 'Тёмная бронзовая фигура льва на скале',
    featured: true,
    addedAt: '2026-10-30',
  },
  {
    id: 'wall-clock',
    name: 'Настенные часы',
    category: 'bronze',
    origin: 'бронза, позолота',
    price: null,
    heightCm: 60,
    image: '/images/cutouts/wall-clock.webp',
    size: [429, 900],
    alt: 'Позолоченные настенные часы с фигурой наверху',
    featured: true,
    addedAt: '2026-09-05',
  },
  {
    id: 'candelabrum',
    name: 'Канделябр',
    category: 'bronze',
    origin: 'позолота, камень',
    price: 140000,
    heightCm: 28,
    image: '/images/cutouts/candelabrum.webp',
    size: [634, 518],
    alt: 'Канделябр на четыре свечи с золочёными завитками',
    featured: true,
    addedAt: '2026-10-02',
  },
  {
    id: 'inkstand-crab',
    name: 'Чернильница «Краб»',
    category: 'bronze',
    origin: 'бронза, стекло',
    price: 64000,
    heightCm: 9,
    image: '/images/cutouts/inkstand-crab.webp',
    size: [488, 363],
    alt: 'Бронзовая чернильница в виде краба',
    addedAt: '2026-08-22',
  },
  {
    id: 'teapot-worcester',
    name: 'Чайник с крышкой',
    category: 'tableware',
    origin: 'Вустер, 1882',
    price: 54000,
    heightCm: 15,
    image: '/images/cutouts/teapot-worcester.webp',
    size: [814, 749],
    alt: 'Фарфоровый чайник в виде фигуры мужчины в зелёном камзоле',
    addedAt: '2026-07-19',
  },
  {
    id: 'inkwell-pewter',
    name: 'Чернильница',
    category: 'tableware',
    origin: 'олово, XIX век',
    price: 18000,
    heightCm: 8,
    image: '/images/cutouts/inkwell.webp',
    size: [695, 900],
    alt: 'Оловянная чернильница с откинутой крышкой',
    sold: true,
    addedAt: '2026-05-10',
  },
  {
    id: 'bust-paris',
    name: 'Бюст Париса',
    category: 'busts',
    origin: 'по Канове, мрамор',
    price: 65000,
    heightCm: 34,
    image: '/images/cutouts/bust-paris.webp',
    size: [382, 900],
    alt: 'Белый мраморный бюст юноши во фригийском колпаке',
    addedAt: '2026-09-12',
  },
]
