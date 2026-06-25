-- 002_faculty_subject_assignments.sql
-- Explicitly tracks which faculty member is assigned to teach
-- a given subject to a given division. This replaces the workaround
-- of deriving faculty subjects from their session history.

create table if not exists faculty_subject_assignments (
  id            uuid primary key default gen_random_uuid(),
  faculty_id    uuid not null references faculty(id) on delete cascade,
  subject_id    uuid not null references subjects(id) on delete cascade,
  division      text not null,
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (faculty_id, subject_id, division, academic_year_id)
);

create index if not exists idx_fsa_faculty   on faculty_subject_assignments(faculty_id);
create index if not exists idx_fsa_subject   on faculty_subject_assignments(subject_id);
create index if not exists idx_fsa_division  on faculty_subject_assignments(division);
create index if not exists idx_fsa_year      on faculty_subject_assignments(academic_year_id);
