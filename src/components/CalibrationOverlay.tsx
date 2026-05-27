import { useEffect, useRef, useState } from 'react'
import { STATIONS, LINE_COLORS, type Station } from '@/data/stations'
import { Copy, Check, RotateCcw, Download, X } from 'lucide-react'

const MAP_W = 1591
const MAP_H = 1620

interface CalibrationOverlayProps {
  imgRef: React.RefObject<HTMLImageElement | null>
}

export function CalibrationOverlay({ imgRef }: CalibrationOverlayProps) {
  const [positions, setPositions] = useState(() =>
    STATIONS.map((s) => ({ ...s }))
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [exportText, setExportText] = useState<string | null>(null)
  const exportTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const offsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })

  const screenToImage = (clientX: number, clientY: number) => {
    const img = imgRef.current
    if (!img) return null
    const r = img.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * MAP_W
    const py = ((clientY - r.top) / r.height) * MAP_H
    return { x: Math.round(px), y: Math.round(py) }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, station: Station) => {
    e.preventDefault()
    e.stopPropagation()
    const img = imgRef.current
    if (!img) return
    const r = img.getBoundingClientRect()
    const screenX = r.left + (station.x / MAP_W) * r.width
    const screenY = r.top + (station.y / MAP_H) * r.height
    offsetRef.current = { dx: e.clientX - screenX, dy: e.clientY - screenY }
    setDraggingId(station.id)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId) return
    const pos = screenToImage(e.clientX - offsetRef.current.dx, e.clientY - offsetRef.current.dy)
    if (!pos) return
    setPositions((prev) =>
      prev.map((s) => (s.id === draggingId ? { ...s, x: pos.x, y: pos.y } : s))
    )
  }

  const onPointerUp = () => {
    setDraggingId(null)
  }

  useEffect(() => {
    if (!draggingId) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDraggingId(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [draggingId])

  const buildExportText = () => {
    const lines: string[] = []
    for (const s of positions) {
      const linesStr = s.lines.join(',')
      const nameEscaped = s.name.includes("'") ? `"${s.name}"` : `'${s.name}'`
      lines.push(`  [${nameEscaped}, ${s.x}, ${s.y}, '${linesStr}'],`)
    }
    return lines.join('\n')
  }

  const exportCoords = async () => {
    const text = buildExportText()
    setExportText(text)
    // Best-effort clipboard copy (silently ignore failure — the textarea is the real path)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked, the user will copy from the textarea
    }
    // Focus + select textarea after it renders
    setTimeout(() => {
      const ta = exportTextareaRef.current
      if (ta) {
        ta.focus()
        ta.select()
      }
    }, 50)
  }

  const downloadCoords = () => {
    const text = exportText ?? buildExportText()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stations-coords.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetAll = () => {
    if (!confirm('Réinitialiser toutes les positions aux valeurs actuelles du fichier ?')) return
    setPositions(STATIONS.map((s) => ({ ...s })))
  }

  return (
    <>
      <div
        className="absolute inset-0 z-30"
        style={{ pointerEvents: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {positions.map((s) => {
          const primary = LINE_COLORS[s.lines[0]]
          const isDragging = draggingId === s.id
          return (
            <div
              key={s.id}
              style={{
                position: 'absolute',
                left: `${(s.x / MAP_W) * 100}%`,
                top: `${(s.y / MAP_H) * 100}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: isDragging ? 50 : 30,
              }}
              onPointerDown={(e) => onPointerDown(e, s)}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: primary,
                  border: isDragging ? '2px solid yellow' : '2px solid white',
                  boxShadow: isDragging
                    ? '0 0 0 4px rgba(253,224,71,0.5)'
                    : '0 0 0 1px rgba(0,0,0,0.6)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 18,
                  transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.85)',
                  color: 'white',
                  padding: '2px 6px',
                  fontSize: 10,
                  fontFamily: 'system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  borderRadius: 3,
                  pointerEvents: 'none',
                  opacity: isDragging ? 1 : 0.7,
                }}
              >
                {s.name}
                {isDragging && (
                  <span style={{ marginLeft: 6, opacity: 0.7 }}>
                    ({s.x}, {s.y})
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating control panel */}
      <div
        className="fixed bottom-4 right-4 z-50 bg-black/90 text-white rounded-lg shadow-2xl p-3 flex flex-col gap-2"
        style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12 }}
      >
        <div className="font-medium text-yellow-300">🎯 Mode calibration</div>
        <div className="text-white/70 text-[11px] leading-snug max-w-[260px]">
          Drag chaque pastille sur la vraie position de la station. Le label
          montre le nom + coord pendant le drag. Appuie Échap pour annuler un
          drag.
        </div>
        <button
          onClick={exportCoords}
          className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-black rounded font-medium hover:bg-yellow-300"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié !' : 'Copier les nouvelles coords'}
        </button>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Réinitialiser
        </button>
        <a
          href={window.location.pathname}
          className="text-center text-white/60 hover:text-white text-[11px]"
        >
          Quitter le mode calibration →
        </a>
      </div>

      {/* Export modal — textarea the user can select + copy manually */}
      {exportText !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setExportText(null)}
        >
          <div
            className="bg-neutral-900 text-white rounded-lg shadow-2xl p-4 w-full max-w-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium text-yellow-300 text-sm">
                Tes 68 stations recalibrées
              </div>
              <button
                onClick={() => setExportText(null)}
                className="text-white/60 hover:text-white"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[11px] text-white/70 leading-snug">
              Si le presse-papier marche : « <strong>Copié !</strong> » s'affiche
              déjà sur le bouton. Sinon : clique dans la zone ci-dessous, fais
              <strong> Cmd+A</strong> puis <strong>Cmd+C</strong>, et colle dans
              ta réponse à Claude. Tu peux aussi télécharger en fichier .txt.
            </div>
            <textarea
              ref={exportTextareaRef}
              value={exportText}
              readOnly
              className="w-full h-72 bg-black text-green-300 font-mono text-[11px] p-2 rounded border border-white/10 resize-y"
              spellCheck={false}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={downloadCoords}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded hover:bg-white/20 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger .txt
              </button>
              <button
                onClick={() => {
                  const ta = exportTextareaRef.current
                  if (ta) {
                    ta.focus()
                    ta.select()
                    try {
                      document.execCommand('copy')
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    } catch {
                      // ignore
                    }
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-black rounded hover:bg-yellow-300 text-xs font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié !' : 'Sélectionner + copier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
