'use client';

import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { QuizEngine } from '@/components/QuizEngine';
import { getQuizQuestions, getSteps, recordProgress } from '@/lib/data';
import { saveBenchmarkAttempt, getLocalProgress, saveLocalProgress } from '@/lib/storage';
import { QuizQuestion, Step } from '@/lib/types';

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    getSteps(params.lessonId).then(setSteps);
    getQuizQuestions(params.lessonId).then(setQuestions);
    const local = getLocalProgress().filter((p) => p.completed).map((p) => p.step_id);
    setCompleted(local);
  }, [params.lessonId]);

  const step = steps[currentStep];
  const lessonCompletion = useMemo(() => {
    if (!steps.length) return 0;
    return Math.round((steps.filter((s) => completed.includes(s.id)).length / steps.length) * 100);
  }, [steps, completed]);

  const markComplete = async () => {
    if (!step || completed.includes(step.id)) return;
    const updated = [...getLocalProgress(), { user_id: 'local-user', step_id: step.id, completed: true, completed_at: new Date().toISOString() }];
    saveLocalProgress(updated);
    setCompleted((prev) => [...prev, step.id]);
    await recordProgress({ user_id: 'local-user', step_id: step.id, completed: true, completed_at: new Date().toISOString() });
  };

  return (
    <div className="page">
      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Lesson progress</strong>
          <span className="badge">{lessonCompletion}%</span>
        </div>
        <div className="progress" style={{ marginTop: 8 }}><span style={{ width: `${lessonCompletion}%` }} /></div>
      </section>
      {step && (
        <section className="card">
          <h3>{step.title}</h3>
          <ReactMarkdown>{step.markdown}</ReactMarkdown>
          <div className="row">
            <button className="btn secondary" onClick={() => setCurrentStep((n) => Math.max(0, n - 1))}>Prev</button>
            <button className="btn secondary" onClick={() => setCurrentStep((n) => Math.min(steps.length - 1, n + 1))}>Next</button>
            <button className="btn" onClick={markComplete}>Mark complete</button>
          </div>
        </section>
      )}
      <QuizEngine
        questions={questions}
        onComplete={(score) => {
          saveBenchmarkAttempt({ id: crypto.randomUUID(), kind: 'monthly', score, attempted_at: new Date().toISOString() });
        }}
      />
    </div>
  );
}
