import { useState } from 'react';
import slugify from 'slugify';
import { supabase } from '../lib/supabaseClient';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '19871987';

const parseEdgeError = (error) => {
  if (!error) return 'Bilinmeyen hata';

  if (error.name === 'FunctionsFetchError') {
    return 'Edge Function endpointine hiç ulaşılamadı. URL/ProjectRef veya deploy kontrol edin.';
  }
  if (error.name === 'FunctionsHttpError') {
    return 'Edge Function HTTP hata döndürdü. Supabase Dashboard > Functions > Logs kontrol edin.';
  }
  if (error.name === 'FunctionsRelayError') {
    return 'Supabase relay hatası oluştu. Genelde function adı, bölge veya auth header sorunu olur.';
  }

  return error.message || 'Bilinmeyen hata';
};

export default function AdminPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('https://akorlar.com/reyhan-karaca-sevdik-sevdalandik');
  const [status, setStatus] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setOk(username === ADMIN_USERNAME && password === ADMIN_PASSWORD);
  };

  const healthCheck = async () => {
    try {
      setStatus('Function erişimi test ediliyor...');
      const { error } = await supabase.functions.invoke('scrape-chord-page', {
        body: {},
      });

      if (error) {
        setStatus(
          `HealthCheck Hata: ${parseEdgeError(error)}\n` +
            'Kontrol: 1) function adı scrape-chord-page mi? 2) deploy edildi mi? 3) VITE_SUPABASE_URL doğru mu?'
        );
        return;
      }

      setStatus('Function erişimi başarılı görünüyor ✅');
    } catch (err) {
      setStatus(`HealthCheck exception: ${err.message}`);
    }
  };

  const scrapeAndInsert = async () => {
    if (!scrapeUrl.startsWith('http')) {
      setStatus('Hata: Geçerli bir URL girin (http/https).');
      return;
    }

    try {
      setStatus('Scraping başlatıldı...');
      const { data, error } = await supabase.functions.invoke('scrape-chord-page', {
        body: { targetUrl: scrapeUrl },
      });

      if (error) {
        throw new Error(
          `${parseEdgeError(error)}\nDeploy: supabase functions deploy scrape-chord-page --no-verify-jwt`
        );
      }
      if (!data?.ok) {
        throw new Error(data?.error || 'Bilinmeyen scraping hatası');
      }

      setStatus(`Tamamlandı ✅ ${data.artist} - ${data.title} (song_id: ${data.songId})`);
    } catch (err) {
      setStatus(`Hata: ${err.message}`);
    }
  };

  const quickInsertDemo = async () => {
    try {
      setStatus('Örnek veri ekleniyor...');
      const artistName = 'Örnek Sanatçı';
      const artistSlug = slugify(artistName, { lower: true, strict: true });

      const { data: artist } = await supabase.from('artists').select('id').eq('slug', artistSlug).maybeSingle();
      let artistId = artist?.id;
      if (!artistId) {
        const { data: insertedArtist, error: aErr } = await supabase
          .from('artists')
          .insert({ name: artistName, slug: artistSlug })
          .select('id')
          .single();
        if (aErr) throw aErr;
        artistId = insertedArtist.id;
      }

      const { data: song, error: sErr } = await supabase
        .from('songs')
        .insert({ artist_id: artistId, title: 'Örnek Şarkı', slug: 'ornek-sarki', original_key: 'Am' })
        .select('id')
        .single();
      if (sErr) throw sErr;

      const { error: cErr } = await supabase
        .from('chords')
        .insert({ song_id: song.id, content: '[Am]Merhaba\n[C]Dünya' });
      if (cErr) throw cErr;

      setStatus(`Örnek kayıt eklendi. song_id: ${song.id}`);
    } catch (err) {
      setStatus(`Hata: ${err.message}`);
    }
  };

  return (
    <section className="mx-auto mt-8 max-w-xl rounded-xl border p-4">
      <h3 className="mb-3 text-xl font-semibold">Admin Panel</h3>
      {!ok ? (
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full rounded border p-2" placeholder="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full rounded border p-2" placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full rounded bg-slate-900 p-2 text-white">Giriş</button>
        </form>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-emerald-600">Giriş başarılı. Yönetim ve scraping araçları hazır.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button onClick={healthCheck} className="rounded bg-amber-500 p-2 text-white">Function Health Check</button>
            <button onClick={quickInsertDemo} className="rounded bg-emerald-600 p-2 text-white">Hızlı örnek kayıt ekle</button>
          </div>
          <input className="w-full rounded border p-2" placeholder="Scrape URL" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} />
          <button onClick={scrapeAndInsert} className="w-full rounded bg-blue-600 p-2 text-white">URL'den çek ve kaydet</button>
          {status ? <pre className="rounded bg-slate-100 p-2 text-xs whitespace-pre-wrap break-words">{status}</pre> : null}
        </div>
      )}
    </section>
  );
}
