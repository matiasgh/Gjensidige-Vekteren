export const EXAMPLE_DAMAGE_IMAGE = '/images/eksempel-bulk.svg'

/** Browser-only: decodes an image file or URL and returns a JPEG data URL no larger than `maxSize` on its longest side. */
export async function imageToDataUrl(source: Blob | string, maxSize = 800): Promise<string> {
  if (typeof source !== 'string' && !source.type.startsWith('image/')) throw new Error('Velg et bilde av skaden (for eksempel JPG eller PNG).')
  const url = typeof source === 'string' ? source : URL.createObjectURL(source)
  try {
    const image = new Image()
    image.src = url
    try {
      await image.decode()
    } catch {
      throw new Error('Kunne ikke lese bildet. Prøv et annet bilde (JPG eller PNG).')
    }
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Kunne ikke behandle bildet i denne nettleseren.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.8)
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(url)
  }
}
