import axios from 'axios';
import * as cheerio from 'cheerio';
import slugify from 'slugify';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const normalizeChordBlock = (raw = '') =>
  raw
    .replace(/\r/g, '')
    .replace(/\t/g, '    ')
    .trimEnd();

const extractSongData = ($) => {
  const title = $('h1').first().text().trim() || $('title').text().split('-')[0].trim();
  const artist =
    $('[data-artist]').first().attr('data-artist') ||
    $('.artist, .song-artist, .metadata .artist').first().text().trim() ||
    $('meta[name="author"]').attr('content') ||
    'Bilinmeyen Sanatçı';

  const chordContent =
    $('pre').first().text() ||
    $('div.chords, div.lyrics, .chord-sheet').first().text() ||
    '';

  if (!title || !chordContent.trim()) {
    throw new Error('Sayfadan yeterli veri okunamadı: title/chords eksik.');
  }

  return {
    title,
    artist,
    content: normalizeChordBlock(chordContent),
  };
};

export const scrapeAndInsert = async (targetUrl) => {
  const { data: html } = await axios.get(targetUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 chord-bot/1.0' },
    timeout: 20000,
  });

  const $ = cheerio.load(html);
  const parsed = extractSongData($);

  const artistSlug = slugify(parsed.artist, { lower: true, strict: true });
  const songSlug = slugify(parsed.title, { lower: true, strict: true });

  const { data: existingArtist } = await supabase
    .from('artists')
    .select('id')
    .eq('slug', artistSlug)
    .maybeSingle();

  let artistId = existingArtist?.id;

  if (!artistId) {
    const { data: insertedArtist, error: artistErr } = await supabase
      .from('artists')
      .insert({ name: parsed.artist, slug: artistSlug })
      .select('id')
      .single();

    if (artistErr) throw artistErr;
    artistId = insertedArtist.id;
  }

  const { data: insertedSong, error: songErr } = await supabase
    .from('songs')
    .insert({
      artist_id: artistId,
      title: parsed.title,
      slug: songSlug,
      original_key: null,
    })
    .select('id')
    .single();

  if (songErr) throw songErr;

  const { error: chordErr } = await supabase.from('chords').insert({
    song_id: insertedSong.id,
    content: parsed.content,
  });

  if (chordErr) throw chordErr;

  return { success: true, artistId, songId: insertedSong.id };
};

if (process.argv[2]) {
  scrapeAndInsert(process.argv[2])
    .then((result) => console.log('Tamamlandı:', result))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
