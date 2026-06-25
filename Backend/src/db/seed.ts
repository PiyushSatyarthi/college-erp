/**
 * db:seed — inserts representative sample data.
 * Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING throughout.
 *
 * All users share the password: password123
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const SALT_ROUNDS = 10;

async function hash(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
async function upsertUser(
  client: pg.Client,
  {
    email,
    name,
    role,
    phone,
    password = 'password123',
  }: { email: string; name: string; role: string; phone?: string; password?: string }
) {
  const h = await hash(password);
  const { rows } = await client.query<{ id: string }>(
    `insert into users (email, password_hash, role, name, phone)
     values ($1, $2, $3, $4, $5)
     on conflict (email) do update set name = excluded.name
     returning id`,
    [email, h, role, name, phone ?? null]
  );
  return rows[0].id;
}

async function upsertRow(
  client: pg.Client,
  table: string,
  uniqueCol: string,
  uniqueVal: unknown,
  columns: string[],
  values: unknown[]
): Promise<string> {
  const cols = columns.join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const updates = columns
    .filter((c) => c !== uniqueCol)
    .map((c) => `${c} = excluded.${c}`)
    .join(', ');

  const { rows } = await client.query<{ id: string }>(
    `insert into ${table} (${cols})
     values (${placeholders})
     on conflict (${uniqueCol}) do update set ${updates}
     returning id`,
    values
  );
  return rows[0].id;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function seed() {
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    // ── Academic year ────────────────────────────────────────────────────────
    await client.query(`update academic_years set is_current = false`);
    const { rows: yearRows } = await client.query<{ id: string }>(
      `insert into academic_years (name, start_date, end_date, is_current)
       values ('2024-25', '2024-06-01', '2025-05-31', true)
       on conflict (name) do update set is_current = true
       returning id`
    );
    const yearId = yearRows[0].id;
    console.log('academic_year:', yearId);

    // ── Admin user ───────────────────────────────────────────────────────────
    const adminId = await upsertUser(client, {
      email: 'admin@college.ac.in',
      name: 'System Admin',
      role: 'admin',
    });
    console.log('admin user:', adminId);

    // ── Department & HOD user ────────────────────────────────────────────────
    const hodUserId = await upsertUser(client, {
      email: 'hod.comp@college.ac.in',
      name: 'Dr. Meena Rao',
      role: 'hod',
    });

    const { rows: deptRows } = await client.query<{ id: string }>(
      `insert into departments (name, code, hod_user_id)
       values ('Computer Science', 'CS', $1)
       on conflict (code) do update set hod_user_id = excluded.hod_user_id
       returning id`,
      [hodUserId]
    );
    const deptId = deptRows[0].id;
    console.log('department:', deptId);

    await client.query(
      `insert into faculty (user_id, department_id, designation, is_hod)
       values ($1, $2, 'Professor & HOD', true)
       on conflict (user_id) do update set department_id = excluded.department_id, is_hod = excluded.is_hod`,
      [hodUserId, deptId]
    );

    // ── Course ───────────────────────────────────────────────────────────────
    const { rows: courseRows } = await client.query<{ id: string }>(
      `insert into courses (name, code, department_id, duration_years)
       values ('B.E. Computer Engineering', 'BE-COMP', $1, 4)
       on conflict (code) do update set name = excluded.name
       returning id`,
      [deptId]
    );
    const courseId = courseRows[0].id;
    console.log('course:', courseId);

    // ── Subjects (semester 1–2 sample) ───────────────────────────────────────
    const subjects = [
      { name: 'Engineering Mathematics I', code: 'EM1', semester: 1, credits: 4 },
      { name: 'Basic Electronics', code: 'BEL', semester: 1, credits: 3 },
      { name: 'Programming in C', code: 'PIC', semester: 1, credits: 4 },
      { name: 'Engineering Mathematics II', code: 'EM2', semester: 2, credits: 4 },
      { name: 'Data Structures', code: 'DS', semester: 2, credits: 4 },
      { name: 'Object Oriented Programming', code: 'OOP', semester: 2, credits: 4 },
    ];

    const subjectIds: Record<string, string> = {};
    for (const s of subjects) {
      const { rows } = await client.query<{ id: string }>(
        `insert into subjects (name, code, course_id, semester, credits)
         values ($1, $2, $3, $4, $5)
         on conflict (code) do update set name = excluded.name
         returning id`,
        [s.name, s.code, courseId, s.semester, s.credits]
      );
      subjectIds[s.code] = rows[0].id;
      console.log(`subject ${s.code}:`, rows[0].id);
    }

    // ── Faculty ───────────────────────────────────────────────────────────────
    const facultyUserId = await upsertUser(client, {
      email: 'suresh@college.edu',
      name: 'Prof. Suresh Kumar',
      role: 'faculty',
    });

    const { rows: facultyRows } = await client.query<{ id: string }>(
      `insert into faculty (user_id, department_id, designation)
       values ($1, $2, 'Assistant Professor')
       on conflict (user_id) do update set department_id = excluded.department_id
       returning id`,
      [facultyUserId, deptId]
    );
    const facultyId = facultyRows[0].id;
    console.log('faculty:', facultyId);

    // ── Parent user ───────────────────────────────────────────────────────────
    const parentUserId = await upsertUser(client, {
      email: 'parent.sharma@college.ac.in',
      name: 'Ramesh Sharma',
      role: 'parent',
    });
    console.log('parent user:', parentUserId);

    // ── Student ───────────────────────────────────────────────────────────────
    const studentUserId = await upsertUser(client, {
      email: 'rahul@college.edu',
      name: 'Rahul Sharma',
      role: 'student',
    });

    const { rows: studentRows } = await client.query<{ id: string }>(
      `insert into students (user_id, roll_number, course_id, department_id, division, year, parent_user_id)
       values ($1, 'COMP2024001', $2, $3, 'A', 1, $4)
       on conflict (roll_number) do update set user_id = excluded.user_id
       returning id`,
      [studentUserId, courseId, deptId, parentUserId]
    );
    const studentId = studentRows[0].id;
    console.log('student:', studentId);

    // ── A second student without parent ───────────────────────────────────────
    const student2UserId = await upsertUser(client, {
      email: 'priya@college.edu',
      name: 'Priya Patel',
      role: 'student',
    });
    const { rows: student2Rows } = await client.query<{ id: string }>(
      `insert into students (user_id, roll_number, course_id, department_id, division, year)
       values ($1, 'COMP2024002', $2, $3, 'A', 1)
       on conflict (roll_number) do update set user_id = excluded.user_id
       returning id`,
      [student2UserId, courseId, deptId]
    );
    const student2Id = student2Rows[0].id;
    console.log('student2:', student2Id);

    // ── Faculty subject assignments ────────────────────────────────────────────
    for (const code of ['PIC', 'EM1', 'BEL']) {
      await client.query(
        `insert into faculty_subject_assignments (faculty_id, subject_id, division, academic_year_id)
         values ($1, $2, 'A', $3)
         on conflict (faculty_id, subject_id, division, academic_year_id) do nothing`,
        [facultyId, subjectIds[code], yearId]
      );
    }
    console.log('faculty assignments seeded');

    // ── Sessions for the two semester-1 subjects ──────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    interface SessionSeed {
      subjectCode: string;
      date: string;
      start: string;
      end: string;
      status: 'Completed' | 'Scheduled' | 'Cancelled';
    }

    const sessions: SessionSeed[] = [
      { subjectCode: 'PIC', date: yesterday, start: '09:00', end: '10:00', status: 'Completed' },
      { subjectCode: 'EM1', date: yesterday, start: '11:00', end: '12:00', status: 'Completed' },
      { subjectCode: 'PIC', date: today, start: '09:00', end: '10:00', status: 'Scheduled' },
      { subjectCode: 'BEL', date: today, start: '14:00', end: '15:00', status: 'Scheduled' },
    ];

    const sessionIds: string[] = [];
    for (const s of sessions) {
      const { rows } = await client.query<{ id: string }>(
        `insert into sessions (subject_id, faculty_id, division, academic_year_id, session_date, start_time, end_time, status)
         values ($1, $2, 'A', $3, $4, $5, $6, $7)
         on conflict do nothing
         returning id`,
        [subjectIds[s.subjectCode], facultyId, yearId, s.date, s.start, s.end, s.status]
      );
      if (rows.length) sessionIds.push(rows[0].id);
    }
    console.log('sessions seeded:', sessionIds.length);

    // ── Attendance for completed sessions ─────────────────────────────────────
    for (const sessionId of sessionIds) {
      const { rows: sessionInfo } = await client.query<{ status: string }>(`select status from sessions where id = $1`, [sessionId]);
      if (sessionInfo[0]?.status !== 'Completed') continue;

      for (const sid of [studentId, student2Id]) {
        await client.query(
          `insert into attendance_records (session_id, student_id, status)
           values ($1, $2, 'Present')
           on conflict (session_id, student_id) do nothing`,
          [sessionId, sid]
        );
      }
    }
    console.log('attendance seeded');

    // ── Marks ─────────────────────────────────────────────────────────────────
    const markEntries = [
      { studentId, subjectCode: 'PIC', q1: 17, q2: 15, q3: 18 },
      { studentId, subjectCode: 'EM1', q1: 14, q2: 16, q3: 13 },
      { studentId: student2Id, subjectCode: 'PIC', q1: 19, q2: 18, q3: 20 },
      { studentId: student2Id, subjectCode: 'EM1', q1: 12, q2: 11, q3: 14 },
    ];

    for (const m of markEntries) {
      const total = m.q1 + m.q2 + m.q3;
      const pct = (total / 60) * 100;
      const grade =
        pct >= 90 ? 'O' : pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B+' : pct >= 50 ? 'B' : pct >= 40 ? 'C' : 'F';

      await client.query(
        `insert into marks (subject_id, student_id, academic_year_id, q1, q2, q3, total, grade, published)
         values ($1, $2, $3, $4, $5, $6, $7, $8, true)
         on conflict (subject_id, student_id, academic_year_id) do update
         set q1 = excluded.q1, q2 = excluded.q2, q3 = excluded.q3,
             total = excluded.total, grade = excluded.grade`,
        [subjectIds[m.subjectCode], m.studentId, yearId, m.q1, m.q2, m.q3, total, grade]
      );
    }
    console.log('marks seeded');

    // ── Notifications ─────────────────────────────────────────────────────────
    const notifications = [
      { title: 'Welcome to 2024-25', message: 'The new academic year has begun. Attendance is mandatory.', audience: 'all' },
      { title: 'Exam Schedule Released', message: 'Unit Test 1 is scheduled from 10th to 15th August.', audience: 'student' },
      { title: 'Faculty Meeting', message: 'All faculty to report for department meeting on Monday at 10am.', audience: 'faculty' },
    ];

    for (const n of notifications) {
      await client.query(
        `insert into notifications (title, message, audience, created_by)
         values ($1, $2, $3, $4)
         on conflict do nothing`,
        [n.title, n.message, n.audience, adminId]
      );
    }
    console.log('notifications seeded');

    // ── Condonation request ───────────────────────────────────────────────────
    await client.query(
      `insert into condonations (student_id, subject_id, reason, status)
       values ($1, $2, 'Was hospitalised for 5 days during the missed classes.', 'Pending')
       on conflict do nothing`,
      [studentId, subjectIds['EM1']]
    );
    console.log('condonation seeded');

    // ── Holiday ───────────────────────────────────────────────────────────────
    await client.query(
      `insert into holidays (academic_year_id, date, description)
       values ($1, '2025-01-26', 'Republic Day')
       on conflict do nothing`,
      [yearId]
    );
    console.log('holiday seeded');

    console.log('\n✅ Seed complete. All users → password: password123');
    console.log(`   admin@college.ac.in       (admin)`);
    console.log(`   hod.comp@college.ac.in    (hod)`);
    console.log(`   suresh@college.edu         (faculty)`);
    console.log(`   rahul@college.edu          (student)`);
    console.log(`   priya@college.edu          (student)`);
    console.log(`   parent.sharma@college.ac.in (parent)`);
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
