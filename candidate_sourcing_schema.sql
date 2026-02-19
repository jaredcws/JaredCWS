-- Candidate Sourcing MVP Schema (PostgreSQL)

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location_policy TEXT NOT NULL,
  min_years_experience INTEGER NOT NULL CHECK (min_years_experience >= 0),
  must_have_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  nice_to_have_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  headline TEXT,
  current_company TEXT,
  current_title TEXT,
  primary_email TEXT,
  primary_phone TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','review','shortlist','contacted','responded','interview','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_experiences (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_skills (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  confidence NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id, skill_name)
);

CREATE TABLE candidate_locations (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  raw_location TEXT,
  normalized_city TEXT,
  normalized_region TEXT,
  normalized_country TEXT,
  time_zone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_scores (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  skill_fit NUMERIC(5,2) NOT NULL,
  experience_fit NUMERIC(5,2) NOT NULL,
  location_fit NUMERIC(5,2) NOT NULL,
  seniority_fit NUMERIC(5,2) NOT NULL,
  signal_fit NUMERIC(5,2) NOT NULL,
  score_explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE candidate_reports (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  report_version TEXT NOT NULL DEFAULT 'v1',
  executive_summary TEXT NOT NULL,
  report_payload JSONB NOT NULL,
  confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outreach_events (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email','linkedin_inmail','phone','other')),
  template_name TEXT,
  message_subject TEXT,
  message_body TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_status TEXT NOT NULL DEFAULT 'none' CHECK (response_status IN ('none','positive','neutral','negative')),
  response_at TIMESTAMPTZ
);

CREATE TABLE pipeline_events (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sources (
  id UUID PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_record_id TEXT,
  data_rights_basis TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retention_expires_at TIMESTAMPTZ,
  UNIQUE (source_name, source_record_id)
);

CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidate_scores_candidate_role ON candidate_scores(candidate_id, role_id, scored_at DESC);
CREATE INDEX idx_pipeline_events_candidate ON pipeline_events(candidate_id, created_at DESC);
CREATE INDEX idx_outreach_events_candidate ON outreach_events(candidate_id, sent_at DESC);
CREATE INDEX idx_sources_candidate ON sources(candidate_id, collected_at DESC);
