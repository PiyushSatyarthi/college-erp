import './config/env.js'; // validate env first, before anything else imports it
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { departmentsRouter } from './routes/departments.routes.js';
import { coursesRouter } from './routes/courses.routes.js';
import { subjectsRouter } from './routes/subjects.routes.js';
import { studentsRouter } from './routes/students.routes.js';
import { facultyRouter } from './routes/faculty.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { academicYearRouter } from './routes/academicYear.routes.js';
import { sessionsRouter } from './routes/sessions.routes.js';
import { attendanceRouter } from './routes/attendance.routes.js';
import { marksRouter } from './routes/marks.routes.js';
import { condonationsRouter } from './routes/condonations.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { assignmentsRouter } from './routes/assignments.routes.js';

const app = express();

// ── Security & logging ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/academic-year', academicYearRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/marks', marksRouter);
app.use('/api/condonations', condonationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/assignments', assignmentsRouter);

// ── Catch-all & error handling ────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}  [${env.NODE_ENV}]`);
});

export default app;
