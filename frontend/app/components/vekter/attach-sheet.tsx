import { useRef, useState, type ReactNode } from 'react'
import { Camera, FileText, Image as ImageIcon, LoaderCircle, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/components/ui/dialog'
import { EXAMPLE_DAMAGE_IMAGE, imageToDataUrl } from '~/lib/image'

function SheetOption({ icon, title, description, onClick, disabled }: { icon: ReactNode; title: string; description: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex w-full items-center gap-4 rounded-xl px-1 py-3 text-left outline-none transition-colors hover:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50">
    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary [&_svg]:size-5">{icon}</span>
    <span><span className="block font-bold">{title}</span><span className="block text-sm text-muted-foreground">{description}</span></span>
  </button>
}

/** Bottom sheet for attaching a photo. Returns a downscaled JPEG data URL; files never leave the browser. */
export function AttachSheet({ open, onOpenChange, onImage }: { open: boolean; onOpenChange: (open: boolean) => void; onImage: (dataUrl: string) => void }) {
  const camera = useRef<HTMLInputElement>(null)
  const library = useRef<HTMLInputElement>(null)
  const files = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function use(source: Blob | string) {
    setBusy(true)
    setError('')
    try {
      const dataUrl = await imageToDataUrl(source)
      onOpenChange(false)
      onImage(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke lese bildet.')
    } finally {
      setBusy(false)
    }
  }

  const input = (ref: typeof camera, label: string, extra: Record<string, string> = {}) => <input ref={ref} type="file" accept="image/*" aria-label={label} className="sr-only" tabIndex={-1} {...extra} onChange={(event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void use(file)
  }} />

  return <Dialog open={open} onOpenChange={(next) => { if (!busy) { setError(''); onOpenChange(next) } }}>
    <DialogContent className="vekter-theme top-auto bottom-0 max-w-none translate-y-0 gap-2 rounded-t-3xl rounded-b-none border-x-0 border-b-0 bg-[#1a1f5c] px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:max-w-md sm:bottom-6 sm:rounded-3xl sm:border-x sm:border-b">
      <span aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/50" />
      <DialogTitle className="font-display text-xl">Legg ved</DialogTitle>
      <DialogDescription className="sr-only">Velg et bilde av skaden. Bildet blir værende i nettleseren din.</DialogDescription>
      {input(camera, 'Ta bilde med kamera', { capture: 'environment' })}
      {input(library, 'Velg bilde fra biblioteket')}
      {input(files, 'Velg bildefil')}
      <div className="mt-1">
        <SheetOption icon={<Camera />} title="Ta bilde" description="Åpne kamera" disabled={busy} onClick={() => camera.current?.click()} />
        <SheetOption icon={<ImageIcon />} title="Velg fra bilder" description="Fra biblioteket" disabled={busy} onClick={() => library.current?.click()} />
        <SheetOption icon={<FileText />} title="Velg fil" description="Fra Filer, for eksempel skademelding" disabled={busy} onClick={() => files.current?.click()} />
        <SheetOption icon={<Sparkles />} title="Bruk eksempelbilde" description="Bulk i bildøren, for demo" disabled={busy} onClick={() => void use(EXAMPLE_DAMAGE_IMAGE)} />
      </div>
      {busy && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Gjør klar bildet …</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <p className="text-xs leading-5 text-muted-foreground">Bildet lagres bare i denne nettleseren og sendes ikke til AI-tjenesten.</p>
    </DialogContent>
  </Dialog>
}
