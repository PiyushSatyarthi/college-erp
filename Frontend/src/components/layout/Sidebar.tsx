import React from 'react';
import { useAppStore, Role } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, BookOpen, FileText, Users, GraduationCap, 
  Calendar, CalendarDays, Star, Bell, BarChart3, Shield, Brain, Mail,
  ClipboardCheck, FileWarning, Upload, Ticket, Settings, HelpCircle, LogOut,
  ChevronLeft, X, Mic, Award, MapPin
} from 'lucide-react';
import { Badge } from '../ui/Badge';

const navItems: Record<Role, { label: string, icon: any, path: string, badge?: string }[]> = {
  Admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Departments', icon: Building2, path: '/admin/departments' },
    { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { label: 'Subjects', icon: FileText, path: '/admin/subjects' },
    { label: 'Students', icon: Users, path: '/admin/students' },
    { label: 'Faculty', icon: GraduationCap, path: '/admin/faculty' },
    { label: 'Timetable', icon: Calendar, path: '/admin/timetable' },
    { label: 'Academic Year', icon: CalendarDays, path: '/admin/academic-year' },
    { label: 'Grading Schemes', icon: Star, path: '/admin/grading' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications', badge: '3' },
    { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { label: 'Audit Log', icon: Shield, path: '/admin/audit-log' },
    { label: 'AI Insights', icon: Brain, path: '/admin/ai-anomalies' },
    { label: 'Email Accounts', icon: Mail, path: '/admin/email-accounts' },
  ],
  HOD: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/hod' },
    { label: 'Attendance', icon: ClipboardCheck, path: '/hod/attendance' },
    { label: 'Marks Overview', icon: BarChart3, path: '/hod/marks' },
    { label: 'Condonations', icon: FileWarning, path: '/hod/condonations', badge: '8' },
    { label: 'Reports', icon: FileText, path: '/hod/reports' },
    { label: 'My Department', icon: Users, path: '/hod/department' },
    { label: 'Risk Dashboard', icon: Brain, path: '/hod/risk-dashboard' },
  ],
  Faculty: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/faculty' },
    { label: 'Sessions', icon: Calendar, path: '/faculty/sessions', badge: '2' },
    { label: 'Marks Entry', icon: BookOpen, path: '/faculty/marks' },
    { label: 'OCR Upload', icon: Upload, path: '/faculty/marks-ocr' },
    { label: 'Class Analytics', icon: BarChart3, path: '/faculty/analytics' },
    { label: 'AI Assistant', icon: Brain, path: '/faculty/ai-insights' },
  ],
  Student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
    { label: 'My Attendance', icon: ClipboardCheck, path: '/student/attendance' },
    { label: 'My Marks', icon: BookOpen, path: '/student/marks' },
    { label: 'Timetable', icon: Calendar, path: '/student/timetable' },
    { label: 'Condonation', icon: FileText, path: '/student/condonation', badge: '1' },
    { label: 'Notifications', icon: Bell, path: '/student/notifications', badge: '4' },
    { label: 'Hall Ticket', icon: Ticket, path: '/student/hall-ticket' },
    { label: 'AI Assistant', icon: Brain, path: '/student/ai-assistant' },
  ],
  Parent: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/parent' },
    { label: 'Attendance', icon: ClipboardCheck, path: '/parent/attendance' },
    { label: 'Marks', icon: BookOpen, path: '/parent/marks' },
    { label: 'Results', icon: Award, path: '/parent/results' },
    { label: 'Notifications', icon: Bell, path: '/parent/notifications', badge: '3' },
    { label: 'Voice Assistant', icon: Mic, path: '/parent/voice-agent' },
  ],
  Public: []
};

export function Sidebar() {
  const { role, setRole, sidebarOpen, setSidebarOpen } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const items = navItems[role] || [];

  if (role === 'Public') return null;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 md:sticky h-screen overflow-hidden",
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-0 md:border-none"
        )}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 md:hidden">
            <div className="flex items-center gap-2 font-semibold">
               SV College
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
              <X className="h-5 w-5" />
            </button>
          </div>

          {role === 'HOD' && (
             <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 text-xs border border-blue-200 dark:border-blue-800 m-4 rounded-lg flex items-start gap-2">
               <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
               <span>Viewing: Computer Engineering. You can only see data for your department.</span>
             </div>
          )}

          <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
            <nav className="space-y-1 px-2">
              {items.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== `/${role.toLowerCase()}` && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                      isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 dark:bg-slate-800/80 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        isActive ? "bg-blue-50 text-blue-700 dark:bg-slate-950 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 p-2 shrink-0">
            <Link to={`/${role.toLowerCase()}/settings`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300">
              <Settings className="h-5 w-5 text-slate-400" />
              Settings
            </Link>
            <Link to={`/${role.toLowerCase()}/help`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300">
              <HelpCircle className="h-5 w-5 text-slate-400" />
              Help
            </Link>
            <button onClick={() => { setRole('Public'); navigate('/login'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50">
               <LogOut className="h-5 w-5" />
               Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
