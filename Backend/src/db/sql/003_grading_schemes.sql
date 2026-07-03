-- 003_grading_schemes.sql
-- Admin-configurable grading schemes. Each scheme is a named set of grade
-- bands (e.g. O >= 90%, A+ >= 80%, ...). Exactly one scheme is marked
-- is_default at a time; that's the one used when computing student grades
-- in POST /api/marks/bulk.

create table if not exists grading_schemes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists grading_bands (
  id              uuid primary key default gen_random_uuid(),
  scheme_id       uuid not null references grading_schemes(id) on delete cascade,
  grade           text not null,
  min_percentage  numeric not null,
  sort_order      int not null default 0,
  unique (scheme_id, grade)
);

create index if not exists idx_grading_bands_scheme on grading_bands(scheme_id);

-- Only one scheme may be default at a time. Enforced in application code
-- (clear others before setting), not via a partial unique index, to keep
-- the migration simple and portable.
