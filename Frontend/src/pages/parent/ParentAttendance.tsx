import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useFetch } from '@/hooks/useFetch';
import { attendanceApi, api } from '@/lib/api';

export function ParentAttendance() {
  const { data: meData } = useFetch(() => api.get<any>('/api/auth/me'));
  const children: any[]  = meData?.profile?.children ?? [];
  const child            = children[0] ?? null;

  const { data, loading, error, refetch } = useFetch(
    () => child?.id ? (attendanceApi.student(child.id) as Promise<any>) : Promise.resolve(null),
    [child?.id]
  );

  const subjects: any[] = (data as any)?.subjects ?? [];

  const totalSessions = subjects.reduce((a: number, s: any) => a + (s.totalSessions ?? 0), 0);
  const totalPresent  = subjects.reduce((a: number, s: any) => a + (s.present ?? 0) + (s.late ?? 0), 0);
  const overallPct    = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : null;

  const lowSubjects = subjects.filter((s: any) => s.percentage !== null && s.percentage < 75);

  // Build a trend array from semester ordering (proxy for time)
  // Since we don't have weekly data, show per-subject as a "trend"
  const trendData = subjects.map((s: any) => ({
    name: s.subject?.code ?? s.subject?.name?.slice(0, 5),
    attendance: s.percentage ?? 0,
  }));

  const childName = child?.user?.name ?? 'your ward';
  const rollNo    = child?.roll_number ?? '';

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Details</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {childName}{rollNo ? ` · ${rollNo}` : ''} · Div {child?.division ?? '—'} · Year {child?.year ?? '—'}
          </p>
        </div>
        {!child && (
          <span className="text-sm text-slate-400 italic">No student linked to your account</span>
        )}
      </div>

      {!child ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <p className="text-sm">No student is linked to your parent account. Please contact the admin.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Low attendance alert */}
          {lowSubjects.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-400">Attendance Warning</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {childName} is below 75% in:{' '}
                    <strong>{lowSubjects.map((s: any) => s.subject?.name).join(', ')}</strong>.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm"
                className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 shrink-0">
                <Phone className="mr-2 h-4 w-4" /> Call College
              </Button>
            </div>
          )}

          {/* Overall stat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className={`${(overallPct ?? 100) < 75 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'}`}>
              <CardContent className="p-5">
                <p className={`text-sm font-medium ${(overallPct ?? 100) < 75 ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>Overall Attendance</p>
                <p className={`text-4xl font-bold mt-1 ${(overallPct ?? 100) < 75 ? 'text-amber-600' : 'text-green-600'}`}>
                  {overallPct !== null ? `${overallPct}%` : '—'}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {totalPresent} attended / {totalSessions} total sessions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">Subjects Below 75%</p>
                <p className={`text-4xl font-bold mt-1 ${lowSubjects.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {lowSubjects.length}
                </p>
                <p className="text-xs text-slate-500 mt-2">of {subjects.length} subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">Eligibility Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {(overallPct ?? 0) >= 75
                    ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                    : <AlertTriangle className="h-6 w-6 text-red-500" />}
                  <p className={`text-lg font-bold ${(overallPct ?? 0) >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {(overallPct ?? 0) >= 75 ? 'Eligible' : 'At Risk'}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-2">Minimum 75% required</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject-wise table */}
            <Card>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">Subject-wise Attendance</h2>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-500">Subject</th>
                        <th className="px-4 py-3 font-medium text-slate-500 text-center">Attended</th>
                        <th className="px-4 py-3 font-medium text-slate-500 text-center">Total</th>
                        <th className="px-4 py-3 font-medium text-slate-500 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {subjects.map((s: any) => {
                        const pct   = s.percentage;
                        const isLow = pct !== null && pct < 75;
                        return (
                          <tr key={s.subject?.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isLow ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                              {s.subject?.name}
                              <p className="text-xs font-mono text-slate-400">{s.subject?.code}</p>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500">{(s.present ?? 0) + (s.late ?? 0)}</td>
                            <td className="px-4 py-3 text-center text-slate-500">{s.totalSessions ?? 0}</td>
                            <td className={`px-4 py-3 text-right font-bold ${isLow ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                              {pct !== null ? `${pct}%` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                      {subjects.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No attendance records yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">Attendance by Subject</h2>
              </div>
              <CardContent className="p-5">
                <div className="h-[250px] w-full">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                          formatter={(v: number) => [`${v}%`, 'Attendance']} />
                        <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5}
                          label={{ value: '75%', fontSize: 10, fill: '#f59e0b', position: 'right' }} />
                        <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={2.5}
                          dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      No data to chart yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
