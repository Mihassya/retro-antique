export type Note = {
  id: string
  value: string
  issuer: string
  /** What is printed on it, in a few words. */
  design: string
  front: string
  /** Missing when the shop has no photo of the back yet. */
  back?: string
  condition: string
  price: number | null
}

export type NotePage = {
  id: string
  title: string
  notes: Note[]
}

const img = (name: string) => `/images/notes/${name}.webp`
const treasury = 'Государственный казначейский билет'
const stateBank = 'Билет Государственного банка СССР'

// Sample stock: the photos are museum specimens («ОБРАЗЕЦ»); conditions and prices must be confirmed by the shop.
export const notePages: NotePage[] = [
  {
    id: 'treasury',
    title: 'Казначейские билеты',
    notes: [
      { id: 'n1', value: '1 рубль', issuer: treasury, design: 'Герб СССР, номинал на 15 языках', front: img('1-front'), back: img('1-back'), condition: 'aUNC, почти новая', price: 1500 },
      { id: 'n3', value: '3 рубля', issuer: treasury, design: 'Герб СССР, на обороте Кремль', front: img('3-front'), back: img('3-back'), condition: 'XF, отличная', price: 1500 },
      { id: 'n5', value: '5 рублей', issuer: treasury, design: 'Спасская башня Кремля', front: img('5-front'), back: img('5-back'), condition: 'VF, очень хорошая', price: 2000 },
    ],
  },
  {
    id: 'state-bank',
    title: 'Билеты Госбанка',
    notes: [
      { id: 'n10', value: '10 рублей', issuer: stateBank, design: 'Портрет В. И. Ленина', front: img('10-front'), condition: 'XF, отличная', price: 2500 },
      { id: 'n25', value: '25 рублей', issuer: stateBank, design: 'Портрет В. И. Ленина', front: img('25-front'), condition: 'VF, очень хорошая', price: 3000 },
      { id: 'n50', value: '50 рублей', issuer: stateBank, design: 'Портрет В. И. Ленина', front: img('50-front'), condition: 'XF, отличная', price: 6000 },
      { id: 'n100', value: '100 рублей', issuer: stateBank, design: 'Портрет В. И. Ленина', front: img('100-front'), condition: 'VF, очень хорошая', price: 9000 },
    ],
  },
]
