export type Module = { id: string; title: string; description: string; order_index: number };
export type Lesson = { id: string; module_id: string; title: string; order_index: number };
export type Step = { id: string; lesson_id: string; title: string; markdown: string; order_index: number };
export type Progress = { user_id: string; step_id: string; completed: boolean; completed_at?: string };
export type Quiz = { id: string; lesson_id: string; title: string };
export type QuizQuestion = {
  id: string;
  quiz_id: string;
  prompt: string;
  options: string[];
  answer_index: number;
  explanation: string;
};
export type VocabTerm = { id: string; term: string; definition: string; next_review_at?: string; interval_days?: number };
export type BenchmarkAttempt = { id: string; kind: 'baseline' | 'monthly'; score: number; attempted_at: string };
