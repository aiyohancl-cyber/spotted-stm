import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, Info, ArrowUp, ArrowDown, Flag, Check } from 'lucide-react'
import type { Post, PostType } from '@/data/posts'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { votePost, getMyVote, reportPost } from '@/lib/api'

const TYPE_META: Record<PostType, { label: string; icon: typeof Shield; classes: string }> = {
  inspector: {
    label: 'Inspecteur',
    icon: Shield,
    classes: 'bg-red-50 text-red-900 border-red-100 dark:bg-red-950 dark:text-red-200 dark:border-red-900',
  },
  incident: {
    label: 'Incident',
    icon: AlertTriangle,
    classes: 'bg-amber-50 text-amber-900 border-amber-100 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900',
  },
  info: {
    label: 'Info',
    icon: Info,
    classes: 'bg-blue-50 text-blue-900 border-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900',
  },
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [up, setUp] = useState(post.upvotes)
  const [down, setDown] = useState(post.downvotes)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [reported, setReported] = useState(false)
  const meta = TYPE_META[post.type]
  const Icon = meta.icon
  const credibility = up + down === 0 ? null : Math.round((up / (up + down)) * 100)
  const credColor =
    credibility === null ? 'text-muted-foreground' :
    credibility >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
    credibility >= 60 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400'

  useEffect(() => {
    setUp(post.upvotes)
    setDown(post.downvotes)
    let cancelled = false
    getMyVote(post.id)
      .then((v) => {
        if (cancelled) return
        setVote(v === 1 ? 'up' : v === -1 ? 'down' : null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [post.id, post.upvotes, post.downvotes])

  const handleVote = async (dir: 'up' | 'down') => {
    const previous = vote
    if (vote === dir) {
      setVote(null)
      if (dir === 'up') setUp((n) => Math.max(0, n - 1))
      else setDown((n) => Math.max(0, n - 1))
      try {
        await votePost(post.id, 0)
      } catch {
        setVote(previous)
        if (dir === 'up') setUp((n) => n + 1)
        else setDown((n) => n + 1)
      }
      return
    }

    if (dir === 'up') {
      setUp((n) => n + 1)
      if (vote === 'down') setDown((n) => Math.max(0, n - 1))
    } else {
      setDown((n) => n + 1)
      if (vote === 'up') setUp((n) => Math.max(0, n - 1))
    }
    setVote(dir)
    try {
      await votePost(post.id, dir === 'up' ? 1 : -1)
    } catch {
      setVote(previous)
      setUp(post.upvotes)
      setDown(post.downvotes)
    }
  }

  const handleReport = async () => {
    if (reported) return
    setReported(true)
    try {
      await reportPost(post.id)
    } catch {
      setReported(false)
    }
  }

  return (
    <div className="px-4 py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-[10px] font-medium">{post.avatar}</AvatarFallback>
          </Avatar>
          {post.author}
        </div>
        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
      </div>
      <Badge variant="outline" className={cn('mb-2 gap-1 border', meta.classes)}>
        <Icon className="w-3 h-3" />
        {meta.label}
      </Badge>
      <p className="text-sm leading-relaxed mb-2">{post.body}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('up')}
          className={cn(
            'h-7 rounded-full text-xs gap-1.5 px-3',
            vote === 'up' && 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
          )}
        >
          <ArrowUp className="w-3 h-3" />
          {up}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('down')}
          className={cn(
            'h-7 rounded-full text-xs gap-1.5 px-3',
            vote === 'down' && 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
          )}
        >
          <ArrowDown className="w-3 h-3" />
          {down}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReport}
          disabled={reported}
          className="h-7 rounded-full text-xs gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          aria-label="Signaler"
        >
          {reported ? <Check className="w-3 h-3" /> : <Flag className="w-3 h-3" />}
          {reported ? 'Signalé' : 'Signaler'}
        </Button>
        {credibility !== null && (
          <span className={cn('text-xs ml-auto', credColor)}>{credibility}% crédible</span>
        )}
      </div>
    </div>
  )
}
