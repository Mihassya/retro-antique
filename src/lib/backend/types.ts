import type { Category, Item } from '../../data/items'

/** A cut-out photo ready to upload: WebP on a transparent ground, trimmed to the object. */
export type Photo = { blob: Blob; width: number; height: number }

/**
 * Where the shop's things live. The site only reads; the admin also writes. Two implementations:
 * Supabase in production, and a demo that keeps everything in this browser's localStorage.
 */
export interface Backend {
  mode: 'supabase' | 'demo'
  loadItems(): Promise<Item[]>
  /** Creates or replaces the item. With a photo, uploads it first and points the item at it. */
  saveItem(item: Item, photo?: Photo): Promise<Item>
  deleteItem(item: Item): Promise<void>
  /** Puts exactly these things on the category's shelf, left to right (at most three). */
  setShelf(category: Category, ids: string[]): Promise<void>

  currentUser(): Promise<string | null>
  onUserChange(listener: (email: string | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}
