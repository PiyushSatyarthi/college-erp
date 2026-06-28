import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { marksApi, api } from '@/lib/api';

const GRADE_BADGE: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'outline'> = {
  O: 'success', 'A+': 'success', A: 'info', 'B+': 'info', B: 'warning', C: 'warning', F: 'danger',
};

const MAX_TOTAL = 60;

export function ParentMarks() {
  const { data: meData } = useFetch(() => api.get<any>('/api/auth/me'));
  const children: any[] = meData?.profile?.children ?? [];
  const child = children[0] ?? null;

  const { data, loading, error, refetch } = useFetch(
    () => child?.id ? (marksApi.student(child.id) as Promise<any>) : Promise.resolve(null),
    [child?.id]
  );

  const [activeSem, setActiveSem] = useState<number | null>(null);
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({});

  const marks: any[] = (data as any)?.marks ?? [];

  const bySem = marks.reduce<Record<number, any[]>>((acc, m) => {
    const sem = m.subject?.semester ?? 0;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(m);
    return acc;
  }, {});
  const semesters = Object.keys(bySem).map(Number).sort((a, b) => a - b);
  const displaySem = activeSem ?? semesters[semesters.length - 1] ?? null;
  const currentMarks: any[] = displaySem !== null ? (bySem[displaySem] ?? []) : [];

  // Chart data
  const chartData = currentMarks.map((m: any) => ({
    name: m.subject?.code ?? m.subject?.name?.slice(0, 5),
    Q1: m.q1 ?? 0, Q2: m.q2 ?? 0, Q3: m.q3 ?? 0,
    total: m.total ?? 0,
  }));

  const semPct = currentMarks.length > 0
    ? Math.round((currentMarks.reduce((a, m) => a + (m.total ?? 0), 0) / (currentMarks.length * MAX_TOTAL)) * 100)
    : null;

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const childName = child?.user?.name ?? 'your child';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Grades</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {child ? `${childName} · Roll ${child.roll_number ?? '—'}` : 'No student linked'}
        </p>
      </div>

      {marks.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            <p>No published marks yet for {childName}.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Semester tabs */}
          <div className="flex overflow-x-auto pb-1 gap-2">
            {semesters.map((sem) => (
              <button key={sem}
                onClick={() => setActiveSem(sem)}
                className={`px-4 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors
                  ${displaySem === sem
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}>
                Sem {sem}
              </button>
            ))}
          </div>

          {/* Summary + chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" /> Semester {displaySem} Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-slate-900 dark:text-white">
                    {semPct !== null ? `${semPct}%` : '—'}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">Overall performance</p>
                </div>
                <div className="space-y-3">
                  {currentMarks.map((m: any) => (
                    <div key={m.subject?.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400 truncate mr-2">{m.subject?.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-slate-500">{m.total}/{MAX_TOTAL}</span>
                          <Badge variant={GRADE_BADGE[m.grade] ?? 'outline'} className="text-[10px] py-0 px-1.5">{m.grade}</Badge>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.grade === 'F' ? 'bg-red-500' : m.grade === 'C' || m.grade === 'B' ? 'bg-amber-500' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min((m.total / MAX_TOTAL) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Q1 / Q2 / Q3 Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 20]} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                      />
                      <ReferenceLine y={8} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: 'Pass', fontSize: 10, fill: '#f59e0b', position: 'right' }} />
                      <Bar dataKey="Q1" fill="#1E40AF" radius={[3, 3, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="Q2" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="Q3" fill="#60A5FA" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed table per subject */}
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Subject-wise Details</h2>
            {currentMarks.map((m: any) => {
              const isExpanded = expanded[m.subject?.id] ?? false;
              return (
                <Card key={m.subject?.id} className="overflow-hidden">
                  <button className="w-full text-left p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors border-b border-slate-200 dark:border-slate-800"
                    onClick={() => toggleExpand(m.subject?.id)}>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{m.subject?.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{m.subject?.code} · Sem {m.subject?.semester}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-slate-600 dark:text-slate-400 hidden sm:block">{m.total}/{MAX_TOTAL}</span>
                      <Badge variant={GRADE_BADGE[m.grade] ?? 'outline'} className="text-base py-1 px-3">{m.grade ?? '—'}</Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <CardContent className="p-0">
                      <table className="w-full text-sm bg-white dark:bg-slate-950">
                        <thead className="border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3 font-medium text-slate-500 text-left">Test</th>
                            <th className="px-4 py-3 font-medium text-slate-500 text-center">Max</th>
                            <th className="px-4 py-3 font-medium text-slate-500 text-center">Score</th>
                            <th className="px-4 py-3 font-medium text-slate-500 text-center">%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                          {[
                            { label: 'Quiz 1', score: m.q1 },
                            { label: 'Quiz 2', score: m.q2 },
                            { label: 'Quiz 3', score: m.q3 },
                          ].map(({ label, score }) => (
                            <tr key={label}>
                              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{label}</td>
                              <td className="px-4 py-3 text-center text-slate-500">20</td>
                              <td className="px-4 py-3 text-center font-mono font-semibold">{score}</td>
                              <td className="px-4 py-3 text-center text-slate-500">{Math.round((score / 20) * 100)}%</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 dark:bg-slate-900/50 font-semibold">
                            <td className="px-4 py-3">Total</td>
                            <td className="px-4 py-3 text-center text-slate-500">{MAX_TOTAL}</td>
                            <td className="px-4 py-3 text-center font-mono">{m.total}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={GRADE_BADGE[m.grade] ?? 'outline'}>{m.grade}</Badge>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
