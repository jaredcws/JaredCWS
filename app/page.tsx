'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { getLessons, getModules } from '@/lib/data';
import { getLocalProgress } from '@/lib/storage';
import { Module } from '@/lib/types';

export default function HomePage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [completion, setCompletion] = useState<Record<string, number>>({});

  useEffect(() => {
    getModules().then(async (mods) => {
      setModules(mods);
      const progress = getLocalProgress();
      const byModule: Record<string, number> = {};
      for (const mod of mods) {
        const lessons = await getLessons(mod.id);
        const stepIds: string[] = [];
        lessons.forEach((lesson) => {
          // optimistic estimate: 2 steps each in sample
          stepIds.push(`${lesson.id}-placeholder-1`, `${lesson.id}-placeholder-2`);
        });
        const done = progress.filter((p) => p.completed && stepIds.some((id) => p.step_id.includes(id.split('-')[0]))).length;
        byModule[mod.id] = stepIds.length ? Math.round((done / stepIds.length) * 100) : 0;
      }
      setCompletion(byModule);
    });
  }, []);

  return (
    <div className="page">
      <AuthCard />
      {modules.map((mod) => (
        <article className="card" key={mod.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>{mod.title}</h3>
            <span className="badge">{completion[mod.id] ?? 0}%</span>
          </div>
          <p>{mod.description}</p>
          <div className="progress"><span style={{ width: `${completion[mod.id] ?? 0}%` }} /></div>
          <Link href={`/modules/${mod.id}`}><button className="btn" style={{ marginTop: 10 }}>Open module</button></Link>
        </article>
      ))}
    </div>
  );
}
