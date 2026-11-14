import { createClient } from '@supabase/supabase-js'
import type { Category, Item } from '../../data/items'
import type { Backend, Photo } from './types'

type Row = {
  id: string
  name: string
  category: Category
  origin: string
  description: string
  price: number | null
  height_cm: number
  image: string
  image_w: number
  image_h: number
  shelf: number | null
  sold: boolean
  added_at: string
}

const BUCKET = 'items'

const fromRow = (r: Row): Item => ({
  id: r.id,
  name: r.name,
  category: r.category,
  origin: r.origin,
  description: r.description,
  price: r.price,
  heightCm: Number(r.height_cm),
  image: r.image,
  size: [r.image_w, r.image_h],
  alt: r.name,
  shelf: r.shelf,
  sold: r.sold,
  addedAt: r.added_at,
})

const toRow = (i: Item): Row => ({
  id: i.id,
  name: i.name,
  category: i.category,
  origin: i.origin,
  description: i.description ?? '',
  price: i.price,
  height_cm: i.heightCm,
  image: i.image,
  image_w: i.size[0],
  image_h: i.size[1],
  shelf: i.shelf ?? null,
  sold: !!i.sold,
  added_at: i.addedAt,
})

export function supabaseBackend(url: string, anonKey: string): Backend {
  const db = createClient(url, anonKey)
  const storage = db.storage.from(BUCKET)

  /** Path inside the bucket, or null for photos that live elsewhere (the bundled samples). */
  const pathOf = (image: string) => {
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const at = image.indexOf(marker)
    return at === -1 ? null : decodeURIComponent(image.slice(at + marker.length))
  }

  const fail = (error: { message: string } | null) => {
    if (error) throw new Error(error.message)
  }

  return {
    mode: 'supabase',

    async loadItems() {
      const { data, error } = await db.from('items').select('*').order('added_at', { ascending: false })
      fail(error)
      return (data as Row[]).map(fromRow)
    },

    async saveItem(item, photo?: Photo) {
      let next = item
      const oldPath = photo ? pathOf(item.image) : null
      if (photo) {
        // A fresh name per upload, so browsers and the CDN never show the old photo.
        const type = photo.blob.type || 'image/webp'
        const path = `${item.id}-${Date.now().toString(36)}.${type === 'image/png' ? 'png' : 'webp'}`
        const { error } = await storage.upload(path, photo.blob, { contentType: type, cacheControl: '31536000' })
        fail(error)
        next = { ...item, image: storage.getPublicUrl(path).data.publicUrl, size: [photo.width, photo.height] }
      }
      const { data, error } = await db.from('items').upsert(toRow(next)).select().single()
      fail(error)
      if (oldPath) await storage.remove([oldPath])
      return fromRow(data as Row)
    },

    async deleteItem(item) {
      const { error } = await db.from('items').delete().eq('id', item.id)
      fail(error)
      const path = pathOf(item.image)
      if (path) await storage.remove([path])
    },

    async setShelf(category, ids) {
      const { error } = await db.rpc('set_shelf', { shelf_category: category, item_ids: ids.slice(0, 3) })
      fail(error)
    },

    async currentUser() {
      const { data } = await db.auth.getSession()
      return data.session?.user.email ?? null
    },

    onUserChange(listener) {
      const { data } = db.auth.onAuthStateChange((_event, session) => listener(session?.user.email ?? null))
      return () => data.subscription.unsubscribe()
    },

    async signIn(email, password) {
      const { error } = await db.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Неверная почта или пароль' : error.message)
    },

    async signOut() {
      await db.auth.signOut()
    },
  }
}
