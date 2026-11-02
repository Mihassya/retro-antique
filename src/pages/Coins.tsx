import { PageHead } from '../components/PageHead'
import { CoinAlbum } from '../features/album/CoinAlbum'

export function Coins() {
  return (
    <main className="bg-inside px-4 pt-14 pb-28 md:px-9 md:pt-20 md:pb-36">
      <PageHead title="Монеты">
        Юбилейные рубли СССР в альбоме, как их собирали полвека назад. Монеты смотрим и оцениваем при вас — свои тоже приносите.
      </PageHead>
      <div className="mt-14 md:mt-16">
        <CoinAlbum />
      </div>
    </main>
  )
}
