import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, Info, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { PostType } from '@/data/posts'
import { getMyPseudo } from '@/lib/api'

interface PostComposerProps {
  stationName: string
  onSubmit: (type: PostType, body: string) => void
}

const TYPES: { id: PostType; label: string; icon: typeof Shield; activeClasses: string }[] = [
  { id: 'info', label: 'Info', icon: Info,
    activeClasses: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-transparent' },
  { id: 'inspector', label: 'Inspecteur', icon: Shield,
    activeClasses: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 border-transparent' },
  { id: 'incident', label: 'Incident', icon: AlertTriangle,
    activeClasses: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-transparent' },
]

export function PostComposer({ stationName, onSubmit }: PostComposerProps) {
  const [type, setType] = useState<PostType>('info')
  const [body, setBody] = useState('')
  const [pseudo, setPseudo] = useState<string>('…')

  useEffect(() => {
    let cancelled = false
    getMyPseudo()
      .then((p) => {
        if (!cancelled) setPseudo(p.author)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const handlePost = () => {
    if (!body.trim()) return
    onSubmit(type, body.trim())
    setBody('')
    setType('info')
  }

  return (
    <div className="px-4 py-4 bg-muted/40 border-t border-border">
      <div className="flex gap-1.5 mb-2.5 flex-wrap">
        {TYPES.map(({ id, label, icon: Icon, activeClasses }) => (
          <button
            key={id}
            onClick={() => setType(id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-colors',
              type === id ? activeClasses : 'bg-background border-border text-muted-foreground hover:bg-accent'
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Partagez ce que vous voyez à ${stationName}...`}
        className="min-h-[60px] resize-y text-sm"
      />
      <div className="flex justify-between items-center mt-2.5 gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <EyeOff className="w-3 h-3" />
          Posté anonymement comme {pseudo}
        </span>
        <Button size="sm" onClick={handlePost} disabled={!body.trim()}>
          Publier
        </Button>
      </div>
    </div>
  )
}
