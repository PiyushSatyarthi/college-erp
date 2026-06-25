import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { academicYearRouter } from './routes/academicYear.js';
import { attendanceRouter } from './routes/attendance.js';
import { authRouter } from './routes/auth.js';
import { condonationsRouter } from './routes/condonations.js';
import { coursesRouter } from './routes/courses.js';
import { dashboardRouter } from './routes/dashboard.js';
import { departmentsRouter } from './routes/departments.js';
import { facultyRouter } from './routes/faculty.js';
import { healthRouter } from './routes/health.js';
import { marksRouter } from './routes/marks.js';
import { notificationsRouter } from './routes/notifications.js';
import { sessionsRouter } from './routes/sessions.js';
import { studentsRouter } from './routes/students.js';
import { subjectsRouter } from './routes/subjects.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/marks', marksRouter);
app.use('/api/condonations', condonationsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/academic-year', academicYearRouter);
app.use('/api/dashboard', dashboardRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);
