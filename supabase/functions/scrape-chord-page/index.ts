// Supabase Edge Function: scrape-chord-page
// Deploy: supabase functions deploy scrape-chord-page --no-verify-jwt
import { load } from 'npm:cheerio@1.0.0-rc.12';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Payload = { targetUrl?: string };

const slugify = (input: string) =>
  input
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { targetUrl }: Payload = await req.json();
    if (!targetUrl) throw new Error('targetUrl zorunlu');

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AkorBot/1.0; +https://example.com/bot)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) throw new Error(`Hedef sayfa alınamadı (${res.status})`);
    const html = await res.text();
    const $ = load(html);

    const title = $('h1').first().text().trim() || $('title').text().trim();
    const artist =
      $('.sanatci a, .artist a, .artist, .metadata .artist').first().text().trim() ||
      (title.includes('-') ? title.split('-')[0].trim() : 'Bilinmeyen Sanatçı');

    const chordBlock =
      $('pre').first().text().trim() ||
      $('.chords, .lyric, .lyrics, .content-text, article').first().text().trim();

    if (!title || !chordBlock) throw new Error('Sayfadan başlık veya akor bloğu okunamadı');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const artistSlug = slugify(artist);
    const songSlug = slugify(title);

    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id')
      .eq('slug', artistSlug)
      .maybeSingle();

    let artistId = existingArtist?.id;
    if (!artistId) {
      const { data, error } = await supabase
        .from('artists')
        .insert({ name: artist, slug: artistSlug })
        .select('id')
        .single();
      if (error) throw error;
      artistId = data.id;
    }

    const { data: song, error: songErr } = await supabase
      .from('songs')
      .insert({ artist_id: artistId, title, slug: songSlug })
      .select('id')
      .single();
    if (songErr) throw songErr;

    const { error: chordErr } = await supabase
      .from('chords')
      .insert({ song_id: song.id, content: chordBlock });
    if (chordErr) throw chordErr;

    return new Response(JSON.stringify({ ok: true, songId: song.id, artist, title }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
