import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Mic, Phone, AlertTriangle, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { dashboardApi, api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  // Get the parent's children list from /api/auth/me
  const { data: meData } = useFetch(() => api.get<any>('/api/auth/me'));
  const children: any[] = meData?.profile?.children ?? [];
  const child = children[0] ?? null;

  // Fetch the child's dashboard data if we have a student id
  const { data, loading, error, refetch } = useFetch(
    () => child?.id
      ? (api.get(`/api/dashboard/student`) as Promise<any>)
      : Promise.resolve(null),
    [child?.id]
  );

  // Attendance per subject
  const { data: attendanceData } = useFetch(
    () => child?.id
      ? (api.get(`/api/attendance/student/${child.id}`) as Promise<any>)
      : Promise.resolve(null),
    [child?.id]
  );

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const d = data as any;
  const pct: number | null  = d?.overallAttendancePercentage ?? null;
  const marks: any[]        = d?.recentMarks ?? [];
  const notifications: any[]= d?.recentNotifications ?? [];
  const subjects: any[]     = (attendanceData as any)?.subjects ?? [];
  const lowAttSubjects      = subjects.filter((s: any) => s.percentage !== null && s.percentage < 75);

  const childName = child?.user?.name ?? child?.user?.email ?? 'your child';
  const rollNo    = child?.roll_number ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Parent Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome, {user?.name}</p>
        </div>
        {children.length > 0 && (
          <div className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium dark:bg-slate-900 dark:border-slate-700">
            👤 {childName} {rollNo ? `(${rollNo})` : ''}
          </div>
        )}
      </div>

      {/* Alert if no children linked */}
      {children.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 text-sm text-slate-500 text-center">
          No student is linked to your parent account. Please contact the admin.
        </div>
      )}

      {/* Low attendance alert */}
      {lowAttSubjects.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-400">Attendance Alert!</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {childName} is below 75% in{' '}
                {lowAttSubjects.map((s: any) => s.subject?.name).join(', ')}.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm"
            className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50 whitespace-nowrap">
            <Phone className="mr-2 h-4 w-4" /> Call College
          </Button>
        </div>
      )}

      {/* Voice assistant promo */}
      <Card className="bg-blue-600 text-white border-none overflow-hidden relative shadow-lg">
        <div className="absolute right-[-20px] top-[-20px] opacity-20">
          <Mic className="h-48 w-48" />
        </div>
        <CardContent className="p-8 relative z-10">
          <h2 className="text-2xl font-bold mb-2">Voice Assistant</h2>
          <p className="opacity-90 max-w-sm mb-6">
            Ask about {childName}'s academic progress, attendance, and recent marks using your voice.
          </p>
          <Link to="/parent/voice-agent">
            <Button variant="secondary" className="text-blue-700 font-semibold shadow-sm hover:bg-blue-50">
              <Mic className="mr-2 h-5 w-5" /> Start Voice Chat
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Attendance Summary</CardTitle>
            <Link to="/parent/attendance">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-center mb-6">
              <span className={`text-4xl font-bold ${pct !== null && pct < 75 ? 'text-amber-600' : 'text-blue-600'}`}>
                {pct !== null ? `${pct}%` : '—'}
              </span>
              <p className="text-sm text-slate-500 mt-1">Overall Attendance</p>
            </div>
            <div className="w-full space-y-3">
              {subjects.slice(0, 4).map((s: any) => (
                <div key={s.subject?.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{s.subject?.code}</span>
                    <span className={s.percentage !== null && s.percentage < 75 ? 'text-red-600' : 'text-slate-500'}>
                      {s.percentage !== null ? `${s.percentage}%` : '—'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.percentage !== null && s.percentage < 75 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${s.percentage ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {subjects.length === 0 && (
                <p className="text-xs text-center text-slate-400 py-4">No attendance data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent marks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Marks</CardTitle>
            <Link to="/parent/marks">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {marks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No published marks yet.</p>
            ) : (
              <div className="space-y-3">
                {marks.slice(0, 4).map((m: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">{m.subject?.name}</h4>
                      <p className="text-xs text-slate-500">Sem {m.subject?.semester}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm font-medium">{m.total}/60</span>
                      <Badge variant="outline" className="text-[10px] py-0">{m.grade ?? '—'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" /> Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n: any) => (
              <div key={n.id} className="flex gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
