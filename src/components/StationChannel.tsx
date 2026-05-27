import { useEffect, useState } from 'react'
import { MessageCircle, Flame, X, Loader2 } from 'lucide-react'
import type { Station } from '@/data/stations'
import { LINE_COLORS, LINE_NAMES } from '@/data/stations'
import type { Post, PostType } from '@/data/posts'
import { listPosts, createPost, subscribeToStation, countPostsToday } from '@/lib/api'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

type Heat = 'low' | 'normal' | 'moderate' | 'high'

const HEAT_LABEL: Record<Heat, string> = {
  low: 'Activité faible',
  normal: 'Activité normale',
  moderate: 'Activité modérée',
  high: 'Activité élevée',
}

function heatFromPostsToday(count: number): Heat {
  if (count === 0) return 'low'
  if (count <= 2) return 'normal'
  if (count <= 5) return 'moderate'
  return 'high'
}

interface StationChannelProps {
  station: Station
  onClose?: () => void
}

export function StationChannel({ station, onClose }: StationChannelProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [postsToday, setPostsToday] = useState<number>(0)
  const heat = heatFromPostsToday(postsToday)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [postsList, todayCount] = await Promise.all([
          listPosts(station.id, station.name),
          countPostsToday(station.id),
        ])
        if (!cancelled) {
          setPosts(postsList)
          setPostsToday(todayCount)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erreur de chargement')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const unsubscribe = subscribeToStation(station.id, load)

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [station.id, station.name])

  const handleNewPost = async (type: PostType, body: string) => {
    try {
      const newPost = await createPost({
        stationId: station.id,
        stationName: station.name,
        type,
        content: body,
      })
      setPosts((prev) => [newPost, ...prev])
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la publication'
      setError(message)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex gap-1">
            {station.lines.map((l) => (
              <span
                key={l}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: LINE_COLORS[l] }}
                aria-label={`Ligne ${LINE_NAMES[l]}`}
              />
            ))}
          </div>
          <h2 className="text-lg font-medium m-0">{station.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {station.lines.map((l) => LINE_NAMES[l]).join(' • ')}
          </span>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Fermer">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex gap-4 px-4 py-2 bg-muted/50 border-b border-border text-xs text-muted-foreground flex-wrap">
        <div className="inline-flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{postsToday} post{postsToday === 1 ? '' : 's'} aujourd'hui</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" />
          <span>{HEAT_LABEL[heat]}</span>
        </div>
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-200 text-xs border-b border-red-200 dark:border-red-900">
          {error}
        </div>
      )}
      <ScrollArea className="max-h-[420px]">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement…
          </div>
        ) : posts.length > 0 ? (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucun post pour cette station. Soyez le premier à partager une info.
          </div>
        )}
      </ScrollArea>
      <PostComposer stationName={station.name} onSubmit={handleNewPost} />
    </div>
  )
}
