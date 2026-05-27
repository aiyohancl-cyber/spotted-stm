-- =====================================================================
-- STM Spot — Schéma Supabase complet (bêta)
-- =====================================================================
-- À exécuter UNE FOIS dans : Supabase Dashboard → SQL Editor → New Query
-- Inclut : tables, indexes, RLS, triggers, vues, et seed des 68 stations.
-- =====================================================================

-- ---------- 1. Tables ----------

create table if not exists public.stations (
  id            text primary key,                 -- slug : 'berri-uqam'
  name          text not null,                    -- 'Berri-UQAM'
  lines         text[] not null,                  -- ['g','o','y']
  x             integer not null,                 -- coord X sur image 600x718
  y             integer not null
);

create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  station_id      text not null references public.stations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null check (type in ('info','inspector','incident')),
  content         text not null check (length(content) between 1 and 500),
  created_at      timestamptz not null default now(),
  expires_at      timestamptz,                    -- rempli par trigger pour 'inspector'
  reported_count  integer not null default 0,
  hidden          boolean not null default false
);

create index if not exists posts_station_created_idx
  on public.posts (station_id, created_at desc)
  where hidden = false;

create index if not exists posts_expires_idx
  on public.posts (expires_at)
  where expires_at is not null;

create table if not exists public.votes (
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  value       smallint not null check (value in (-1, 1)),
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  reason      text,
  created_at  timestamptz not null default now(),
  unique (post_id, user_id)                       -- 1 signalement par user par post
);

-- ---------- 2. Vue de crédibilité ----------

create or replace view public.post_credibility as
select
  p.id as post_id,
  coalesce(sum(case when v.value = 1 then 1 else 0 end), 0)::int as upvotes,
  coalesce(sum(case when v.value = -1 then 1 else 0 end), 0)::int as downvotes,
  case
    when count(v.value) = 0 then null
    else round(100.0 * sum(case when v.value = 1 then 1 else 0 end) / count(v.value))::int
  end as credibility_pct
from public.posts p
left join public.votes v on v.post_id = p.id
group by p.id;

-- ---------- 3. Triggers ----------

-- 3a. Expiration auto à +2h pour les posts 'inspector'
create or replace function public.set_inspector_expiry()
returns trigger as $$
begin
  if new.type = 'inspector' and new.expires_at is null then
    new.expires_at := new.created_at + interval '2 hours';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_inspector_expiry on public.posts;
create trigger trg_set_inspector_expiry
  before insert on public.posts
  for each row execute function public.set_inspector_expiry();

-- 3b. Rate limit : max 5 posts / heure par user
create or replace function public.enforce_post_rate_limit()
returns trigger as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from public.posts
  where user_id = new.user_id
    and created_at > now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception 'Rate limit: maximum 5 publications par heure.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_post_rate_limit on public.posts;
create trigger trg_post_rate_limit
  before insert on public.posts
  for each row execute function public.enforce_post_rate_limit();

-- 3c. Auto-masquage si >= 3 signalements
create or replace function public.handle_report_threshold()
returns trigger as $$
begin
  update public.posts
  set reported_count = reported_count + 1,
      hidden = case when reported_count + 1 >= 3 then true else hidden end
  where id = new.post_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_report_threshold on public.reports;
create trigger trg_report_threshold
  after insert on public.reports
  for each row execute function public.handle_report_threshold();

-- ---------- 4. Row Level Security ----------

alter table public.stations enable row level security;
alter table public.posts    enable row level security;
alter table public.votes    enable row level security;
alter table public.reports  enable row level security;

-- Stations : lecture publique, écriture interdite (admin uniquement via SQL)
drop policy if exists stations_read on public.stations;
create policy stations_read on public.stations for select using (true);

-- Posts : lecture publique des non-masqués + ses propres masqués
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts
  for select using (hidden = false or user_id = auth.uid());

drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts
  for insert with check (auth.uid() = user_id);

-- Pas d'update / delete par l'utilisateur (modération manuelle pour la bêta)

-- Votes : lecture publique, insert / update / delete sur ses propres votes
drop policy if exists votes_read on public.votes;
create policy votes_read on public.votes for select using (true);

drop policy if exists votes_write on public.votes;
create policy votes_write on public.votes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Reports : pas de lecture publique, insertion par utilisateur authentifié
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert with check (auth.uid() = user_id);

-- ---------- 5. Realtime ----------

-- Activer Realtime sur posts et votes
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.votes;

-- ---------- 6. Seed : 68 stations ----------

