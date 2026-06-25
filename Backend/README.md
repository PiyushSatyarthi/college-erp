# University Attendance Backend

Express + TypeScript REST API for the Attendance & Marks Management frontend.  
Database: **Supabase (PostgreSQL)** via `@supabase/supabase-js`.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Supabase project | Free tier is fine |

---

## Setup

```powershell
cd Backend
npm install
Copy-Item .env.example .env
# → fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, JWT_SECRET
npm run db:migrate   # creates all tables in your Supabase database
npm run db:seed      # inserts sample departments / users / sessions / marks
npm run dev          # hot-reload dev server on http://localhost:4000
```

---

## Environment variables

Get these from your [Supabase project dashboard](https://app.supabase.com):

| Variable | Where to find it |
|----------|-----------------|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role (secret) key |
| `DATABASE_URL` | Project Settings → Database → Connection string → URI |
| `JWT_SECRET` | Any random string ≥ 32 chars |
| `JWT_EXPIRES_IN` | e.g. `8h`, `1d` (default `8h`) |

Full `.env` example:

```text
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:3000

SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...
DATABASE_URL=postgresql://postgres:your-password@db.xxxx.supabase.co:5432/postgres

JWT_SECRET=super-secret-random-string-change-before-prod
JWT_EXPIRES_IN=8h
```

> ⚠️ **Never expose `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET` to the frontend.**  
> The service-role key bypasses Supabase Row Level Security; all access control
> is handled in Express middleware instead.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run lint` | Type-check without emitting |
| `npm run db:migrate` | Create / update database tables (idempotent) |
| `npm run db:seed` | Insert sample data (idempotent – uses ON CONFLICT DO NOTHING) |

---

## Architecture

```
src/
├── config/
│   ├── env.ts          # Zod-validated environment loader
│   └── supabase.ts     # Service-role Supabase client
├── db/
│   ├── migrate.ts      # Migration runner (direct pg connection for DDL)
│   ├── seed.ts         # Sample data
│   └── sql/
│       └── 001_init.sql
├── middleware/
│   ├── auth.ts         # requireAuth + requireRole guards
│   └── errorHandler.ts # Global error + 404 handlers
├── routes/             # One file per resource
│   ├── health.routes.ts
│   ├── auth.routes.ts
│   ├── departments.routes.ts
│   ├── courses.routes.ts
│   ├── subjects.routes.ts
│   ├── students.routes.ts
│   ├── faculty.routes.ts
│   ├── notifications.routes.ts
│   ├── academicYear.routes.ts
│   ├── sessions.routes.ts
│   ├── attendance.routes.ts
│   ├── marks.routes.ts
│   ├── condonations.routes.ts
│   └── dashboard.routes.ts
├── types/
│   ├── database.ts     # Hand-written DB types for Supabase client generic
│   └── express.d.ts    # Augments Express Request with req.user
├── utils/
│   ├── ApiError.ts     # Typed HTTP error class
│   ├── asyncHandler.ts # Wraps async route handlers for error forwarding
│   ├── grading.ts      # computeTotal / computeGrade helpers
│   ├── jwt.ts          # signToken / verifyToken
│   ├── lookups.ts      # Shared DB helpers (getFacultyByUserId etc.)
│   ├── password.ts     # bcrypt hash / compare
│   └── unwrap.ts       # Converts Supabase PostgrestError → ApiError
└── server.ts           # Express app + route wiring
```

---

## Seed Users

All seed users use password: `password123`

| Email | Role |
|-------|------|
| admin@college.ac.in | Admin |
| hod.comp@college.ac.in | HOD |
| suresh@college.edu | Faculty |
| rahul@college.edu | Student |
| priya@college.edu | Student |
| parent.sharma@college.ac.in | Parent |

---

## API Reference

All `/api/*` routes except `POST /api/auth/login` require:
```
Authorization: Bearer <token>
```

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status |
| GET | `/health/db` | Supabase connectivity check |

### Auth

| Method | Path | Body / Notes |
|--------|------|-------------|
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Current user + role profile |
| POST | `/api/auth/change-password` | `{ currentPassword, newPassword }` |

### Departments

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/departments` | all |
| GET | `/api/departments/:id` | all |
| POST | `/api/departments` | admin |
| PUT | `/api/departments/:id` | admin |
| DELETE | `/api/departments/:id` | admin |

### Courses

`?departmentId=` filter available on GET /

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/courses` | all |
| GET | `/api/courses/:id` | all |
| POST | `/api/courses` | admin |
| PUT | `/api/courses/:id` | admin |
| DELETE | `/api/courses/:id` | admin |

### Subjects

`?courseId=` `?semester=` filters available on GET /

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/subjects` | all |
| GET | `/api/subjects/:id` | all |
| POST | `/api/subjects` | admin |
| PUT | `/api/subjects/:id` | admin |
| DELETE | `/api/subjects/:id` | admin |

### Students

`?departmentId=` `?courseId=` `?division=` `?year=` filters on GET /

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/students` | admin, hod, faculty |
| GET | `/api/students/:id` | all |
| POST | `/api/students` | admin |
| PUT | `/api/students/:id` | admin |
| PATCH | `/api/students/:id/deactivate` | admin |

POST body creates a user account automatically. Optionally nest `parent` object to create a parent account in the same request.

### Faculty

`?departmentId=` filter on GET /

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/faculty` | admin, hod |
| GET | `/api/faculty/:id` | all |
| POST | `/api/faculty` | admin |
| PUT | `/api/faculty/:id` | admin |
| PATCH | `/api/faculty/:id/deactivate` | admin |

### Notifications

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/notifications` | all (filtered to own audience) |
| POST | `/api/notifications` | admin, hod |

### Academic Year

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/academic-year/current` | all |
| POST | `/api/academic-year` | admin |
| GET | `/api/academic-year/:yearId/holidays` | all |
| POST | `/api/academic-year/:yearId/holidays` | admin |

### Sessions

`?facultyId=` `?subjectId=` `?division=` `?date=` filters on GET /

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/sessions` | all |
| POST | `/api/sessions` | faculty, hod |
| PUT | `/api/sessions/:id` | faculty, hod |
| GET | `/api/sessions/:id` | all (includes student roster + current attendance) |
| POST | `/api/sessions/:id/attendance` | faculty, hod |
| PATCH | `/api/sessions/:id/cancel` | faculty, hod |

### Attendance

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/attendance/student/:studentId?` | student sees own; parent sees child's; admin/faculty provide studentId |
| GET | `/api/attendance/summary` | admin, hod |
| GET | `/api/attendance/today` | admin, hod, faculty |

### Marks

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/marks?subjectId=&division=` | Faculty marks-entry grid |
| POST | `/api/marks/bulk` | `{ subjectId, entries: [{ studentId, q1, q2, q3 }] }` |
| POST | `/api/marks/publish` | `{ subjectId, division }` — makes marks visible to students |
| GET | `/api/marks/student/:studentId?` | Student/parent view (published only); faculty see all |
| GET | `/api/marks/grade-distribution?subjectId=&division=` | Grade histogram data |

### Condonations

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/condonations?status=Pending` | admin, hod, faculty |
| GET | `/api/condonations/mine` | student |
| POST | `/api/condonations` | student |
| PATCH | `/api/condonations/:id/approve` | admin, hod, faculty |
| PATCH | `/api/condonations/:id/reject` | admin, hod, faculty |

### Dashboards

| Method | Path | Roles |
|--------|------|-------|
| GET | `/api/dashboard/admin` | admin |
| GET | `/api/dashboard/hod` | hod |
| GET | `/api/dashboard/faculty` | faculty |
| GET | `/api/dashboard/student` | student |

---

## Grading Scale

Marks are out of 20 each (Q1 + Q2 + Q3 = 60 max).

| Grade | % Range |
|-------|---------|
| O | ≥ 90% |
| A+ | 80–89% |
| A | 70–79% |
| B+ | 60–69% |
| B | 50–59% |
| C | 40–49% |
| F | < 40% |

---

## Error format

All errors return:
```json
{
  "error": "Human-readable message",
  "details": { }   // optional, present for validation errors
}
```
