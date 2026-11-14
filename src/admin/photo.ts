import type { Photo } from '../lib/backend'

/** Phone photos are 12+ MP; the cut-out model and the shelf need far less. */
const MAX_INPUT_SIDE = 1600
/** The shelf shows things at most ~330 px tall; twice that is plenty for sharp screens. */
const MAX_OUTPUT_SIDE = 900
/** Alpha below this counts as background when trimming the cut-out to the object. */
const ALPHA_THRESHOLD = 12

function canvasOf(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Браузер не умеет обрабатывать фото')
  return { canvas, ctx }
}

const scaleToFit = (w: number, h: number, max: number) => Math.min(1, max / Math.max(w, h))

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Не удалось сохранить фото'))), type, quality),
  )
}

/** Smallest box around everything that isn't transparent, with a little air around it. */
function opaqueBounds(data: ImageData) {
  const { width, height } = data
  let top = height, left = width, right = -1, bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data.data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }
  if (right < 0) return null
  const pad = Math.round(Math.max(right - left, bottom - top) * 0.02)
  return {
    x: Math.max(0, left - pad),
    y: Math.max(0, top - pad),
    w: Math.min(width, right + pad + 1) - Math.max(0, left - pad),
    h: Math.min(height, bottom + pad + 1) - Math.max(0, top - pad),
  }
}

export type Progress = (message: string) => void

/**
 * Turns a photo from the phone into a shelf picture: removes the background (in this browser, nothing
 * is uploaded for that), trims to the object and saves a small WebP. With `keepBackground` it only
 * shrinks and re-encodes the photo as it is.
 */
export async function preparePhoto(file: Blob, { keepBackground = false, onProgress }: { keepBackground?: boolean; onProgress?: Progress } = {}): Promise<Photo> {
  onProgress?.('Читаем фото…')
  const original = await createImageBitmap(file)
  const k = scaleToFit(original.width, original.height, MAX_INPUT_SIDE)
  const input = canvasOf(Math.round(original.width * k), Math.round(original.height * k))
  input.ctx.drawImage(original, 0, 0, input.canvas.width, input.canvas.height)
  original.close()

  let source: CanvasImageSource = input.canvas
  let bounds = { x: 0, y: 0, w: input.canvas.width, h: input.canvas.height }

  if (!keepBackground) {
    onProgress?.('Убираем фон…')
    const { removeBackground } = await import('@imgly/background-removal')
    const cut = await removeBackground(await toBlob(input.canvas, 'image/png'), {
      model: 'isnet_fp16',
      output: { format: 'image/png' },
      progress: (key, current, total) => {
        if (key.startsWith('fetch') && total > 0) {
          onProgress?.(`Первый раз загружаем помощника для фона… ${Math.round((current / total) * 100)}%`)
        } else {
          onProgress?.('Убираем фон…')
        }
      },
    })
    const cutBitmap = await createImageBitmap(cut)
    const work = canvasOf(cutBitmap.width, cutBitmap.height)
    work.ctx.drawImage(cutBitmap, 0, 0)
    cutBitmap.close()
    const found = opaqueBounds(work.ctx.getImageData(0, 0, work.canvas.width, work.canvas.height))
    if (!found) throw new Error('На фото не нашлось предмета. Снимите его крупнее, на однотонном фоне')
    source = work.canvas
    bounds = found
  }

  onProgress?.('Сохраняем…')
  const s = scaleToFit(bounds.w, bounds.h, MAX_OUTPUT_SIDE)
  const out = canvasOf(Math.round(bounds.w * s), Math.round(bounds.h * s))
  out.ctx.drawImage(source, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, out.canvas.width, out.canvas.height)
  // Older Safari can't encode WebP and hands back PNG instead: that's fine, the upload keeps the real type.
  const blob = await toBlob(out.canvas, 'image/webp', 0.86)
  return { blob, width: out.canvas.width, height: out.canvas.height }
}
