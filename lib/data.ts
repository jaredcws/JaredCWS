import { localLessons, localModules, localQuestions, localQuizzes, localSteps, localVocab } from './localData';
import { hasSupabase, supabase } from './supabase';
import { Lesson, Module, Progress, QuizQuestion, Step, VocabTerm } from './types';

export async function getModules(): Promise<Module[]> {
  if (!hasSupabase || !supabase) return localModules;
  const { data } = await supabase.from('modules').select('*').order('order_index');
  return (data as Module[]) ?? localModules;
}

export async function getLessons(moduleId: string): Promise<Lesson[]> {
  if (!hasSupabase || !supabase) return localLessons.filter((l) => l.module_id === moduleId);
  const { data } = await supabase.from('lessons').select('*').eq('module_id', moduleId).order('order_index');
  return (data as Lesson[]) ?? [];
}

export async function getSteps(lessonId: string): Promise<Step[]> {
  if (!hasSupabase || !supabase) return localSteps.filter((s) => s.lesson_id === lessonId);
  const { data } = await supabase.from('steps').select('*').eq('lesson_id', lessonId).order('order_index');
  return (data as Step[]) ?? [];
}

export async function getQuizQuestions(lessonId: string): Promise<QuizQuestion[]> {
  if (!hasSupabase || !supabase) {
    const quiz = localQuizzes.find((q) => q.lesson_id === lessonId);
    return localQuestions.filter((qq) => qq.quiz_id === quiz?.id);
  }
  const { data: quiz } = await supabase.from('quizzes').select('*').eq('lesson_id', lessonId).single();
  if (!quiz) return [];
  const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quiz.id).order('id');
  return (data as QuizQuestion[]) ?? [];
}

export async function getVocab(): Promise<VocabTerm[]> {
  if (!hasSupabase || !supabase) return localVocab;
  const { data } = await supabase.from('vocab_terms').select('*').order('term');
  return (data as VocabTerm[]) ?? [];
}

export async function recordProgress(item: Progress) {
  if (!hasSupabase || !supabase) return;
  await supabase.from('progress').upsert(item, { onConflict: 'user_id,step_id' });
}
