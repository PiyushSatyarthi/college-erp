import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { CheckSquare, Clock, CalendarDays } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { dashboardApi } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';

export function FacultyDashboard() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const { data, loading, error, refetch } = useFetch(() => dashboardApi.faculty() as Promise<any>);

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const d = data as any;
  const todaysSessions: any[] = d?.todaysSessions ?? [];
  const assignments: any[]    = d?.assignments ?? [];
  const attendanceToday       = d?.attendanceToday ?? {};

  const totalToday = (attendanceToday.present ?? 0) + (attendanceToday.absent ?? 0) + (attendanceToday.late ?? 0);
  const attendancePct = totalToday > 0
    ? Math.round(((attendanceToday.present + attendanceToday.late) / totalToday) * 100)
    : null;

  const pieData = [
    { name: 'Present', value: attendancePct ?? 0 },
    { name: 'Other',   value: 100 - (attendancePct ?? 0) },
  ];
  const COLORS = ['#2563EB', '#f1f5f9'];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const today = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {greeting}, {user?.name?.split(' ')[0] ?? 'Professor'} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Sessions Today</p>
            <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{todaysSessions.length}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {todaysSessions.filter((s: any) => s.status === 'Completed').length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Today's Attendance</p>
              <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                {attendancePct !== null ? `${attendancePct}%` : '—'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{totalToday} records</p>
            </div>
            <div className="h-16 w-16 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={20} outerRadius={30} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]}
                        className={index === 1 ? 'dark:fill-slate-800' : ''} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Subjects Assigned</p>
            <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{assignments.length}</h2>
            <p className="text-xs text-slate-500 mt-1">This academic year</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's timetable + assignments */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Today's Sessions
            </h2>
            <Button variant="outline" size="sm" className="hidden sm:flex text-slate-500"
              onClick={() => navigate('/faculty/sessions')}>
              <CalendarDays className="w-4 h-4 mr-2" /> All Sessions
            </Button>
          </div>

          {todaysSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-400">
                <p className="text-sm">No sessions scheduled for today.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/faculty/sessions')}>
                  Create a session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {todaysSessions.map((session: any) => {
                const isCompleted = session.status === 'Completed';
                const isCancelled = session.status === 'Cancelled';
                return (
                  <Card key={session.id}
                    className={`border-l-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow
                      ${isCompleted ? 'border-l-green-500 opacity-70' : isCancelled ? 'border-l-red-400 opacity-50' : 'border-l-blue-600'}`}>
                    <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-base text-slate-900 dark:text-white">
                            {session.subject?.name ?? 'Subject'}
                          </CardTitle>
                          <Badge variant={isCompleted ? 'success' : isCancelled ? 'danger' : 'warning'}>
                            {session.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Division {session.division}
                        </CardDescription>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                          <span className="font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {session.start_time} – {session.end_time}
                          </span>
                        </div>
                      </div>
                      {!isCompleted && !isCancelled && (
                        <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                          <Link to={`/faculty/sessions/${session.id}`}>
                            <Button className="w-full justify-start">
                              <CheckSquare className="mr-2 h-4 w-4" /> Take Attendance
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Assigned subjects sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Subjects</h2>
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-slate-400">
                No subjects assigned yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((a: any) => (
                <Card key={a.id} className="border-slate-100 dark:border-slate-800">
                  <CardContent className="p-4">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{a.subject?.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {a.subject?.code} · Sem {a.subject?.semester} · Div {a.division}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={() => navigate('/faculty/sessions')}>
            + Create New Session
          </Button>
        </div>
      </div>
    </div>
  );
}
