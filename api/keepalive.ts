// Vercel Cron calls this once a day (vercel.json): a free Supabase project pauses after a week
// without requests, and one tiny read is enough to keep it awake. Same public defaults as the site.
const SHOP_URL = 'https://zeyjprurdpsaghytmghk.supabase.co'
const SHOP_KEY = 'sb_publishable_Sg3ROiSxhzKhBBEOCve9vQ_EVysnEK9'

export async function GET() {
  const url = process.env.VITE_SUPABASE_URL || SHOP_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SHOP_KEY

  const res = await fetch(`${url}/rest/v1/items?select=id&limit=1`, {
    headers: { apikey: key },
  })
  return new Response(res.ok ? 'ok' : `Supabase answered ${res.status}`, { status: res.ok ? 200 : 502 })
}
