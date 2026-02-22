'use client';

import { useMemo, useState } from 'react';
import { QuizQuestion } from '@/lib/types';

type Props = { questions: QuizQuestion[]; onComplete: (score: number) => void };

export function QuizEngine({ questions, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    const correct = questions.filter((q) => answers[q.id] === q.answer_index).length;
    return questions.length ? Math.round((correct / questions.length) * 100) : 0;
  }, [answers, questions]);

  if (!questions.length) return <div className="card">No quiz configured yet.</div>;

  return (
    <section className="card">
      <h3>Lesson Quiz</h3>
      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 12 }}>
          <strong>{q.prompt}</strong>
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
            {q.options.map((opt, index) => {
              const state = submitted
                ? index === q.answer_index
                  ? 'correct'
                  : answers[q.id] === index
                    ? 'incorrect'
                    : ''
                : '';
              return (
                <button key={opt} className={`choice ${state}`} onClick={() => setAnswers({ ...answers, [q.id]: index })}>
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && <p>{q.explanation}</p>}
        </div>
      ))}
      {!submitted ? (
        <button className="btn" onClick={() => { setSubmitted(true); onComplete(score); }}>Submit quiz</button>
      ) : (
        <p><strong>Score: {score}%</strong></p>
      )}
    </section>
  );
}
