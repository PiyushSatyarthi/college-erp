/**
 * Thin wrapper around fetch that:
 * - Always targets relative URLs (Vite proxies /api → localhost:4000)
 * - Attaches the JWT token from localStorage on every request
 * - Throws a typed ApiError on non-2xx responses
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: { error?: string; details?: unknown } = {};
    try {
      errorBody = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, errorBody.error ?? res.statusText, errorBody.details);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                  => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown)  => request<T>('POST',   path, body),
  put:    <T>(path: string, body?: unknown)  => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body?: unknown)  => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                  => request<T>('DELETE', path),
};

// ---------------------------------------------------------------------------
// Typed response shapes (mirrors what the backend returns)
// ---------------------------------------------------------------------------

export type BackendRole = 'admin' | 'hod' | 'faculty' | 'student' | 'parent';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: BackendRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse extends AuthUser {
  phone: string | null;
  is_active: boolean;
  created_at: string;
  profile: unknown;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------
export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),

  me: () =>
    api.get<MeResponse>('/api/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/api/auth/change-password', { currentPassword, newPassword }),
};

// ---------------------------------------------------------------------------
// Dashboard endpoints
// ---------------------------------------------------------------------------
export const dashboardApi = {
  admin:   () => api.get('/api/dashboard/admin'),
  hod:     () => api.get('/api/dashboard/hod'),
  faculty: () => api.get('/api/dashboard/faculty'),
  student: () => api.get('/api/dashboard/student'),
};

// ---------------------------------------------------------------------------
// Admin resource endpoints
// ---------------------------------------------------------------------------
export const departmentsApi = {
  list:   ()         => api.get('/api/departments'),
  get:    (id: string) => api.get(`/api/departments/${id}`),
  create: (body: unknown) => api.post('/api/departments', body),
  update: (id: string, body: unknown) => api.put(`/api/departments/${id}`, body),
  delete: (id: string) => api.delete(`/api/departments/${id}`),
};

export const coursesApi = {
  list:   (params?: { departmentId?: string }) =>
    api.get(`/api/courses${params?.departmentId ? `?departmentId=${params.departmentId}` : ''}`),
  get:    (id: string) => api.get(`/api/courses/${id}`),
  create: (body: unknown) => api.post('/api/courses', body),
  update: (id: string, body: unknown) => api.put(`/api/courses/${id}`, body),
  delete: (id: string) => api.delete(`/api/courses/${id}`),
};

export const subjectsApi = {
  list:   (params?: { courseId?: string; semester?: number }) => {
    const qs = new URLSearchParams();
    if (params?.courseId)  qs.set('courseId',  params.courseId);
    if (params?.semester)  qs.set('semester',  String(params.semester));
    return api.get(`/api/subjects${qs.toString() ? `?${qs}` : ''}`);
  },
  get:    (id: string) => api.get(`/api/subjects/${id}`),
  create: (body: unknown) => api.post('/api/subjects', body),
  update: (id: string, body: unknown) => api.put(`/api/subjects/${id}`, body),
  delete: (id: string) => api.delete(`/api/subjects/${id}`),
};

export const studentsApi = {
  list: (params?: { departmentId?: string; division?: string; year?: number }) => {
    const qs = new URLSearchParams();
    if (params?.departmentId) qs.set('departmentId', params.departmentId);
    if (params?.division)     qs.set('division',     params.division);
    if (params?.year)         qs.set('year',         String(params.year));
    return api.get(`/api/students${qs.toString() ? `?${qs}` : ''}`);
  },
  get:        (id: string) => api.get(`/api/students/${id}`),
  create:     (body: unknown) => api.post('/api/students', body),
  update:     (id: string, body: unknown) => api.put(`/api/students/${id}`, body),
  deactivate: (id: string) => api.patch(`/api/students/${id}/deactivate`),
};

export const facultyApi = {
  list:       (params?: { departmentId?: string }) =>
    api.get(`/api/faculty${params?.departmentId ? `?departmentId=${params.departmentId}` : ''}`),
  get:        (id: string) => api.get(`/api/faculty/${id}`),
  create:     (body: unknown) => api.post('/api/faculty', body),
  update:     (id: string, body: unknown) => api.put(`/api/faculty/${id}`, body),
  deactivate: (id: string) => api.patch(`/api/faculty/${id}/deactivate`),
};

export const notificationsApi = {
  list:   () => api.get('/api/notifications'),
  create: (body: unknown) => api.post('/api/notifications', body),
};

export const academicYearApi = {
  current:     () => api.get('/api/academic-year/current'),
  create:      (body: unknown) => api.post('/api/academic-year', body),
  addHoliday:  (yearId: string, body: unknown) => api.post(`/api/academic-year/${yearId}/holidays`, body),
  getHolidays: (yearId: string) => api.get(`/api/academic-year/${yearId}/holidays`),
};

// ---------------------------------------------------------------------------
// Sessions & Attendance
// ---------------------------------------------------------------------------
export const sessionsApi = {
  list: (params?: { subjectId?: string; division?: string; date?: string }) => {
    const qs = new URLSearchParams();
    if (params?.subjectId) qs.set('subjectId', params.subjectId);
    if (params?.division)  qs.set('division',  params.division);
    if (params?.date)      qs.set('date',      params.date);
    return api.get(`/api/sessions${qs.toString() ? `?${qs}` : ''}`);
  },
  get:            (id: string) => api.get(`/api/sessions/${id}`),
  create:         (body: unknown) => api.post('/api/sessions', body),
  update:         (id: string, body: unknown) => api.put(`/api/sessions/${id}`, body),
  cancel:         (id: string) => api.patch(`/api/sessions/${id}/cancel`),
  markAttendance: (id: string, records: { studentId: string; status: string }[]) =>
    api.post(`/api/sessions/${id}/attendance`, { records }),
};

export const attendanceApi = {
  student: (studentId?: string) =>
    api.get(`/api/attendance/student${studentId ? `/${studentId}` : ''}`),
  summary: () => api.get('/api/attendance/summary'),
  today:   () => api.get('/api/attendance/today'),
};

// ---------------------------------------------------------------------------
// Marks
// ---------------------------------------------------------------------------
export const marksApi = {
  grid: (subjectId: string, division: string) =>
    api.get(`/api/marks?subjectId=${subjectId}&division=${division}`),
  bulk: (subjectId: string, entries: { studentId: string; q1: number; q2: number; q3: number }[]) =>
    api.post('/api/marks/bulk', { subjectId, entries }),
  publish: (subjectId: string, division: string) =>
    api.post('/api/marks/publish', { subjectId, division }),
  student: (studentId?: string) =>
    api.get(`/api/marks/student${studentId ? `/${studentId}` : ''}`),
  gradeDistribution: (subjectId: string, division?: string) =>
    api.get(`/api/marks/grade-distribution?subjectId=${subjectId}${division ? `&division=${division}` : ''}`),
};

// ---------------------------------------------------------------------------
// Condonations
// ---------------------------------------------------------------------------
export const condonationsApi = {
  list:    (status?: string) => api.get(`/api/condonations${status ? `?status=${status}` : ''}`),
  mine:    () => api.get('/api/condonations/mine'),
  apply:   (subjectId: string, reason: string) => api.post('/api/condonations', { subjectId, reason }),
  approve: (id: string) => api.patch(`/api/condonations/${id}/approve`),
  reject:  (id: string) => api.patch(`/api/condonations/${id}/reject`),
};

// ---------------------------------------------------------------------------
// Faculty-subject assignments
// ---------------------------------------------------------------------------
export const assignmentsApi = {
  list:       (params?: { facultyId?: string; subjectId?: string; division?: string }) => {
    const qs = new URLSearchParams();
    if (params?.facultyId)  qs.set('facultyId',  params.facultyId);
    if (params?.subjectId)  qs.set('subjectId',  params.subjectId);
    if (params?.division)   qs.set('division',   params.division);
    return api.get(`/api/assignments${qs.toString() ? `?${qs}` : ''}`);
  },
  mySubjects: () => api.get('/api/assignments/my-subjects'),
  create:     (body: unknown) => api.post('/api/assignments', body),
  delete:     (id: string) => api.delete(`/api/assignments/${id}`),
};
