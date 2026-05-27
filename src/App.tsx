import { useEffect, useState } from 'react'
import { Train } from 'lucide-react'
import { MetroMap } from '@/components/MetroMap'
import { StationChannel } from '@/components/StationChannel'
import { StationSearch } from '@/components/StationSearch'
import { STATIONS, type Station } from '@/data/stations'
import { ensureSignedIn } from '@/lib/supabase'
import './App.css'

function App() {
  const [selected, setSelected] = useState<Station | null>(
    STATIONS.find((s) => s.name === 'Berri-UQAM') ?? null
  )
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    ensureSignedIn().catch((e) => {
      setAuthError(e instanceof Error ? e.message : 'Connexion impossible')
    })
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Train className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-base font-medium leading-tight">STM Spot</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Communauté du métro de Montréal
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              1 247 en ligne
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {authError && (
          <div className="border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-200 rounded-lg px-4 py-2 text-sm">
            Erreur de connexion : {authError}
          </div>
        )}
        <StationSearch onSelect={setSelected} />
        <MetroMap onStationClick={setSelected} selectedStation={selected} />
        {selected ? (
          <StationChannel station={selected} onClose={() => setSelected(null)} />
        ) : (
          <div className="border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            Sélectionnez une station sur la carte pour voir son canal
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4 text-[11px] text-muted-foreground text-center">
          Plateforme communautaire — Les signalements sont partagés par les utilisateurs et n'engagent pas la STM.
        </div>
      </footer>
    </div>
  )
}

export default App
