import { demoBackend } from './demo'
import { supabaseBackend } from './supabase'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Supabase when the project's keys are set (.env.local, Vercel env), otherwise the in-browser demo. */
export const backend = url && key ? supabaseBackend(url, key) : demoBackend()

export type { Backend, Photo } from './types'
