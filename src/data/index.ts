import { coinPages } from './coins'
import { categories, items, type Category, type Item } from './items'
import { notePages } from './notes'

/*
 * The one place components read content from. Today it is typed files in this folder; later a build
 * step (CMS, Telegram bot) can write those files or replace these functions without touching the UI.
 */

export const getItems = () => items
export const getCoinPages = () => coinPages
export const getNotePages = () => notePages

/** Every coin and note image has a full-size twin in a `large/` folder next to it, for the viewer. */
export const largeImage = (src: string) => src.replace(/\/images\/(coins|notes)\//, '/images/$1/large/')

export const countCoins = () =>coinPages.reduce((n, page) => n + page.coins.length, 0)
export const countNotes = () => notePages.reduce((n, page) => n + page.notes.length, 0)

export type Shelf = { category: Category; title: string; note: string; link: string; items: Item[] }

/** Sideboard shelves for the home page: one per category that has featured things, three things each. */
export function getShelves(): Shelf[] {
  return (Object.keys(categories) as Category[])
    .map((category) => ({
      category,
      title: categories[category].label,
      note: categories[category].note,
      link: categories[category].shelf,
      items: items.filter((item) => item.category === category && item.featured && !item.sold).slice(0, 3),
    }))
    .filter((shelf) => shelf.items.length > 0)
}

export { categories, type Category, type Item }
export { formatPrice, shop, whatsappLink } from './shop'
