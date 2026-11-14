import { sampleItems, type Item } from '../../data/items'
import type { Backend } from './types'

const ITEMS_KEY = 'retro:demo-items'
const USER_KEY = 'retro:demo-user'

/**
 * Everything in this browser's localStorage, starting from the sample items. Lets the site and the
 * admin run before a Supabase project exists. Photos are stored as data URLs, so only a few dozen fit.
 */
export function demoBackend(): Backend {
  const read = (): Item[] => {
    try {
      const saved = localStorage.getItem(ITEMS_KEY)
      return saved ? (JSON.parse(saved) as Item[]) : sampleItems
    } catch {
      return sampleItems
    }
  }
  const write = (items: Item[]) => {
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
    } catch {
      throw new Error('В демо-режиме закончилось место в браузере. Подключите Supabase или удалите пару вещей.')
    }
  }

  const listeners = new Set<(email: string | null) => void>()
  const setUser = (email: string | null) => {
    if (email) sessionStorage.setItem(USER_KEY, email)
    else sessionStorage.removeItem(USER_KEY)
    listeners.forEach((l) => l(email))
  }

  const toDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })

  return {
    mode: 'demo',

    async loadItems() {
      return read()
    },

    async saveItem(item, photo) {
      const next = photo ? { ...item, image: await toDataUrl(photo.blob), size: [photo.width, photo.height] as [number, number] } : item
      const items = read()
      const at = items.findIndex((i) => i.id === next.id)
      write(at === -1 ? [next, ...items] : items.map((i) => (i.id === next.id ? next : i)))
      return next
    },

    async deleteItem(item) {
      write(read().filter((i) => i.id !== item.id))
    },

    async setShelf(category, ids) {
      write(
        read().map((i) => {
          if (i.category !== category) return i
          const slot = ids.slice(0, 3).indexOf(i.id)
          return { ...i, shelf: slot === -1 ? null : slot + 1 }
        }),
      )
    },

    async currentUser() {
      return sessionStorage.getItem(USER_KEY)
    },

    onUserChange(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    async signIn(email) {
      setUser(email || 'demo')
    },

    async signOut() {
      setUser(null)
    },
  }
}
