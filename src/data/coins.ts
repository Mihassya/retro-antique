export type Coin = {
  id: string
  denomination: string
  year: number
  title: string
  obverse: string
  reverse: string
  /** Shown only where a source gives it. */
  mintage?: string
  condition: string
  price: number | null
}

export type CoinPage = {
  id: string
  title: string
  note: string
  coins: Coin[]
}

const img = (name: string) => `/images/coins/${name}.webp`

/** Every Soviet commemorative ruble is copper-nickel, 31 mm. */
export const rubleSpec = { metal: 'медно-никелевый сплав', diameter: '31 мм' }

// Sample stock: conditions and prices must be confirmed by the shop.
export const coinPages: CoinPage[] = [
  {
    id: 'jubilee',
    title: 'Юбилейные рубли СССР',
    note: '1965–1984',
    coins: [
      { id: 'r1965', denomination: '1 рубль', year: 1965, title: '20 лет Победы над фашистской Германией', obverse: img('obv-1965'), reverse: img('rev-1965'), mintage: '60 млн', condition: 'XF, отличная', price: 3500 },
      { id: 'r1967', denomination: '1 рубль', year: 1967, title: '50 лет Советской власти', obverse: img('obv-1967'), reverse: img('rev-1967'), condition: 'VF, очень хорошая', price: 2500 },
      { id: 'r1970', denomination: '1 рубль', year: 1970, title: '100 лет со дня рождения В. И. Ленина', obverse: img('obv-1970'), reverse: img('rev-1970'), condition: 'XF, отличная', price: 2000 },
      { id: 'r1975', denomination: '1 рубль', year: 1975, title: '30 лет Победы в Великой Отечественной войне', obverse: img('obv-comm75'), reverse: img('rev-1975'), condition: 'UNC, без обращения', price: 3000 },
      { id: 'r1977', denomination: '1 рубль', year: 1977, title: '60 лет Советской власти', obverse: img('obv-comm75'), reverse: img('rev-1977'), condition: 'XF, отличная', price: 2500 },
      { id: 'r1981', denomination: '1 рубль', year: 1981, title: '20 лет первого полёта человека в космос', obverse: img('obv-comm75'), reverse: img('rev-1981'), condition: 'UNC, без обращения', price: 4500 },
      { id: 'r1983', denomination: '1 рубль', year: 1983, title: '20 лет полёта первой женщины-космонавта', obverse: img('obv-comm83'), reverse: img('rev-1983'), condition: 'XF, отличная', price: 4000 },
      { id: 'r1984', denomination: '1 рубль', year: 1984, title: '185 лет со дня рождения А. С. Пушкина', obverse: img('obv-comm83'), reverse: img('rev-1984'), condition: 'UNC, без обращения', price: 3000 },
    ],
  },
  {
    id: 'olympics',
    title: 'Игры XXII Олимпиады',
    note: 'Москва, 1977–1980',
    coins: [
      { id: 'o1977', denomination: '1 рубль', year: 1977, title: 'Эмблема Олимпиады', obverse: img('obv-olymp'), reverse: img('rev-o1977'), condition: 'UNC, без обращения', price: 2500 },
      { id: 'o1978', denomination: '1 рубль', year: 1978, title: 'Московский Кремль', obverse: img('obv-olymp'), reverse: img('rev-o1978'), condition: 'XF, отличная', price: 2500 },
      { id: 'o1979c', denomination: '1 рубль', year: 1979, title: 'Монумент покорителям космоса', obverse: img('obv-olymp'), reverse: img('rev-o1979c'), condition: 'XF, отличная', price: 2500 },
      { id: 'o1979u', denomination: '1 рубль', year: 1979, title: 'Московский университет', obverse: img('obv-olymp'), reverse: img('rev-o1979u'), condition: 'UNC, без обращения', price: 2500 },
      { id: 'o1980m', denomination: '1 рубль', year: 1980, title: 'Памятник Юрию Долгорукому', obverse: img('obv-olymp'), reverse: img('rev-o1980m'), condition: 'XF, отличная', price: 2500 },
      { id: 'o1980t', denomination: '1 рубль', year: 1980, title: 'Олимпийский факел', obverse: img('obv-olymp'), reverse: img('rev-o1980t'), condition: 'UNC, без обращения', price: 3000 },
    ],
  },
]
