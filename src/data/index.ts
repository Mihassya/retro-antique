import { coinPages } from './coins'
import { categories, type Category, type Item } from './items'
import { notePages } from './notes'

/*
 * The one place components read content from. Things for sale come from the backend (Supabase, or the
 * in-browser demo) through `useItems`; coins, banknotes and contacts are still typed files here.
 */

export const getCoinPages = () => coinPages
export const getNotePages = () => notePages

/** Every coin and note image has a full-size twin in a `large/` folder next to it, for the viewer. */
export const largeImage = (src: string) => src.replace(/\/images\/(coins|notes)\//, '/images/$1/large/')

export const countCoins = () =>coinPages.reduce((n, page) => n + page.coins.length, 0)
export const countNotes = () => notePages.reduce((n, page) => n + page.notes.length, 0)

export type Shelf = { category: Category; title: string; note: string; link: string; items: Item[] }

/** Sideboard shelves for the home page: one per category that has something on its shelf, slots 1–3 in order. */
export function getShelves(items: Item[]): Shelf[] {
  return (Object.keys(categories) as Category[])
    .map((category) => ({
      category,
      title: categories[category].label,
      note: categories[category].note,
      link: categories[category].shelf,
      items: items
        .filter((item) => item.category === category && item.shelf && !item.sold)
        .sort((a, b) => (a.shelf ?? 0) - (b.shelf ?? 0))
        .slice(0, 3),
    }))
    .filter((shelf) => shelf.items.length > 0)
}

/** «Девочка после купания (ЛФЗ, 1960-е)» — the name with its origin when there is one, for messages. */
export const itemTitle = (item: Item) => (item.origin ? `«${item.name}» (${item.origin})` : `«${item.name}»`)

export { categories, type Category, type Item }
export { refreshItems, useItems } from './store'
export { formatPrice, shop, whatsappLink } from './shop'
