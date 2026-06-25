import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAuth } from './components/RequireAuth';
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HodDashboard } from './pages/hod/HodDashboard';
import { HodAttendance } from './pages/hod/HodAttendance';
import { HodMarks } from './pages/hod/HodMarks';
import { HodCondonations } from './pages/hod/HodCondonations';
import { HodReports } from './pages/hod/HodReports';
import { HodDepartment } from './pages/hod/HodDepartment';
import { HodRiskDashboard } from './pages/hod/HodRisk';
import { FacultyMarksEntry } from './pages/faculty/FacultyMarksEntry';
import { FacultyOCRUpload } from './pages/faculty/FacultyOCRUpload';
import { FacultyClassAnalytics } from './pages/faculty/FacultyClassAnalytics';
import { FacultyAIAssistant } from './pages/faculty/FacultyAIAssistant';
import { FacultySessionDetails } from './pages/faculty/FacultySessionDetails';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentAttendance } from './pages/parent/ParentAttendance';
import { ParentMarks } from './pages/parent/ParentMarks';
import { ParentResults } from './pages/parent/ParentResults';
import { ParentNotifications } from './pages/parent/ParentNotifications';
import { ParentVoiceAssistant } from './pages/parent/ParentVoiceAssistant';
import { AdminStudents } from './pages/admin/AdminStudents';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { FacultySessions } from './pages/faculty/FacultySessions';
import { StudentMarks } from './pages/student/StudentMarks';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentCondonation } from './pages/student/StudentCondonation';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { StudentHallTicket } from './pages/student/StudentHallTicket';
import { StudentAIAssistant } from './pages/student/StudentAIAssistant';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminAIInsights } from './pages/admin/AdminAIInsights';
import { AdminTimetable } from './pages/admin/AdminTimetable';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminAcademicYear } from './pages/admin/AdminAcademicYear';
import { AdminGrading } from './pages/admin/AdminGrading';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAuditLog } from './pages/admin/AdminAuditLog';
import { AdminEmailAccounts } from './pages/admin/AdminEmailAccounts';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AdminHelp } from './pages/admin/AdminHelp';
import { DevRoleSwitcher } from './components/DevRoleSwitcher';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { useEffect } from 'react';

export default function App() {
  const { isDarkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <DevRoleSwitcher />
      <Routes>
        {/* Login has no shell */}
        <Route path="/login" element={<Login />} />

        {/* One AppLayout wraps everything — RequireAuth sits inside as a
            layout route (renders <Outlet />) so the shell never duplicates */}
        <Route element={<AppLayout />}>
          <Route element={<RequireAuth />}>
            {/* ── Admin ───────────────────────────────────────────── */}
            <Route path="/admin"                element={<AdminDashboard />} />
            <Route path="/admin/students"       element={<AdminStudents />} />
            <Route path="/admin/departments"    element={<AdminDepartments />} />
            <Route path="/admin/faculty"        element={<AdminFaculty />} />
            <Route path="/admin/ai-anomalies"   element={<AdminAIInsights />} />
            <Route path="/admin/timetable"      element={<AdminTimetable />} />
            <Route path="/admin/courses"        element={<AdminCourses />} />
            <Route path="/admin/subjects"       element={<AdminSubjects />} />
            <Route path="/admin/academic-year"  element={<AdminAcademicYear />} />
            <Route path="/admin/grading"        element={<AdminGrading />} />
            <Route path="/admin/notifications"  element={<AdminNotifications />} />
            <Route path="/admin/reports"        element={<AdminReports />} />
            <Route path="/admin/audit-log"      element={<AdminAuditLog />} />
            <Route path="/admin/email-accounts" element={<AdminEmailAccounts />} />
            <Route path="/admin/settings"       element={<Settings />} />
            <Route path="/admin/profile"        element={<Profile />} />
            <Route path="/admin/help"           element={<AdminHelp />} />
            <Route path="/admin/*"              element={<PlaceholderPage />} />

            {/* ── HOD ─────────────────────────────────────────────── */}
            <Route path="/hod"                  element={<HodDashboard />} />
            <Route path="/hod/attendance"       element={<HodAttendance />} />
            <Route path="/hod/marks"            element={<HodMarks />} />
            <Route path="/hod/condonations"     element={<HodCondonations />} />
            <Route path="/hod/reports"          element={<HodReports />} />
            <Route path="/hod/department"       element={<HodDepartment />} />
            <Route path="/hod/risk-dashboard"   element={<HodRiskDashboard />} />
            <Route path="/hod/settings"         element={<Settings />} />
            <Route path="/hod/profile"          element={<Profile />} />
            <Route path="/hod/*"                element={<PlaceholderPage />} />

            {/* ── Faculty ─────────────────────────────────────────── */}
            <Route path="/faculty"              element={<FacultyDashboard />} />
            <Route path="/faculty/sessions"     element={<FacultySessions />} />
            <Route path="/faculty/sessions/:id" element={<FacultySessionDetails />} />
            <Route path="/faculty/marks"        element={<FacultyMarksEntry />} />
            <Route path="/faculty/marks-ocr"    element={<FacultyOCRUpload />} />
            <Route path="/faculty/analytics"    element={<FacultyClassAnalytics />} />
            <Route path="/faculty/ai-insights"  element={<FacultyAIAssistant />} />
            <Route path="/faculty/settings"     element={<Settings />} />
            <Route path="/faculty/profile"      element={<Profile />} />
            <Route path="/faculty/*"            element={<PlaceholderPage />} />

            {/* ── Student ─────────────────────────────────────────── */}
            <Route path="/student"                  element={<StudentDashboard />} />
            <Route path="/student/attendance"       element={<StudentAttendance />} />
            <Route path="/student/marks"            element={<StudentMarks />} />
            <Route path="/student/timetable"        element={<StudentTimetable />} />
            <Route path="/student/condonation"      element={<StudentCondonation />} />
            <Route path="/student/notifications"    element={<StudentNotifications />} />
            <Route path="/student/hall-ticket"      element={<StudentHallTicket />} />
            <Route path="/student/ai-assistant"     element={<StudentAIAssistant />} />
            <Route path="/student/settings"         element={<Settings />} />
            <Route path="/student/profile"          element={<Profile />} />
            <Route path="/student/*"                element={<PlaceholderPage />} />

            {/* ── Parent ──────────────────────────────────────────── */}
            <Route path="/parent"                   element={<ParentDashboard />} />
            <Route path="/parent/attendance"        element={<ParentAttendance />} />
            <Route path="/parent/marks"             element={<ParentMarks />} />
            <Route path="/parent/results"           element={<ParentResults />} />
            <Route path="/parent/notifications"     element={<ParentNotifications />} />
            <Route path="/parent/voice-agent"       element={<ParentVoiceAssistant />} />
            <Route path="/parent/settings"          element={<Settings />} />
            <Route path="/parent/profile"           element={<Profile />} />
            <Route path="/parent/*"                 element={<PlaceholderPage />} />
          </Route>
        </Route>

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
