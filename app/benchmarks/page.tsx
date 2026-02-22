'use client';

import { useMemo, useState } from 'react';
import { getBenchmarkAttempts, saveBenchmarkAttempt } from '@/lib/storage';

export default function BenchmarksPage() {
  const [attempts, setAttempts] = useState(getBenchmarkAttempts());

  const baseline = () => {
    const score = Math.floor(60 + Math.random() * 40);
    saveBenchmarkAttempt({ id: crypto.randomUUID(), kind: 'baseline', score, attempted_at: new Date().toISOString() });
    setAttempts(getBenchmarkAttempts());
  };

  const monthly = () => {
    const score = Math.floor(60 + Math.random() * 40);
    saveBenchmarkAttempt({ id: crypto.randomUUID(), kind: 'monthly', score, attempted_at: new Date().toISOString() });
    setAttempts(getBenchmarkAttempts());
  };

  const maxScore = useMemo(() => Math.max(100, ...attempts.map((a) => a.score)), [attempts]);

  return (
    <div className="page">
      <section className="card">
        <h3>Benchmarks</h3>
        <div className="row">
          <button className="btn" onClick={baseline}>Run baseline</button>
          <button className="btn secondary" onClick={monthly}>Run monthly retest</button>
        </div>
      </section>
      <section className="card">
        <h3>History</h3>
        <div className="chart">
          {attempts.slice(0, 8).reverse().map((a) => (
            <div key={a.id} className="bar" style={{ height: `${(a.score / maxScore) * 100}%` }} title={`${a.kind}: ${a.score}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
