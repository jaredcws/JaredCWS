'use client';

import { useEffect, useMemo, useState } from 'react';
import { getVocab } from '@/lib/data';
import { getVocabReviews, saveVocabReview } from '@/lib/storage';
import { VocabTerm } from '@/lib/types';

export default function VocabPage() {
  const [terms, setTerms] = useState<VocabTerm[]>([]);
  const [reviews, setReviews] = useState<Record<string, string>>({});

  useEffect(() => {
    getVocab().then(setTerms);
    setReviews(getVocabReviews());
  }, []);

  const queue = useMemo(() => terms.filter((t) => !reviews[t.id] || new Date(reviews[t.id]) <= new Date()), [terms, reviews]);

  const markReviewed = (term: VocabTerm) => {
    const days = term.interval_days ?? 1;
    const next = new Date();
    next.setDate(next.getDate() + days);
    saveVocabReview(term.id, next.toISOString());
    setReviews(getVocabReviews());
  };

  return (
    <div className="page">
      <section className="card">
        <h3>Review Queue</h3>
        <p>{queue.length} terms due now</p>
      </section>
      {queue.map((term) => (
        <article key={term.id} className="card">
          <h4>{term.term}</h4>
          <p>{term.definition}</p>
          <button className="btn" onClick={() => markReviewed(term)}>Mark reviewed</button>
        </article>
      ))}
    </div>
  );
}
