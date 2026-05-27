import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase, ensureSignedIn } from './supabase'
import type { Post, PostType } from '@/data/posts'

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface DbPost {
  id: string
  station_id: string
  user_id: string
  type: PostType
  content: string
  created_at: string
  expires_at: string | null
  reported_count: number
  hidden: boolean
}

interface DbCredibility {
  post_id: string
  upvotes: number
  downvotes: number
}

export function pseudoFromUserId(userId: string): { author: string; avatar: string } {
  const short = userId.replace(/-/g, '').slice(0, 6)
  return {
    author: `@rider_${short}`,
    avatar: short.slice(0, 2).toUpperCase(),
  }
}

export async function getMyPseudo(): Promise<{ author: string; avatar: string }> {
  const userId = await ensureSignedIn()
  return pseudoFromUserId(userId)
}

function dbToUi(
  db: DbPost,
  stationName: string,
  credibility: Map<string, DbCredibility>
): Post {
  const cred = credibility.get(db.id)
  const { author, avatar } = pseudoFromUserId(db.user_id)
  return {
    id: db.id,
    stationName,
    type: db.type,
    body: db.content,
    author,
    avatar,
    timeAgo: formatDistanceToNow(new Date(db.created_at), { locale: fr, addSuffix: false }),
    upvotes: cred?.upvotes ?? 0,
    downvotes: cred?.downvotes ?? 0,
  }
}

export async function listPosts(stationId: string, stationName: string): Promise<Post[]> {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('station_id', stationId)
    .eq('hidden', false)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  if (!posts || posts.length === 0) return []

  const ids = posts.map((p) => p.id)
  const { data: cred, error: credErr } = await supabase
    .from('post_credibility')
    .select('post_id, upvotes, downvotes')
    .in('post_id', ids)
  if (credErr) throw credErr

  const credMap = new Map<string, DbCredibility>((cred ?? []).map((c) => [c.post_id, c]))
  return (posts as DbPost[]).map((p) => dbToUi(p, stationName, credMap))
}

export async function createPost(args: {
  stationId: string
  stationName: string
  type: PostType
  content: string
}): Promise<Post> {
  const userId = await ensureSignedIn()
  const { data, error } = await supabase
    .from('posts')
    .insert({
      station_id: args.stationId,
      user_id: userId,
      type: args.type,
      content: args.content,
    })
    .select()
    .single()
  if (error) throw error
  return dbToUi(data as DbPost, args.stationName, new Map())
}

export async function votePost(postId: string, value: 1 | -1 | 0): Promise<void> {
  const userId = await ensureSignedIn()
  if (value === 0) {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) throw error
    return
  }
  const { error } = await supabase
    .from('votes')
    .upsert({ post_id: postId, user_id: userId, value }, { onConflict: 'post_id,user_id' })
  if (error) throw error
}

export async function getMyVote(postId: string): Promise<1 | -1 | null> {
  const userId = await ensureSignedIn()
  const { data, error } = await supabase
    .from('votes')
    .select('value')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return (data?.value ?? null) as 1 | -1 | null
}

export async function reportPost(postId: string, reason?: string): Promise<void> {
  const userId = await ensureSignedIn()
  const { error } = await supabase
    .from('reports')
    .insert({ post_id: postId, user_id: userId, reason: reason ?? null })
  if (error && error.code !== '23505') throw error
}

export function subscribeToStation(
  stationId: string,
  onChange: () => void
): () => void {
  const channel = supabase
    .channel(`station:${stationId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts', filter: `station_id=eq.${stationId}` },
      onChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'votes' },
      onChange
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

export async function countPostsToday(stationId: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('station_id', stationId)
    .eq('hidden', false)
    .gte('created_at', startOfDay.toISOString())
  if (error) throw error
  return count ?? 0
}
