import { useMemo, useState } from 'react';

export default function Home({ songs = [] }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return songs;
    return songs.filter((s) =>
      [s.title, s.artist?.name].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [songs, query]);

  return (
    <main className="mx-auto max-w-5xl p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Şarkı veya sanatçı ara..."
        className="mb-5 w-full rounded-lg border px-4 py-3"
      />
      <h2 className="mb-2 text-lg font-semibold">Popüler / Yeni Eklenenler</h2>
      <ul className="space-y-2">
        {filtered.map((song) => (
          <li key={song.id} className="rounded border p-3">
            <p className="font-medium">{song.title}</p>
            <p className="text-sm text-slate-600">{song.artist?.name}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
