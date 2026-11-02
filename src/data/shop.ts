/** Shop contacts. The WhatsApp number is hidden on 2GIS: fill it in before launch (digits only, 7XXXXXXXXXX). */
export const shop = {
  whatsapp: null as string | null,
  city: 'Усть-Каменогорск',
  address: 'ул. Казахстан, 77',
  hours: '10:00–18:00',
}

/** A wa.me link with the message already typed. Without a number WhatsApp asks whom to send it to. */
export function whatsappLink(text: string) {
  const base = shop.whatsapp ? `https://wa.me/${shop.whatsapp}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

export function formatPrice(price: number | null) {
  return price === null ? 'по запросу' : `${price.toLocaleString('ru-RU')} ₸`
}
