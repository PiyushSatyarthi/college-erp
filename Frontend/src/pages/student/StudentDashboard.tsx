import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { ArrowRight, AlertTriangle, Bell, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { dashboardApi } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const { data, loading, error, refetch } = useFetch(() => dashboardApi.student() as Promise<any>);

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const d = data as any;
  const pct: number | null     = d?.overallAttendancePercentage ?? null;
  const marks: any[]           = d?.recentMarks ?? [];
  const condonations: any[]    = d?.pendingCondonations ?? [];
  const upcoming: any[]        = d?.upcomingSessions ?? [];
  const notifications: any[]   = d?.recentNotifications ?? [];

  // SVG circle math for attendance ring
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = pct !== null ? circumference - (pct / 100) * circumference : circumference;

  const lowAttendance = pct !== null && pct < 75;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card className="bg-blue-600 text-white border-none shadow-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Student'} 👋
          </h1>
          <p className="mt-1 opacity-90 font-mono text-sm">{user?.email}</p>
        </CardContent>
      </Card>

      {/* Low attendance warning */}
      {lowAttendance && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20 flex gap-4 items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 dark:text-red-400">Attendance Warning!</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Your overall attendance is {pct}%, below the 75% requirement.
            </p>
            <Button variant="outline" size="sm"
              className="mt-3 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50"
              onClick={() => navigate('/student/condonation')}>
              Apply for Condonation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Pending condonation alert */}
      {condonations.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20 flex gap-3 items-center">
          <Bell className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            You have <strong>{condonations.length}</strong> pending condonation request(s) under review.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance ring */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overall Attendance</CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600"
                onClick={() => navigate('/student/attendance')}>
                Details →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-800">
              {pct !== null ? (
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor"
                    strokeWidth="8"
                    className={pct >= 75 ? 'text-blue-600' : 'text-amber-500'}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
              <div className="text-center z-10">
                <span className={`text-3xl font-bold ${pct !== null && pct < 75 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                  {pct !== null ? `${pct}%` : '—'}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              {pct !== null
                ? pct >= 75 ? 'You are eligible for exams ✓' : 'Below minimum required (75%)'
                : 'No sessions recorded yet'}
            </p>
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" /> Upcoming Sessions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No upcoming sessions scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{s.subject?.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(s.session_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}{s.start_time} – {s.end_time}
                      </p>
                    </div>
                    <Badge variant="outline">Div {s.division ?? '—'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest marks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Latest Published Marks</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600"
            onClick={() => navigate('/student/marks')}>
            View All →
          </Button>
        </CardHeader>
        <CardContent>
          {marks.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No published marks yet.</p>
          ) : (
            <div className="space-y-3">
              {marks.map((m: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{m.subject?.name}</h4>
                    <p className="text-xs text-slate-500">Sem {m.subject?.semester} · {m.subject?.code}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-medium">{m.total}/60</span>
                    <Badge variant="outline">{m.grade ?? '—'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
