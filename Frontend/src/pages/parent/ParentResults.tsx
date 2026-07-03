import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Award, Download, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { marksApi, api } from '@/lib/api';

const GRADE_BADGE: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'outline'> = {
  O: 'success', 'A+': 'success', A: 'info', 'B+': 'info', B: 'warning', C: 'warning', F: 'danger',
};
const MAX_TOTAL = 60;

export function ParentResults() {
  const { data: meData } = useFetch(() => api.get<any>('/api/auth/me'));
  const children: any[]  = meData?.profile?.children ?? [];
  const child            = children[0] ?? null;

  const { data, loading, error, refetch } = useFetch(
    () => child?.id ? (marksApi.student(child.id) as Promise<any>) : Promise.resolve(null),
    [child?.id]
  );

  const [activeSem, setActiveSem] = useState<number | null>(null);
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({});

  const marks: any[] = (data as any)?.marks ?? [];

  // Group by semester
  const bySem = marks.reduce<Record<number, any[]>>((acc, m) => {
    const sem = m.subject?.semester ?? 0;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(m);
    return acc;
  }, {});
  const semesters   = Object.keys(bySem).map(Number).sort((a, b) => a - b);
  const displaySem  = activeSem ?? semesters[semesters.length - 1] ?? null;
  const currentMarks: any[] = displaySem !== null ? (bySem[displaySem] ?? []) : [];

  // Semester stats
  const semTotal = currentMarks.reduce((a, m) => a + (m.total ?? 0), 0);
  const semMax   = currentMarks.length * MAX_TOTAL;
  const semPct   = semMax > 0 ? Math.round((semTotal / semMax) * 100) : null;

  // Group by year for sidebar
  const byYear = semesters.reduce<Record<number, number[]>>((acc, sem) => {
    const yr = Math.ceil(sem / 2);
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(sem);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort();

  const [activeYear, setActiveYear] = useState<number | null>(null);
  const displayYear = activeYear ?? years[years.length - 1] ?? null;
  const yearlySems  = displayYear !== null ? (byYear[displayYear] ?? []) : semesters;

  const toggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const childName = child?.user?.name ?? 'your ward';
  const rollNo    = child?.roll_number ?? '';

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" /> Exam Results
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {childName}{rollNo ? ` · ${rollNo}` : ''} — published marks only
          </p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download Marksheet</Button>
      </div>

      {!child ? (
        <Card><CardContent className="py-16 text-center text-slate-400">No student linked to your account.</CardContent></Card>
      ) : marks.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            <Lock className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>No published results yet for {childName}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Year sidebar */}
          <Card className="md:col-span-1 border-blue-100 dark:border-blue-900/30">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/10">
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Filter by Year</h2>
            </div>
            <CardContent className="p-3 space-y-2">
              {years.map(yr => (
                <button key={yr}
                  onClick={() => {
                    setActiveYear(yr);
                    const firstSem = byYear[yr]?.[0];
                    if (firstSem) setActiveSem(firstSem);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-all ${
                    displayYear === yr
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                  }`}>
                  Year {yr}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="md:col-span-3 space-y-5">
            {/* Semester tabs */}
            <div className="flex flex-wrap gap-2">
              {yearlySems.map(sem => (
                <button key={sem} onClick={() => setActiveSem(sem)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors border ${
                    displaySem === sem
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}>
                  Semester {sem}
                </button>
              ))}
            </div>

            {/* Result card */}
            <Card>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white text-lg">
                    Semester {displaySem} Results
                  </h2>
                  <p className="text-sm text-slate-500">{currentMarks.length} subjects</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Semester Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {semPct !== null ? `${semPct}%` : '—'}
                  </p>
                </div>
              </div>

              {currentMarks.length === 0 ? (
                <CardContent className="py-12 text-center text-slate-400">
                  <p>No published results for this semester.</p>
                </CardContent>
              ) : (
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {currentMarks.map((m: any) => {
                      const isExp = expanded[m.subject?.id] ?? false;
                      return (
                        <div key={m.subject?.id}>
                          <button
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            onClick={() => toggleExpand(m.subject?.id)}>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{m.subject?.name}</p>
                              <p className="text-xs font-mono text-slate-400 mt-0.5">{m.subject?.code}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm text-slate-500 hidden sm:block">{m.total}/{MAX_TOTAL}</span>
                              <Badge variant={GRADE_BADGE[m.grade] ?? 'outline'} className="text-base py-1 px-3">
                                {m.grade ?? '—'}
                              </Badge>
                              {isExp ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                          </button>

                          {isExp && (
                            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-5 py-2 font-medium text-slate-500 text-left">Test</th>
                                    <th className="px-5 py-2 font-medium text-slate-500 text-center">Max</th>
                                    <th className="px-5 py-2 font-medium text-slate-500 text-center">Score</th>
                                    <th className="px-5 py-2 font-medium text-slate-500 text-center">Grade</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                  {[
                                    { label: 'Quiz 1', score: m.q1 },
                                    { label: 'Quiz 2', score: m.q2 },
                                    { label: 'Quiz 3', score: m.q3 },
                                  ].map(({ label, score }) => (
                                    <tr key={label}>
                                      <td className="px-5 py-2.5 text-slate-700 dark:text-slate-300">{label}</td>
                                      <td className="px-5 py-2.5 text-center text-slate-500">20</td>
                                      <td className="px-5 py-2.5 text-center font-mono font-bold">{score}</td>
                                      <td className="px-5 py-2.5 text-center text-slate-500">
                                        {Math.round((score / 20) * 100)}%
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-white dark:bg-slate-950 font-semibold">
                                    <td className="px-5 py-2.5">Total</td>
                                    <td className="px-5 py-2.5 text-center text-slate-500">{MAX_TOTAL}</td>
                                    <td className="px-5 py-2.5 text-center font-mono">{m.total}</td>
                                    <td className="px-5 py-2.5 text-center">
                                      <Badge variant={GRADE_BADGE[m.grade] ?? 'outline'}>{m.grade}</Badge>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
