import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Download, Lock, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { marksApi } from '@/lib/api';

const GRADE_BADGE: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'outline'> = {
  O: 'success', 'A+': 'success', A: 'info', 'B+': 'info', B: 'warning', C: 'warning', F: 'danger',
};

const MAX_TOTAL = 60;

export function StudentMarks() {
  const { data, loading, error, refetch } = useFetch(() => marksApi.student() as Promise<any>);
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
  const semesters = Object.keys(bySem).map(Number).sort((a, b) => a - b);
  const displaySem = activeSem ?? semesters[semesters.length - 1] ?? null;
  const currentMarks: any[] = displaySem !== null ? (bySem[displaySem] ?? []) : [];

  // Semester stats
  const semTotal   = currentMarks.reduce((a, m) => a + (m.total ?? 0), 0);
  const semMax     = currentMarks.length * MAX_TOTAL;
  const semPct     = semMax > 0 ? Math.round((semTotal / semMax) * 100) : null;
  const totalCredits = currentMarks.reduce((a, m) => a + (m.subject?.credits ?? 0), 0);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Marks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Published results only</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download Marksheet</Button>
      </div>

      {marks.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            <Lock className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>No published marks yet. Check back after your faculty publishes results.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Semester tabs */}
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
            {semesters.map((sem) => (
              <Button key={sem}
                variant={displaySem === sem ? 'primary' : 'outline'}
                className={`shrink-0 ${displaySem !== sem ? 'text-slate-600 dark:text-slate-300' : ''}`}
                onClick={() => setActiveSem(sem)}>
                Sem {sem}
              </Button>
            ))}
          </div>

          {/* Semester summary card */}
          {displaySem !== null && (
            <Card className="bg-blue-50/60 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Semester {displaySem} Performance</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {semPct !== null ? `${semPct}%` : '—'}
                    </span>
                    <span className="text-sm text-slate-500">overall</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{totalCredits} credits · {currentMarks.length} subjects</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>{semTotal} / {semMax} total marks</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subject cards */}
          <div className="space-y-4">
            {currentMarks.map((m: any) => {
              const isExpanded = expanded[m.subject?.id] ?? true;
              return (
                <Card key={m.subject?.id} className="overflow-hidden">
                  <button className="w-full text-left bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                    onClick={() => toggleExpand(m.subject?.id)}>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{m.subject?.name}</h3>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">
                        {m.subject?.code} · {m.subject?.credits ?? '—'} credits
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">{m.total}/{MAX_TOTAL}</p>
                      </div>
                      <Badge variant={GRADE_BADGE[m.grade] ?? 'outline'} className="text-base py-1 px-3">
                        {m.grade ?? '—'}
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left bg-white dark:bg-slate-950">
                          <thead className="border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="px-4 py-3 font-medium text-slate-500">Test</th>
                              <th className="px-4 py-3 font-medium text-slate-500 text-center">Max</th>
                              <th className="px-4 py-3 font-medium text-slate-500 text-center">Score</th>
                              <th className="px-4 py-3 font-medium text-slate-500 text-center">%</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {[
                              { label: 'Quiz 1 (Q1)', score: m.q1 },
                              { label: 'Quiz 2 (Q2)', score: m.q2 },
                              { label: 'Quiz 3 (Q3)', score: m.q3 },
                            ].map(({ label, score }) => (
                              <tr key={label} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{label}</td>
                                <td className="px-4 py-3 text-center text-slate-500">20</td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 dark:text-white">{score}</td>
                                <td className="px-4 py-3 text-center text-slate-500">
                                  {Math.round((score / 20) * 100)}%
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50 dark:bg-slate-900/50 font-semibold">
                              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Total</td>
                              <td className="px-4 py-3 text-center text-slate-500">{MAX_TOTAL}</td>
                              <td className="px-4 py-3 text-center font-mono text-slate-900 dark:text-white">{m.total}</td>
                              <td className="px-4 py-3 text-center">
                                <Badge variant={GRADE_BADGE[m.grade] ?? 'outline'}>{m.grade}</Badge>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Mini progress bar */}
                      <div className="px-4 pb-4 pt-3">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min((m.total / MAX_TOTAL) * 100, 100)}%` }} />
                        </div>
                      </div>
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
