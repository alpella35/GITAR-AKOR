import { useState } from 'react';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '19871987';

export default function AdminPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setOk(username === ADMIN_USERNAME && password === ADMIN_PASSWORD);
  };

  return (
    <section className="mx-auto mt-8 max-w-md rounded-xl border p-4">
      <h3 className="mb-3 text-xl font-semibold">Admin Panel</h3>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full rounded bg-slate-900 p-2 text-white">Giriş</button>
      </form>
      {ok ? <p className="mt-3 text-sm text-emerald-600">Giriş başarılı. Scraping ve içerik yönetimi işlemlerine devam edebilirsiniz.</p> : null}
    </section>
  );
}
