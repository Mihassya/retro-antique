import { Shelves } from '../components/Shelves'
import { Sideboard } from '../components/Sideboard'
import { Trade } from '../components/Trade'

export function Home() {
  return (
    <main>
      <Sideboard />
      <Shelves />
      <Trade />
    </main>
  )
}
