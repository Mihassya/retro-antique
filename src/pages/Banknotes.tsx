import { PageHead } from '../components/PageHead'
import { NoteAlbum } from '../features/album/NoteAlbum'

export function Banknotes() {
  return (
    <main className="bg-inside px-4 pt-14 pb-28 md:px-9 md:pt-20 md:pb-36">
      <PageHead title="Банкноты">
        Бумажные деньги СССР в листах с кармашками. Каждую можно достать, рассмотреть с двух сторон и спросить о цене.
      </PageHead>
      <div className="mt-14 md:mt-16">
        <NoteAlbum />
      </div>
    </main>
  )
}
