import type { Category, Item } from '../../data'

export type Budget = 'to20' | '20-50' | '50-100' | 'from100'
export type Sort = 'new' | 'cheap' | 'dear'

export type Filters = {
  category: Category | null
  budget: Budget | null
  sort: Sort
  showSold: boolean
}

export const budgets: { id: Budget; label: string; min: number; max: number }[] = [
  { id: 'to20', label: 'до 20 000 ₸', min: 0, max: 20000 },
  { id: '20-50', label: '20–50 000 ₸', min: 20000, max: 50000 },
  { id: '50-100', label: '50–100 000 ₸', min: 50000, max: 100000 },
  { id: 'from100', label: 'от 100 000 ₸', min: 100000, max: Infinity },
]

export const sorts: { id: Sort; label: string }[] = [
  { id: 'new', label: 'Сначала новые' },
  { id: 'cheap', label: 'Сначала дешевле' },
  { id: 'dear', label: 'Сначала дороже' },
]

/** Items «по запросу» have no price: they never match a budget and sort after priced ones. */
export function filterItems(items: Item[], { category, budget, sort, showSold }: Filters) {
  const range = budgets.find((b) => b.id === budget)
  const newest = (a: Item, b: Item) => b.addedAt.localeCompare(a.addedAt)
  const byPrice = (a: Item, b: Item, direction: 1 | -1) => {
    if (a.price === null || b.price === null) return a.price === b.price ? newest(a, b) : a.price === null ? 1 : -1
    return (a.price - b.price) * direction
  }

  return items
    .filter((item) => showSold || !item.sold)
    .filter((item) => !category || item.category === category)
    .filter((item) => !range || (item.price !== null && item.price >= range.min && item.price < range.max))
    .sort((a, b) => (sort === 'cheap' ? byPrice(a, b, 1) : sort === 'dear' ? byPrice(a, b, -1) : newest(a, b)))
}

const isBudget = (v: string | null): v is Budget => budgets.some((b) => b.id === v)
const isSort = (v: string | null): v is Sort => sorts.some((s) => s.id === v)

/** Filters live in the address bar, so a selection can be shared as a link. */
export function readFilters(params: URLSearchParams, isCategory: (v: string | null) => v is Category): Filters {
  const cat = params.get('cat')
  const budget = params.get('budget')
  const sort = params.get('sort')
  return {
    category: isCategory(cat) ? cat : null,
    budget: isBudget(budget) ? budget : null,
    sort: isSort(sort) ? sort : 'new',
    showSold: params.get('sold') === '1',
  }
}

export function writeFilters({ category, budget, sort, showSold }: Filters) {
  const params = new URLSearchParams()
  if (category) params.set('cat', category)
  if (budget) params.set('budget', budget)
  if (sort !== 'new') params.set('sort', sort)
  if (showSold) params.set('sold', '1')
  return params
}
