import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Variables Supabase manquantes. Copie .env.example vers .env.local et remplis VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase: SupabaseClient = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 5 },
  },
})

let signInPromise: Promise<string> | null = null

export function ensureSignedIn(): Promise<string> {
  if (signInPromise) return signInPromise
  signInPromise = (async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session?.user.id) return sessionData.session.user.id

    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) {
      signInPromise = null
      throw error ?? new Error('Connexion anonyme impossible')
    }
    return data.user.id
  })()
  return signInPromise
}
