// Mock posts seeded for demo purposes
// In production: replace with Supabase realtime fetches

export type PostType = 'inspector' | 'incident' | 'info'

export interface Post {
  id: string
  stationName: string
  type: PostType
  body: string
  author: string
  avatar: string
  timeAgo: string
  upvotes: number
  downvotes: number
}

export interface StationActivity {
  active: number
  postsToday: number
  heat: 'low' | 'normal' | 'moderate' | 'high'
}

export const STATION_ACTIVITY: Record<string, StationActivity> = {
  'Berri-UQAM': { active: 234, postsToday: 12, heat: 'high' },
  'Lionel-Groulx': { active: 156, postsToday: 8, heat: 'moderate' },
  'Snowdon': { active: 89, postsToday: 5, heat: 'normal' },
  'Jean-Talon': { active: 142, postsToday: 9, heat: 'moderate' },
  'Angrignon': { active: 67, postsToday: 4, heat: 'low' },
  'Honoré-Beaugrand': { active: 78, postsToday: 6, heat: 'normal' },
  'Côte-Vertu': { active: 71, postsToday: 5, heat: 'normal' },
  'Montmorency': { active: 58, postsToday: 3, heat: 'low' },
  'McGill': { active: 187, postsToday: 11, heat: 'high' },
  'Place-des-Arts': { active: 124, postsToday: 7, heat: 'moderate' },
  'Peel': { active: 145, postsToday: 9, heat: 'moderate' },
  'Mont-Royal': { active: 112, postsToday: 6, heat: 'moderate' },
  'Vendôme': { active: 98, postsToday: 5, heat: 'normal' },
}

export const POSTS_BY_STATION: Record<string, Post[]> = {
  'Berri-UQAM': [
    {
      id: 'b1', stationName: 'Berri-UQAM', type: 'inspector',
      body: '3 inspecteurs à la sortie Saint-Denis sud, contrôle actif depuis 8h45',
      author: '@transit_mtl', avatar: 'TM', timeAgo: '15 min', upvotes: 42, downvotes: 2,
    },
    {
      id: 'b2', stationName: 'Berri-UQAM', type: 'incident',
      body: 'Foule importante au transfert orange-jaune ce matin, prévoyez 5 min de plus',
      author: '@jules_l', avatar: 'JL', timeAgo: '32 min', upvotes: 18, downvotes: 1,
    },
    {
      id: 'b3', stationName: 'Berri-UQAM', type: 'info',
      body: 'Musicien à la mezzanine, super ambiance — jazz tranquille',
      author: '@anna_n', avatar: 'AN', timeAgo: '1 h', upvotes: 24, downvotes: 0,
    },
    {
      id: 'b4', stationName: 'Berri-UQAM', type: 'inspector',
      body: 'RAS depuis 9h30, je viens de passer côté UQAM',
      author: '@chloe_m', avatar: 'CM', timeAgo: '45 min', upvotes: 31, downvotes: 3,
    },
  ],
  'Lionel-Groulx': [
    {
      id: 'lg1', stationName: 'Lionel-Groulx', type: 'inspector',
      body: '2 STM en uniforme près des tourniquets verts, direction Angrignon',
      author: '@kv_metro', avatar: 'KV', timeAgo: '8 min', upvotes: 28, downvotes: 1,
    },
    {
      id: 'lg2', stationName: 'Lionel-Groulx', type: 'info',
      body: 'Quai orange direction Côte-Vertu peu achalandé, parfait pour le transfert',
      author: '@marco_r', avatar: 'MR', timeAgo: '25 min', upvotes: 11, downvotes: 0,
    },
    {
      id: 'lg3', stationName: 'Lionel-Groulx', type: 'incident',
      body: 'Ascenseur vers la sortie Atwater hors service depuis ce matin',
      author: '@lp_mtl', avatar: 'LP', timeAgo: '2 h', upvotes: 15, downvotes: 0,
    },
  ],
  'Snowdon': [
    {
      id: 's1', stationName: 'Snowdon', type: 'inspector',
      body: 'Contrôle au passage entre les deux lignes, soyez prudents',
      author: '@nicb', avatar: 'NB', timeAgo: '22 min', upvotes: 19, downvotes: 1,
    },
    {
      id: 's2', stationName: 'Snowdon', type: 'info',
      body: 'Tout est calme côté ligne bleue, aucun signalement',
      author: '@rc_511', avatar: 'RC', timeAgo: '40 min', upvotes: 6, downvotes: 0,
    },
  ],
  'Jean-Talon': [
    {
      id: 'jt1', stationName: 'Jean-Talon', type: 'inspector',
      body: "Brigade à l'entrée principale boul. Saint-Hubert, 4 agents",
      author: '@dani_a', avatar: 'DA', timeAgo: '12 min', upvotes: 35, downvotes: 2,
    },
    {
      id: 'jt2', stationName: 'Jean-Talon', type: 'incident',
      body: "Marché Jean-Talon plus achalandé que d'habitude, attendez-vous au délai",
      author: '@ft_mtl', avatar: 'FT', timeAgo: '1 h', upvotes: 14, downvotes: 0,
    },
    {
      id: 'jt3', stationName: 'Jean-Talon', type: 'info',
      body: 'Nouveau café à la sortie nord, ouvre à 6h pour les matinaux',
      author: '@sara_v', avatar: 'SV', timeAgo: '3 h', upvotes: 22, downvotes: 1,
    },
  ],
  'McGill': [
    {
      id: 'mg1', stationName: 'McGill', type: 'inspector',
      body: '5 inspecteurs aux sorties Eaton et McGill College, contrôle généralisé',
      author: '@stud_mtl', avatar: 'SM', timeAgo: '5 min', upvotes: 67, downvotes: 1,
    },
    {
      id: 'mg2', stationName: 'McGill', type: 'info',
      body: 'Beaucoup d\'étudiants en semaine d\'examens, ambiance studieuse',
      author: '@uni_life', avatar: 'UL', timeAgo: '1 h', upvotes: 18, downvotes: 0,
    },
  ],
  'Place-des-Arts': [
    {
      id: 'pda1', stationName: 'Place-des-Arts', type: 'incident',
      body: 'Manifestation prévue à 17h, attendez-vous à beaucoup de monde',
      author: '@news_mtl', avatar: 'NM', timeAgo: '20 min', upvotes: 45, downvotes: 2,
    },
    {
      id: 'pda2', stationName: 'Place-des-Arts', type: 'inspector',
      body: 'STM présents à la sortie Bleury depuis 14h',
      author: '@walker_h', avatar: 'WH', timeAgo: '35 min', upvotes: 22, downvotes: 1,
    },
  ],
}

export function getPostsForStation(name: string): Post[] {
  return POSTS_BY_STATION[name] ?? defaultPosts(name)
}

export function getActivityForStation(name: string): StationActivity {
  return STATION_ACTIVITY[name] ?? {
    active: Math.floor(Math.random() * 60) + 40,
    postsToday: Math.floor(Math.random() * 4) + 1,
    heat: 'low',
  }
}

function defaultPosts(name: string): Post[] {
  return [
    {
      id: `${name}-1`, stationName: name, type: 'info',
      body: 'Tout est calme, aucun signalement récent à cette station',
      author: '@anon_user', avatar: 'AN', timeAgo: '25 min', upvotes: 9, downvotes: 0,
    },
    {
      id: `${name}-2`, stationName: name, type: 'inspector',
      body: "Inspecteurs aperçus à l'entrée principale plus tôt, restez vigilants",
      author: '@mt_mtl', avatar: 'MT', timeAgo: '1 h', upvotes: 14, downvotes: 1,
    },
  ]
}
