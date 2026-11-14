// Vercel Cron calls this once a day (vercel.json): a free Supabase project pauses after a week
// without requests, and one tiny read is enough to keep it awake.
export async function GET() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return new Response('Supabase is not configured', { status: 200 })

  const res = await fetch(`${url}/rest/v1/items?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  return new Response(res.ok ? 'ok' : `Supabase answered ${res.status}`, { status: res.ok ? 200 : 502 })
}
