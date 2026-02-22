'use client';

import { FormEvent, useMemo, useState } from 'react';
import { localLessons, localModules, localQuestions, localQuizzes, localSteps, localVocab } from '@/lib/localData';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@svov.academy';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const totals = useMemo(() => ({
    modules: localModules.length,
    lessons: localLessons.length,
    steps: localSteps.length,
    quizzes: localQuizzes.length,
    questions: localQuestions.length,
    vocab: localVocab.length
  }), []);

  const check = (e: FormEvent) => {
    e.preventDefault();
    setAllowed(email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase());
  };

  const logAction = (action: string) => setLog((p) => [new Date().toLocaleTimeString() + ' - ' + action, ...p]);

  return (
    <div className="page">
      {!allowed ? (
        <section className="card">
          <h3>Admin Access</h3>
          <p>Restricted to: <code>{ADMIN_EMAIL}</code></p>
          <form onSubmit={check}>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" />
            <button className="btn" type="submit" style={{ marginTop: 8 }}>Unlock</button>
          </form>
        </section>
      ) : (
        <>
          <section className="card">
            <h3>Content totals</h3>
            <p>Modules: {totals.modules} · Lessons: {totals.lessons} · Steps: {totals.steps}</p>
            <p>Quizzes: {totals.quizzes} · Questions: {totals.questions} · Vocab: {totals.vocab}</p>
          </section>
          <section className="card">
            <h3>Quick editor (starter)</h3>
            <p>This starter screen demonstrates restricted admin operations for create/edit workflows.</p>
            <div className="row">
              <button className="btn" onClick={() => logAction('Create module draft')}>Create Module</button>
              <button className="btn secondary" onClick={() => logAction('Edit lesson draft')}>Edit Lesson</button>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn" onClick={() => logAction('Create quiz draft')}>Create Quiz</button>
              <button className="btn secondary" onClick={() => logAction('Add vocab term draft')}>Add Vocab</button>
            </div>
          </section>
          <section className="card">
            <h3>Audit log</h3>
            {log.length ? log.map((entry) => <p key={entry}>{entry}</p>) : <p>No edits yet.</p>}
          </section>
        </>
      )}
    </div>
  );
}
