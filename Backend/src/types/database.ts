// Hand-written types mirroring src/db/sql/001_init.sql.
// Used only as the generic parameter for the Supabase client so that
// `.from('table').select()` calls get reasonable type-checking/autocomplete.

type Role = 'admin' | 'hod' | 'faculty' | 'student' | 'parent';
type SessionStatus = 'Scheduled' | 'Completed' | 'Cancelled';
type AttendanceStatus = 'Present' | 'Absent' | 'Late';
type CondonationStatus = 'Pending' | 'Approved' | 'Rejected';
type NotificationAudience = 'all' | Role;

interface UsersRow {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DepartmentsRow {
  id: string;
  name: string;
  code: string;
  hod_user_id: string | null;
  created_at: string;
}

interface CoursesRow {
  id: string;
  name: string;
  code: string;
  department_id: string;
  duration_years: number;
  created_at: string;
}

interface SubjectsRow {
  id: string;
  name: string;
  code: string;
  course_id: string;
  semester: number;
  credits: number;
  created_at: string;
}

interface AcademicYearsRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

interface HolidaysRow {
  id: string;
  academic_year_id: string;
  date: string;
  description: string;
}

interface FacultyRow {
  id: string;
  user_id: string;
  department_id: string;
  designation: string | null;
  is_hod: boolean;
  is_active: boolean;
  created_at: string;
}

interface StudentsRow {
  id: string;
  user_id: string;
  roll_number: string;
  course_id: string;
  department_id: string;
  division: string;
  year: number;
  parent_user_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface SessionsRow {
  id: string;
  subject_id: string;
  faculty_id: string;
  division: string;
  academic_year_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  created_at: string;
}

interface AttendanceRecordsRow {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  marked_at: string;
}

interface MarksRow {
  id: string;
  subject_id: string;
  student_id: string;
  academic_year_id: string;
  q1: number;
  q2: number;
  q3: number;
  total: number;
  grade: string | null;
  published: boolean;
  updated_at: string;
}

interface CondonationsRow {
  id: string;
  student_id: string;
  subject_id: string;
  reason: string;
  status: CondonationStatus;
  applied_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

interface NotificationsRow {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  created_by: string | null;
  created_at: string;
}

interface GradingSchemesRow {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

interface GradingBandsRow {
  id: string;
  scheme_id: string;
  grade: string;
  min_percentage: number;
  sort_order: number;
}

interface TimetableSlotsRow {
  id: string;
  course_id: string;
  division: string;
  academic_year_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_id: string | null;
  faculty_id: string | null;
  room: string | null;
  created_at: string;
}

interface AuditLogsRow {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string;
  action: string;
  module: string;
  status: 'Success' | 'Failed';
  ip_address: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

type Table<Row, OptionalInsertKeys extends keyof Row> = {
  Row: Row;
  Insert: Omit<Row, OptionalInsertKeys> & Partial<Pick<Row, OptionalInsertKeys>>;
  Update: Partial<Row>;
};

export interface Database {
  public: {
    Tables: {
      users: Table<UsersRow, 'id' | 'phone' | 'is_active' | 'created_at' | 'updated_at'>;
      departments: Table<DepartmentsRow, 'id' | 'hod_user_id' | 'created_at'>;
      courses: Table<CoursesRow, 'id' | 'duration_years' | 'created_at'>;
      subjects: Table<SubjectsRow, 'id' | 'credits' | 'created_at'>;
      academic_years: Table<AcademicYearsRow, 'id' | 'is_current' | 'created_at'>;
      holidays: Table<HolidaysRow, 'id'>;
      faculty: Table<FacultyRow, 'id' | 'designation' | 'is_hod' | 'is_active' | 'created_at'>;
      students: Table<StudentsRow, 'id' | 'parent_user_id' | 'is_active' | 'created_at'>;
      sessions: Table<SessionsRow, 'id' | 'status' | 'created_at'>;
      attendance_records: Table<AttendanceRecordsRow, 'id' | 'marked_at'>;
      marks: Table<MarksRow, 'id' | 'q1' | 'q2' | 'q3' | 'total' | 'grade' | 'published' | 'updated_at'>;
      condonations: Table<CondonationsRow, 'id' | 'status' | 'applied_at' | 'reviewed_by' | 'reviewed_at'>;
      notifications: Table<NotificationsRow, 'id' | 'audience' | 'created_by' | 'created_at'>;
      grading_schemes: Table<GradingSchemesRow, 'id' | 'is_default' | 'created_at'>;
      grading_bands: Table<GradingBandsRow, 'id' | 'sort_order'>;
      timetable_slots: Table<TimetableSlotsRow, 'id' | 'subject_id' | 'faculty_id' | 'room' | 'created_at'>;
      audit_logs: Table<AuditLogsRow, 'id' | 'user_id' | 'status' | 'ip_address' | 'details' | 'created_at'>;
    };
  };
}

export type { Role, SessionStatus, AttendanceStatus, CondonationStatus, NotificationAudience };
