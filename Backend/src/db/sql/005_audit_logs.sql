-- 005_audit_logs.sql
-- System-wide activity trail. User name and email are denormalized
-- (copied at write time) so the log entry remains readable even if the
-- underlying user is later deleted.

create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  user_name   text not null,
  user_email  text not null,
  action      text not null,            -- e.g. 'LOGIN', 'CREATE_STUDENT', 'DELETE_COURSE'
  module      text not null,            -- e.g. 'Auth', 'Students', 'Courses'
  status      text not null default 'Success' check (status in ('Success', 'Failed')),
  ip_address  text,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on audit_logs(created_at desc);
create index if not exists idx_audit_logs_module on audit_logs(module);
create index if not exists idx_audit_logs_user on audit_logs(user_id);
