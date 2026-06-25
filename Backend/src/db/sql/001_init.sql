-- 001_init.sql
-- Core schema for the University Attendance & Marks Management backend.
-- This runs against the Supabase Postgres database via a direct connection
-- (see src/db/migrate.ts). Runtime app queries go through @supabase/supabase-js
-- using the service_role key, which bypasses RLS — so RLS is left disabled on
-- these tables; all authorization is enforced in the Express middleware.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  role          text not null check (role in ('admin', 'hod', 'faculty', 'student', 'parent')),
  name          text not null,
  phone         text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_users_role on users(role);

-- ---------------------------------------------------------------------------
-- departments
-- ---------------------------------------------------------------------------
create table if not exists departments (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  code         text not null unique,
  hod_user_id  uuid references users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create table if not exists courses (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  code            text not null unique,
  department_id   uuid not null references departments(id) on delete cascade,
  duration_years  int not null default 4,
  created_at      timestamptz not null default now()
);

create index if not exists idx_courses_department on courses(department_id);

-- ---------------------------------------------------------------------------
-- subjects
-- ---------------------------------------------------------------------------
create table if not exists subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  course_id   uuid not null references courses(id) on delete cascade,
  semester    int not null,
  credits     int not null default 3,
  created_at  timestamptz not null default now()
);

create index if not exists idx_subjects_course on subjects(course_id);

-- ---------------------------------------------------------------------------
-- academic_years
-- ---------------------------------------------------------------------------
create table if not exists academic_years (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  start_date  date not null,
  end_date    date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- holidays
-- ---------------------------------------------------------------------------
create table if not exists holidays (
  id               uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  date             date not null,
  description      text not null
);

create index if not exists idx_holidays_year on holidays(academic_year_id);

-- ---------------------------------------------------------------------------
-- faculty
-- ---------------------------------------------------------------------------
create table if not exists faculty (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references users(id) on delete cascade,
  department_id  uuid not null references departments(id) on delete restrict,
  designation    text,
  is_hod         boolean not null default false,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists idx_faculty_department on faculty(department_id);

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------
create table if not exists students (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references users(id) on delete cascade,
  roll_number      text not null unique,
  course_id        uuid not null references courses(id) on delete restrict,
  department_id    uuid not null references departments(id) on delete restrict,
  division         text not null,
  year             int not null,
  parent_user_id   uuid references users(id) on delete set null,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create index if not exists idx_students_department on students(department_id);
create index if not exists idx_students_course on students(course_id);
create index if not exists idx_students_division on students(division);
create index if not exists idx_students_parent on students(parent_user_id);

-- ---------------------------------------------------------------------------
-- sessions (attendance-taking lecture sessions)
-- ---------------------------------------------------------------------------
create table if not exists sessions (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references subjects(id) on delete cascade,
  faculty_id        uuid not null references faculty(id) on delete restrict,
  division          text not null,
  academic_year_id  uuid not null references academic_years(id) on delete restrict,
  session_date      date not null,
  start_time        time not null,
  end_time          time not null,
  status            text not null default 'Scheduled' check (status in ('Scheduled', 'Completed', 'Cancelled')),
  created_at        timestamptz not null default now()
);

create index if not exists idx_sessions_subject on sessions(subject_id);
create index if not exists idx_sessions_faculty on sessions(faculty_id);
create index if not exists idx_sessions_date on sessions(session_date);
create index if not exists idx_sessions_division on sessions(division);

-- ---------------------------------------------------------------------------
-- attendance_records
-- ---------------------------------------------------------------------------
create table if not exists attendance_records (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  student_id  uuid not null references students(id) on delete cascade,
  status      text not null check (status in ('Present', 'Absent', 'Late')),
  marked_at   timestamptz not null default now(),
  unique (session_id, student_id)
);

create index if not exists idx_attendance_session on attendance_records(session_id);
create index if not exists idx_attendance_student on attendance_records(student_id);

-- ---------------------------------------------------------------------------
-- marks
-- ---------------------------------------------------------------------------
create table if not exists marks (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references subjects(id) on delete cascade,
  student_id        uuid not null references students(id) on delete cascade,
  academic_year_id  uuid not null references academic_years(id) on delete restrict,
  q1                numeric not null default 0,
  q2                numeric not null default 0,
  q3                numeric not null default 0,
  total             numeric not null default 0,
  grade             text,
  published         boolean not null default false,
  updated_at        timestamptz not null default now(),
  unique (subject_id, student_id, academic_year_id)
);

create index if not exists idx_marks_subject on marks(subject_id);
create index if not exists idx_marks_student on marks(student_id);

-- ---------------------------------------------------------------------------
-- condonations
-- ---------------------------------------------------------------------------
create table if not exists condonations (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  subject_id    uuid not null references subjects(id) on delete cascade,
  reason        text not null,
  status        text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  applied_at    timestamptz not null default now(),
  reviewed_by   uuid references users(id) on delete set null,
  reviewed_at   timestamptz
);

create index if not exists idx_condonations_student on condonations(student_id);
create index if not exists idx_condonations_status on condonations(status);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  message     text not null,
  audience    text not null default 'all' check (audience in ('all', 'admin', 'hod', 'faculty', 'student', 'parent')),
  created_by  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_audience on notifications(audience);
