-- Sample module + 3 lessons seed
insert into public.modules (id, title, description, order_index)
values ('11111111-1111-1111-1111-111111111111', 'SVOV Foundations', 'Core framework from spec to verification.', 1)
on conflict (id) do nothing;

insert into public.lessons (id, module_id, title, order_index)
values
('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Spec Crisp Requirements', 1),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Orchestrate Workflows', 2),
('23333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Verify with Evidence', 3)
on conflict (id) do nothing;

insert into public.steps (lesson_id, title, markdown, order_index)
values
('21111111-1111-1111-1111-111111111111', 'Outcome definition', '# Define outcomes\nWrite measurable outcomes before implementation.', 1),
('21111111-1111-1111-1111-111111111111', 'Constraints', '# List constraints\nDocument timeline, budget, and quality constraints.', 2),
('22222222-2222-2222-2222-222222222222', 'Task graph', '# Build a task graph\nModel dependencies and parallelism.', 1),
('22222222-2222-2222-2222-222222222222', 'Execution plan', '# Build execution plan\nAssign owners and checkpoints.', 2),
('23333333-3333-3333-3333-333333333333', 'Verification methods', '# Verification methods\nUse tests, telemetry, and audits.', 1),
('23333333-3333-3333-3333-333333333333', 'Evidence logs', '# Evidence logs\nCapture results and variance analysis.', 2);

insert into public.quizzes (id, lesson_id, title)
values
('31111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 'Spec basics'),
('32222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Orchestration basics'),
('33333333-3333-3333-3333-333333333333', '23333333-3333-3333-3333-333333333333', 'Verification basics')
on conflict (id) do nothing;

insert into public.quiz_questions (quiz_id, prompt, options, answer_index, explanation)
values
('31111111-1111-1111-1111-111111111111', 'A good spec starts with:', '["Code","Measurable outcomes","Team size"]', 1, 'Outcomes define success and guide implementation.'),
('32222222-2222-2222-2222-222222222222', 'Orchestration primarily aligns:', '["Dependencies and owners","Brand colors","Vacation plans"]', 0, 'Dependencies and ownership reduce execution risk.'),
('33333333-3333-3333-3333-333333333333', 'Verification evidence should be:', '["Anecdotal","Repeatable and logged","Hidden"]', 1, 'Repeatable evidence builds trust and traceability.');

insert into public.vocab_terms (term, definition, interval_days)
values
('Specification', 'A precise statement of what and why.', 1),
('Orchestration', 'Coordinated execution of dependent tasks.', 1),
('Verification', 'Proving outcomes with objective evidence.', 1)
on conflict (term) do nothing;
