import { useState } from 'react';
import Home from './pages/Home';
import ChordDetail from './components/ChordDetail';
import AdminPanel from './components/AdminPanel';

const mockSong = {
  id: '1',
  title: 'Örnek Şarkı',
  artist: { name: 'Örnek Sanatçı' },
  content: '[Am]Bu bir örnek\n[C]Akor satırıdır',
};

export default function App() {
  const [active, setActive] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="mx-auto flex max-w-5xl gap-2 p-4">
        <button className="rounded bg-white px-3 py-2" onClick={() => setActive('home')}>Ana Sayfa</button>
        <button className="rounded bg-white px-3 py-2" onClick={() => setActive('detail')}>Akor Detay</button>
        <button className="ml-auto rounded bg-slate-900 px-3 py-2 text-white" onClick={() => setActive('admin')}>Admin</button>
      </nav>
      {active === 'home' ? <Home songs={[mockSong]} /> : null}
      {active === 'detail' ? <ChordDetail song={mockSong} /> : null}
      {active === 'admin' ? <AdminPanel /> : null}
    </div>
  );
}
