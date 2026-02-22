'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLessons } from '@/lib/data';
import { Lesson } from '@/lib/types';

export default function ModulePage({ params }: { params: { moduleId: string } }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    getLessons(params.moduleId).then(setLessons);
  }, [params.moduleId]);

  return (
    <div className="page">
      <div className="card"><strong>Lessons</strong></div>
      {lessons.map((lesson) => (
        <article className="card" key={lesson.id}>
          <h3>{lesson.order_index}. {lesson.title}</h3>
          <Link href={`/lessons/${lesson.id}`}><button className="btn">Start lesson</button></Link>
        </article>
      ))}
    </div>
  );
}
