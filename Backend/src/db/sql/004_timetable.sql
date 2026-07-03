-- 004_timetable.sql
-- Recurring weekly schedule template, separate from `sessions` (which are
-- dated, attendance-tracked lecture instances). A timetable_slot says
-- "every Monday 9-10am, Division A has Data Structures with Prof. X in
-- Room 204" — it does not itself generate attendance-trackable sessions.

create table if not exists timetable_slots (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid not null references courses(id) on delete cascade,
  division          text not null,
  academic_year_id  uuid not null references academic_years(id) on delete cascade,
  day_of_week       int not null check (day_of_week between 0 and 6), -- 0=Mon .. 6=Sun
  start_time        time not null,
  end_time          time not null,
  subject_id        uuid references subjects(id) on delete set null,
  faculty_id        uuid references faculty(id) on delete set null,
  room              text,
  created_at        timestamptz not null default now(),
  unique (course_id, division, academic_year_id, day_of_week, start_time)
);

create index if not exists idx_timetable_course_div on timetable_slots(course_id, division);
create index if not exists idx_timetable_year on timetable_slots(academic_year_id);
create index if not exists idx_timetable_faculty on timetable_slots(faculty_id);
