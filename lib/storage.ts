import { BenchmarkAttempt, Progress } from './types';

const progressKey = 'svov.progress';
const benchmarkKey = 'svov.benchmarks';
const vocabReviewKey = 'svov.vocabReviews';

export function getLocalProgress() {
  if (typeof window === 'undefined') return [] as Progress[];
  return JSON.parse(localStorage.getItem(progressKey) ?? '[]') as Progress[];
}

export function saveLocalProgress(progress: Progress[]) {
  localStorage.setItem(progressKey, JSON.stringify(progress));
}

export function getBenchmarkAttempts() {
  if (typeof window === 'undefined') return [] as BenchmarkAttempt[];
  return JSON.parse(localStorage.getItem(benchmarkKey) ?? '[]') as BenchmarkAttempt[];
}

export function saveBenchmarkAttempt(attempt: BenchmarkAttempt) {
  const all = getBenchmarkAttempts();
  localStorage.setItem(benchmarkKey, JSON.stringify([attempt, ...all]));
}

export function getVocabReviews(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem(vocabReviewKey) ?? '{}') as Record<string, string>;
}

export function saveVocabReview(termId: string, nextReviewAt: string) {
  const reviews = getVocabReviews();
  reviews[termId] = nextReviewAt;
  localStorage.setItem(vocabReviewKey, JSON.stringify(reviews));
}