insert into public.stations (id, name, lines, x, y) values
  ('montmorency',             'Montmorency',             array['o'],        70,  70),
  ('de-la-concorde',          'De La Concorde',          array['o'],       110, 100),
  ('cartier',                 'Cartier',                 array['o'],       145, 112),
  ('henri-bourassa',          'Henri-Bourassa',          array['o'],       192, 137),
  ('sauve',                   'Sauvé',                   array['o'],       213, 155),
  ('cremazie',                'Crémazie',                array['o'],       222, 178),
  ('jarry',                   'Jarry',                   array['o'],       227, 198),
  ('beaubien',                'Beaubien',                array['o'],       269, 245),
  ('rosemont',                'Rosemont',                array['o'],       287, 268),
  ('laurier',                 'Laurier',                 array['o'],       302, 290),
  ('mont-royal',              'Mont-Royal',              array['o'],       315, 313),
  ('sherbrooke',              'Sherbrooke',              array['o'],       327, 333),
  ('champ-de-mars',           'Champ-de-Mars',           array['o'],       357, 388),
  ('place-darmes',            'Place-d''Armes',          array['o'],       343, 408),
  ('square-victoria-oaci',    'Square-Victoria-OACI',    array['o'],       327, 425),
  ('bonaventure',             'Bonaventure',             array['o'],       312, 443),
  ('lucien-lallier',          'Lucien-L''Allier',        array['o'],       295, 462),
  ('georges-vanier',          'Georges-Vanier',          array['o'],       277, 480),
  ('place-saint-henri',       'Place-Saint-Henri',       array['o'],       222, 503),
  ('vendome',                 'Vendôme',                 array['o'],       175, 488),
  ('villa-maria',             'Villa-Maria',             array['o'],       137, 458),
  ('cote-sainte-catherine',   'Côte-Sainte-Catherine',   array['o'],       122, 393),
  ('plamondon',               'Plamondon',               array['o'],       125, 370),
  ('namur',                   'Namur',                   array['o'],       122, 348),
  ('de-la-savane',            'De La Savane',            array['o'],       110, 327),
  ('du-college',              'Du Collège',              array['o'],        92, 307),
  ('cote-vertu',              'Côte-Vertu',              array['o'],        70, 290),
  ('angrignon',               'Angrignon',               array['g'],       195, 567),
  ('monk',                    'Monk',                    array['g'],       245, 555),
  ('jolicoeur',               'Jolicoeur',               array['g'],       270, 547),
  ('verdun',                  'Verdun',                  array['g'],       350, 530),
  ('de-leglise',              'De L''Église',            array['g'],       385, 522),
  ('lasalle',                 'LaSalle',                 array['g'],       412, 508),
  ('charlevoix',              'Charlevoix',              array['g'],       425, 487),
  ('atwater',                 'Atwater',                 array['g'],       372, 415),
  ('guy-concordia',           'Guy-Concordia',           array['g'],       367, 397),
  ('peel',                    'Peel',                    array['g'],       358, 378),
  ('mcgill',                  'McGill',                  array['g'],       345, 360),
  ('place-des-arts',          'Place-des-Arts',          array['g'],       332, 343),
  ('saint-laurent',           'Saint-Laurent',           array['g'],       338, 327),
  ('beaudry',                 'Beaudry',                 array['g'],       397, 340),
  ('papineau',                'Papineau',                array['g'],       410, 322),
  ('frontenac',               'Frontenac',               array['g'],       418, 305),
  ('prefontaine',             'Préfontaine',             array['g'],       425, 285),
  ('joliette',                'Joliette',                array['g'],       432, 263),
  ('pie-ix',                  'Pie-IX',                  array['g'],       432, 240),
  ('viau',                    'Viau',                    array['g'],       440, 220),
  ('assomption',              'Assomption',              array['g'],       450, 197),
  ('cadillac',                'Cadillac',                array['g'],       458, 178),
  ('langelier',               'Langelier',               array['g'],       467, 162),
  ('radisson',                'Radisson',                array['g'],       475, 145),
  ('honore-beaugrand',        'Honoré-Beaugrand',        array['g'],       493, 130),
  ('cote-des-neiges',         'Côte-des-Neiges',         array['b'],       200, 405),
  ('universite-de-montreal',  'Université-de-Montréal',  array['b'],       207, 380),
  ('edouard-montpetit',       'Édouard-Montpetit',       array['b'],       213, 355),
  ('outremont',               'Outremont',               array['b'],       215, 332),
  ('acadie',                  'Acadie',                  array['b'],       213, 283),
  ('parc',                    'Parc',                    array['b'],       230, 263),
  ('de-castelnau',            'De Castelnau',            array['b'],       251, 248),
  ('fabre',                   'Fabre',                   array['b'],       297, 213),
  ('diberville',              'D''Iberville',            array['b'],       317, 197),
  ('saint-michel',            'Saint-Michel',            array['b'],       342, 178),
  ('jean-drapeau',            'Jean-Drapeau',            array['y'],       412, 387),
  ('longueuil-udes',          'Longueuil–UdeS',          array['y'],       482, 367),
  ('jean-talon',              'Jean-Talon',              array['o','b'],   224, 222),
  ('snowdon',                 'Snowdon',                 array['o','b'],   188, 412),
  ('lionel-groulx',           'Lionel-Groulx',           array['g','o'],   263, 503),
  ('berri-uqam',              'Berri-UQAM',              array['g','o','y'], 379, 352)
on conflict (id) do update set
  name = excluded.name,
  lines = excluded.lines,
  x = excluded.x,
  y = excluded.y;
