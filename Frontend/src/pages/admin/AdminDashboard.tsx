import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Users, GraduationCap, AlertCircle, FileWarning, Plus, Download, Mail, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { dashboardApi, attendanceApi } from '@/lib/api';

const GRADE_COLORS: Record<string, string> = {
  O: '#1E3A8A', 'A+': '#1E40AF', A: '#1D4ED8',
  'B+': '#2563EB', B: '#3B82F6', C: '#60A5FA', F: '#93C5FD',
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, refetch } = useFetch(() => dashboardApi.admin() as Promise<any>);
  const { data: summaryData } = useFetch(() => attendanceApi.summary() as Promise<any>);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickAddOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorBanner message={error} onRetry={refetch} />;

  const d = data as any;
  const today = d?.attendanceToday ?? {};
  const totalToday = (today.present ?? 0) + (today.absent ?? 0) + (today.late ?? 0);
  const attendancePct = totalToday > 0
    ? Math.round(((today.present + today.late) / totalToday) * 100)
    : null;

  const deptChartData = (summaryData as any)?.summary?.map((s: any) => ({
    name: s.department?.code ?? s.department?.name?.slice(0, 5),
    value: s.attendancePercentage ?? 0,
  })) ?? [];

  const notifications: any[] = d?.recentNotifications ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Shri Vivekanand College of Engineering — Overview</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <Button onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}>
            <Plus className="mr-2 h-4 w-4" /> Quick Add
          </Button>
          {isQuickAddOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
              <div className="py-1">
                {[
                  { label: 'Add Student',    path: '/admin/students' },
                  { label: 'Add Faculty',    path: '/admin/faculty' },
                  { label: 'Add Course',     path: '/admin/courses' },
                  { label: 'Add Department', path: '/admin/departments' },
                ].map(({ label, path }) => (
                  <button key={path} onClick={() => { navigate(path); setIsQuickAddOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{d?.studentCount ?? '—'}</h2>
                  <span className="text-xs text-slate-500">Active</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Faculty</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{d?.facultyCount ?? '—'}</h2>
                  <span className="text-xs text-slate-500">Across {d?.departmentCount ?? '—'} depts</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Attendance</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className={`text-3xl font-bold ${attendancePct !== null && attendancePct < 75 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                    {attendancePct !== null ? `${attendancePct}%` : '—'}
                  </h2>
                  <span className="text-xs text-slate-500">{today.present ?? 0} present</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Condonations</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{d?.pendingCondonations ?? '—'}</h2>
                  <span className="text-xs text-slate-500">Requires action</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <FileWarning className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Department</CardTitle>
            <CardDescription>Overall attendance % per department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {deptChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => [`${val.toFixed(1)}%`, 'Attendance']}
                    />
                    <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  No department attendance data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Session Summary</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              {totalToday > 0 ? (
                <div className="relative w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Present', value: today.present ?? 0, color: '#2563EB' },
                          { name: 'Late',    value: today.late    ?? 0, color: '#60A5FA' },
                          { name: 'Absent',  value: today.absent  ?? 0, color: '#BFDBFE' },
                        ]}
                        innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                      >
                        {[{ color: '#2563EB' }, { color: '#60A5FA' }, { color: '#BFDBFE' }].map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalToday}</p>
                      <p className="text-xs text-slate-500">Records</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-slate-400 space-y-1">
                  <p>No sessions completed today yet.</p>
                  <p className="text-xs">{today.totalSessions ?? 0} session(s) scheduled.</p>
                </div>
              )}
            </div>
            {totalToday > 0 && (
              <div className="mt-2 flex justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600 inline-block" /> Present: {today.present}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400 inline-block" /> Late: {today.late}</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-200 inline-block" /> Absent: {today.absent}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest announcements sent</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/admin/notifications')}>
              View all →
            </Button>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No notifications yet.</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((n: any, i: number) => (
                  <div key={n.id ?? i} className="flex gap-4">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        <Badge variant="outline" className="text-[10px] py-0 px-1">{n.audience}</Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>College Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Departments', value: d?.departmentCount },
              { label: 'Courses',     value: d?.courseCount },
              { label: 'Students',    value: d?.studentCount },
              { label: 'Faculty',     value: d?.facultyCount },
              { label: 'Sessions Today', value: today?.totalSessions },
              { label: 'Pending Condonations', value: d?.pendingCondonations },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{value ?? '—'}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Import Students</Button>
        <Button variant="outline"><BarChartIcon className="mr-2 h-4 w-4" /> Generate Report</Button>
        <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Send Broadcast</Button>
      </div>
    </div>
  );
}
