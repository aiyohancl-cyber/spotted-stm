import { useRef } from 'react'
import { STATIONS, LINE_COLORS, type Station } from '@/data/stations'
import metroMap from '@/assets/metro-map-hd.png'
import { cn } from '@/lib/utils'
import { CalibrationOverlay } from './CalibrationOverlay'

const MAP_W = 1591
const MAP_H = 1620

interface MetroMapProps {
  onStationClick: (station: Station) => void
  selectedStation: Station | null
}

function useCalibrationMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('calibrate')
}

export function MetroMap({ onStationClick, selectedStation }: MetroMapProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const calibrate = useCalibrationMode()

  return (
    <div className="w-full bg-neutral-950 rounded-xl overflow-hidden">
      <div className="text-center text-xs text-white/60 py-2 px-3">
        {calibrate
          ? '🎯 Mode calibration — drag chaque pastille sur sa vraie position'
          : "Touchez n'importe quelle station pour ouvrir son canal"}
      </div>
      <div className="relative w-full">
        <img
          ref={imgRef}
          src={metroMap}
          alt="Carte du métro de Montréal"
          className="block w-full h-auto select-none"
          draggable={false}
        />
        {!calibrate &&
          STATIONS.map((s) => {
            const isTransfer = s.lines.length > 1
            const isSelected = selectedStation?.name === s.name
            const sizePct = isTransfer ? 4.2 : 3.4
            const primaryColor = LINE_COLORS[s.lines[0]]
            return (
              <button
                key={s.name}
                onClick={() => onStationClick(s)}
                type="button"
                className={cn(
                  'absolute rounded-full transition-all duration-150 cursor-pointer',
                  '-translate-x-1/2 -translate-y-1/2',
                  'border-2',
                  isSelected
                    ? 'bg-yellow-300/50 border-yellow-300 shadow-[0_0_0_3px_rgba(253,224,71,0.4)] scale-110'
                    : 'bg-transparent border-white/0 hover:bg-yellow-300/30 hover:border-yellow-300 hover:scale-110'
                )}
                style={{
                  left: `${(s.x / MAP_W) * 100}%`,
                  top: `${(s.y / MAP_H) * 100}%`,
                  width: `${sizePct}%`,
                  aspectRatio: '1',
                  boxShadow: !isSelected
                    ? `inset 0 0 0 1px ${primaryColor}66`
                    : undefined,
                }}
                aria-label={`Station ${s.name}`}
                title={s.name}
              />
            )
          })}

        {calibrate && <CalibrationOverlay imgRef={imgRef} />}
      </div>
    </div>
  )
}
