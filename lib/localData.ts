import { Lesson, Module, Quiz, QuizQuestion, Step, VocabTerm } from './types';

export const localModules: Module[] = [
  { id: 'm1', title: 'SVOV Foundations', description: 'Core framework from spec to verification.', order_index: 1 }
];

export const localLessons: Lesson[] = [
  { id: 'l1', module_id: 'm1', title: 'Spec Crisp Requirements', order_index: 1 },
  { id: 'l2', module_id: 'm1', title: 'Orchestrate Workflows', order_index: 2 },
  { id: 'l3', module_id: 'm1', title: 'Verify with Evidence', order_index: 3 }
];

export const localSteps: Step[] = [
  { id: 's1', lesson_id: 'l1', title: 'Outcome definition', markdown: '# Define outcomes\nWrite measurable outcomes before implementation.', order_index: 1 },
  { id: 's2', lesson_id: 'l1', title: 'Constraints', markdown: '# List constraints\nDocument timeline, budget, and quality constraints.', order_index: 2 },
  { id: 's3', lesson_id: 'l2', title: 'Task graph', markdown: '# Build a task graph\nModel dependencies and parallelism.', order_index: 1 },
  { id: 's4', lesson_id: 'l2', title: 'Execution plan', markdown: '# Build execution plan\nAssign owners and checkpoints.', order_index: 2 },
  { id: 's5', lesson_id: 'l3', title: 'Verification methods', markdown: '# Verification methods\nUse tests, telemetry, and audits.', order_index: 1 },
  { id: 's6', lesson_id: 'l3', title: 'Evidence logs', markdown: '# Evidence logs\nCapture results and variance analysis.', order_index: 2 }
];

export const localQuizzes: Quiz[] = [
  { id: 'q1', lesson_id: 'l1', title: 'Spec basics' },
  { id: 'q2', lesson_id: 'l2', title: 'Orchestration basics' },
  { id: 'q3', lesson_id: 'l3', title: 'Verification basics' }
];

export const localQuestions: QuizQuestion[] = [
  { id: 'qq1', quiz_id: 'q1', prompt: 'A good spec starts with:', options: ['Code', 'Measurable outcomes', 'Team size'], answer_index: 1, explanation: 'Outcomes define success and guide implementation.' },
  { id: 'qq2', quiz_id: 'q2', prompt: 'Orchestration primarily aligns:', options: ['Dependencies and owners', 'Brand colors', 'Vacation plans'], answer_index: 0, explanation: 'Dependencies + ownership reduce execution risk.' },
  { id: 'qq3', quiz_id: 'q3', prompt: 'Verification evidence should be:', options: ['Anecdotal', 'Repeatable and logged', 'Hidden'], answer_index: 1, explanation: 'Repeatable evidence builds trust and traceability.' }
];

export const localVocab: VocabTerm[] = [
  { id: 'v1', term: 'Specification', definition: 'A precise statement of what and why.', interval_days: 1 },
  { id: 'v2', term: 'Orchestration', definition: 'Coordinated execution of dependent tasks.', interval_days: 1 },
  { id: 'v3', term: 'Verification', definition: 'Proving outcomes with objective evidence.', interval_days: 1 }
];
