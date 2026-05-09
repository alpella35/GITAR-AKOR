import { useMemo, useState } from 'react';
import { transposeChordSheet } from '../utils/chordTranspose';

export default function ChordDetail({ song }) {
  const [transpose, setTranspose] = useState(0);
  const [speed, setSpeed] = useState(0);

  const renderedContent = useMemo(
    () => transposeChordSheet(song?.content ?? '', transpose),
    [song?.content, transpose]
  );

  const startAutoScroll = () => {
    if (speed <= 0) return;
    const timer = setInterval(() => window.scrollBy({ top: Number(speed), behavior: 'smooth' }), 250);
    window.__chordScrollTimer = timer;
  };

  const stopAutoScroll = () => {
    clearInterval(window.__chordScrollTimer);
  };

  return (
    <section className="mx-auto max-w-4xl p-4">
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <button className="rounded bg-slate-200 px-3 py-1" onClick={() => setTranspose((v) => v - 1)}>-1</button>
        <span className="rounded bg-slate-100 px-3 py-1 text-sm">Transpose: {transpose}</span>
        <button className="rounded bg-slate-200 px-3 py-1" onClick={() => setTranspose((v) => v + 1)}>+1</button>

        <input
          className="ml-2 w-24 rounded border px-2 py-1"
          type="number"
          min="0"
          max="20"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          placeholder="Hız"
        />
        <button className="rounded bg-emerald-500 px-3 py-1 text-white" onClick={startAutoScroll}>Auto Scroll</button>
        <button className="rounded bg-rose-500 px-3 py-1 text-white" onClick={stopAutoScroll}>Stop</button>
      </header>

      <article className="overflow-x-auto rounded-lg border bg-white p-4 shadow-sm">
        <pre className="font-mono text-sm leading-7 whitespace-pre">{renderedContent}</pre>
      </article>
    </section>
  );
}
