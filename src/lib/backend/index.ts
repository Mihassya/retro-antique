import { demoBackend } from './demo'
import { supabaseBackend } from './supabase'

/*
 * The shop's Supabase project. Both values are public by design: the publishable key ends up in every
 * visitor's browser anyway, and row-level security in the database decides who may write. Keeping them
 * here means a deploy never depends on environment variables being set; VITE_SUPABASE_URL and
 * VITE_SUPABASE_PUBLISHABLE_KEY still override them (another project, a local copy). Set
 * VITE_SUPABASE_URL to "demo" to run the in-browser demo instead.
 */
const SHOP_URL = 'https://zeyjprurdpsaghytmghk.supabase.co'
const SHOP_KEY = 'sb_publishable_Sg3ROiSxhzKhBBEOCve9vQ_EVysnEK9'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || SHOP_URL
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || SHOP_KEY

export const backend = url === 'demo' ? demoBackend() : supabaseBackend(url, key)

export type { Backend, Photo } from './types'
