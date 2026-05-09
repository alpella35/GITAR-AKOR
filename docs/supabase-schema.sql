-- Enable extensions
create extension if not exists pgcrypto;

-- ============ TABLES ============
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  slug text not null,
  original_key text,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, slug)
);

create table if not exists public.chords (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  content text not null,
  content_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_artists_name on public.artists (name);
create index if not exists idx_songs_title on public.songs (title);
create index if not exists idx_songs_artist on public.songs (artist_id);
create index if not exists idx_chords_song on public.chords (song_id);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_artists_updated_at on public.artists;
create trigger trg_artists_updated_at
before update on public.artists
for each row execute function public.set_updated_at();

drop trigger if exists trg_songs_updated_at on public.songs;
create trigger trg_songs_updated_at
before update on public.songs
for each row execute function public.set_updated_at();

-- ============ RLS ============
alter table public.artists enable row level security;
alter table public.songs enable row level security;
alter table public.chords enable row level security;

-- Public read access
create policy "artists_read_public" on public.artists
for select using (true);

create policy "songs_read_public" on public.songs
for select using (true);

create policy "chords_read_public" on public.chords
for select using (true);

-- Authenticated admin write access (link to auth.users email for now)
create policy "artists_write_admin" on public.artists
for all
using (auth.jwt() ->> 'email' = 'admin@akor.local')
with check (auth.jwt() ->> 'email' = 'admin@akor.local');

create policy "songs_write_admin" on public.songs
for all
using (auth.jwt() ->> 'email' = 'admin@akor.local')
with check (auth.jwt() ->> 'email' = 'admin@akor.local');

create policy "chords_write_admin" on public.chords
for all
using (auth.jwt() ->> 'email' = 'admin@akor.local')
with check (auth.jwt() ->> 'email' = 'admin@akor.local');
