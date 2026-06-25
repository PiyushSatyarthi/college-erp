import { Router } from 'express';
import { db } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get(
  '/admin',
  authorize('Admin'),
  asyncHandler(async (_req, res) => {
    const [[students], [faculty], [condonations], [attendanceToday], [attendanceByDept], [gradeDist]] = await Promise.all([
      db.query<{ count: number }[]>('SELECT COUNT(*) AS count FROM students WHERE status = ?', ['Active']),
      db.query<{ count: number }[]>('SELECT COUNT(*) AS count FROM faculty_profiles fp JOIN users u ON u.id = fp.user_id WHERE u.status = ?', ['Active']),
      db.query<{ count: number }[]>("SELECT COUNT(*) AS count FROM condonations WHERE status = 'Pending'"),
      db.query<{ present: number; total: number }[]>(
        `SELECT SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END) AS present, COUNT(ar.id) AS total
         FROM attendance_sessions sess JOIN attendance_records ar ON ar.session_id = sess.id
         WHERE sess.session_date = CURDATE() AND sess.status = 'Completed'`,
      ),
      db.query(
        `SELECT d.code AS name,
                ROUND(COALESCE(SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END), 0)
                / NULLIF(COUNT(ar.id), 0) * 100, 0) AS value
         FROM departments d
         JOIN courses c ON c.department_id = d.id
         JOIN students s ON s.course_id = c.id
         LEFT JOIN attendance_records ar ON ar.student_id = s.id
         GROUP BY d.id, d.code`,
      ),
      db.query(
        `SELECT grade AS name, COUNT(*) AS value FROM (
           SELECT CASE
             WHEN total >= 90 THEN 'O' WHEN total >= 80 THEN 'A+'
             WHEN total >= 70 THEN 'A' WHEN total >= 60 THEN 'B+'
             WHEN total >= 50 THEN 'B' WHEN total >= 40 THEN 'C' ELSE 'F'
           END AS grade
           FROM (SELECT s.id, COALESCE(SUM(m.score), 0) AS total FROM students s LEFT JOIN marks m ON m.student_id = s.id GROUP BY s.id) t
         ) g GROUP BY grade`,
      ),
    ]);

    const totalStudents = (students as { count: number }[])[0]?.count ?? 0;
    const totalFaculty = (faculty as { count: number }[])[0]?.count ?? 0;
    const pendingCondonations = (condonations as { count: number }[])[0]?.count ?? 0;
    const todayStats = (attendanceToday as { present: number; total: number }[])[0];
    const todayTotal = Number(todayStats?.total) || 0;
    const todayPresent = Number(todayStats?.present) || 0;

    res.json({
      data: {
        stats: {
          totalStudents,
          totalFaculty,
          todayAttendancePct: todayTotal ? Math.round((todayPresent / todayTotal) * 100) : 0,
          todayPresent,
          todayTotal,
          pendingCondonations,
        },
        attendanceByDepartment: attendanceByDept[0],
        gradeDistribution: gradeDist[0],
      },
    });
  }),
);

dashboardRouter.get(
  '/faculty',
  authorize('Faculty'),
  asyncHandler(async (req, res) => {
    const facultyId = req.user!.id;

    const [sessionStats] = await db.query<{ upcoming: number; completed: number }[]>(
      `SELECT
         SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) AS upcoming,
         SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed
       FROM attendance_sessions WHERE faculty_id = ?`,
      [facultyId],
    );

    const [subjectCount] = await db.query<{ count: number }[]>(
      'SELECT COUNT(*) AS count FROM subjects WHERE faculty_id = ?',
      [facultyId],
    );

    res.json({
      data: {
        upcomingSessions: Number((sessionStats as { upcoming: number }[])[0]?.upcoming) || 0,
        completedSessions: Number((sessionStats as { upcoming: number; completed: number }[])[0]?.completed) || 0,
        assignedSubjects: (subjectCount as { count: number }[])[0]?.count ?? 0,
      },
    });
  }),
);

dashboardRouter.get(
  '/student',
  authorize('Student'),
  asyncHandler(async (req, res) => {
    const [studentRows] = await db.query<{ id: number; semester: number }[]>(
      'SELECT id, semester FROM students WHERE user_id = ?',
      [req.user!.id],
    );
    const student = (studentRows as { id: number; semester: number }[])[0];
    if (!student) throw new HttpError(404, 'Student profile not found');

    const [attRows] = await db.query<{ att: number }[]>(
      `SELECT ROUND(
         COALESCE(SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END), 0)
         / NULLIF(COUNT(ar.id), 0) * 100, 0
       ) AS att FROM attendance_records ar WHERE ar.student_id = ?`,
      [student.id],
    );

    const [marksRows] = await db.query<{ avgScore: number }[]>(
      'SELECT ROUND(AVG(score), 1) AS avgScore FROM marks WHERE student_id = ? AND status = ?',
      [student.id, 'Published'],
    );

    const [notifCount] = await db.query<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM notifications n
       LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
       WHERE n.target_role IN ('All', 'Student') AND nr.id IS NULL`,
      [req.user!.id],
    );

    res.json({
      data: {
        semester: student.semester,
        overallAttendance: Number((attRows as { att: number }[])[0]?.att) || 0,
        averageMarks: Number((marksRows as { avgScore: number }[])[0]?.avgScore) || 0,
        unreadNotifications: (notifCount as { count: number }[])[0]?.count ?? 0,
      },
    });
  }),
);

dashboardRouter.get(
  '/hod',
  authorize('HOD'),
  asyncHandler(async (req, res) => {
    const [deptRows] = await db.query<{ id: number; code: string }[]>(
      'SELECT id, code FROM departments WHERE hod_user_id = ?',
      [req.user!.id],
    );
    const dept = (deptRows as { id: number; code: string }[])[0];

    if (!dept) {
      res.json({ data: { department: null, stats: {} } });
      return;
    }

    const [studentCount] = await db.query<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM students s
       JOIN courses c ON c.id = s.course_id WHERE c.department_id = ?`,
      [dept.id],
    );

    const [pendingCondonations] = await db.query<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM condonations c
       JOIN students s ON s.id = c.student_id
       JOIN courses co ON co.id = s.course_id
       WHERE co.department_id = ? AND c.status = 'Pending'`,
      [dept.id],
    );

    const [attendance] = await db.query<{ value: number }[]>(
      `SELECT ROUND(
         COALESCE(SUM(CASE WHEN ar.status IN ('Present','Late') THEN 1 ELSE 0 END), 0)
         / NULLIF(COUNT(ar.id), 0) * 100, 0
       ) AS value
       FROM students s
       JOIN courses c ON c.id = s.course_id
       LEFT JOIN attendance_records ar ON ar.student_id = s.id
       WHERE c.department_id = ?`,
      [dept.id],
    );

    res.json({
      data: {
        department: dept,
        stats: {
          students: (studentCount as { count: number }[])[0]?.count ?? 0,
          pendingCondonations: (pendingCondonations as { count: number }[])[0]?.count ?? 0,
          departmentAttendance: Number((attendance as { value: number }[])[0]?.value) || 0,
        },
      },
    });
  }),
);
