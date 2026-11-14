import { useSyncExternalStore } from 'react'
import { backend } from '../lib/backend'
import type { Item } from './items'

/** `items` is null until the first load finishes; `failed` means it could not be loaded at all. */
export type ItemsState = { items: Item[] | null; failed: boolean }

let state: ItemsState = { items: null, failed: false }
let started = false
const listeners = new Set<() => void>()

const set = (next: ItemsState) => {
  state = next
  listeners.forEach((l) => l())
}

/** Loads the things again, e.g. after the admin saved a change. */
export async function refreshItems() {
  try {
    set({ items: await backend.loadItems(), failed: false })
  } catch (error) {
    console.error('Не удалось загрузить вещи', error)
    set({ items: state.items ?? [], failed: true })
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!started) {
    started = true
    void refreshItems()
  }
  return () => {
    listeners.delete(listener)
  }
}

/** The shop's things, shared by every component; the first caller starts the load. */
export function useItems() {
  return useSyncExternalStore(subscribe, () => state)
}
