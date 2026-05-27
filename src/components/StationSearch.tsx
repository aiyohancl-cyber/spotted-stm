import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { STATIONS, LINE_COLORS, LINE_NAMES, type Station } from '@/data/stations'

interface StationSearchProps {
  onSelect: (station: Station) => void
}

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function StationSearch({ onSelect }: StationSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (q.length === 0) return [] as Station[]
    return STATIONS.filter((s) => normalize(s.name).includes(q))
      .sort((a, b) => {
        // Prefer matches at the start of the name
        const ai = normalize(a.name).indexOf(q)
        const bi = normalize(b.name).indexOf(q)
        if (ai !== bi) return ai - bi
        return a.name.localeCompare(b.name)
      })
      .slice(0, 8)
  }, [query])

  useEffect(() => {
    setHighlight(0)
  }, [query])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleSelect = (s: Station) => {
    onSelect(s)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault()
      handleSelect(results[highlight])
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Chercher une station…"
          className="w-full pl-9 pr-9 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400"
          aria-label="Rechercher une station"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded"
            aria-label="Effacer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
          {results.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setHighlight(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                i === highlight ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              <div className="inline-flex gap-1 shrink-0">
                {s.lines.map((l) => (
                  <span
                    key={l}
                    className="w-2 h-2 rounded-full"
                    style={{ background: LINE_COLORS[l] }}
                    aria-label={`Ligne ${LINE_NAMES[l]}`}
                  />
                ))}
              </div>
              <span className="flex-1">{s.name}</span>
              <span className="text-xs text-muted-foreground">
                {s.lines.map((l) => LINE_NAMES[l]).join(' · ')}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 px-3 py-2 text-sm text-muted-foreground">
          Aucune station ne correspond à « {query.trim()} »
        </div>
      )}
    </div>
  )
}
