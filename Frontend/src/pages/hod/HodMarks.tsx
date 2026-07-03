import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Search, BarChart2, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { subjectsApi, coursesApi, marksApi, api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const GRADE_ORDER = ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'];
const PASS_GRADES = new Set(['O', 'A+', 'A', 'B+', 'B', 'C']);
const GRADE_COLOR: Record<string, string> = {
  O: '#1E40AF', 'A+': '#2563EB', A: '#3B82F6', 'B+': '#60A5FA',
  B: '#93C5FD', C: '#FCD34D', F: '#F87171',
};

export function HodMarks() {
  const { data: meData }      = useFetch(() => api.get<any>('/api/auth/me'));
  const deptId: string | undefined = meData?.profile?.department?.id;

  const { data: coursesData } = useFetch(
    () => deptId ? (coursesApi.list({ departmentId: deptId }) as Promise<any>) : Promise.resolve(null),
    [deptId]
  );

  const courseIds: string[] = (coursesData as any)?.courses?.map((c: any) => c.id) ?? [];

  // Load all subjects for the dept's courses
  const { data: subjectsData, loading, error, refetch } = useFetch(
    () => courseIds.length
      ? Promise.all(courseIds.map(id => (subjectsApi.list({ courseId: id }) as Promise<any>)))
          .then(results => ({ subjects: results.flatMap(r => r.subjects ?? []) }))
      : Promise.resolve({ subjects: [] }),
    [courseIds.join(',')]
  );

  const [search,     setSearch]     = useState('');
  const [detailSubj, setDetailSubj] = useState<any>(null);
  const [distData,   setDistData]   = useState<any>(null);
  const [distLoading, setDistLoading] = useState(false);

  const subjects: any[] = (subjectsData as any)?.subjects ?? [];
  const filtered = subjects.filter((s: any) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = useCallback(async (subject: any) => {
    setDetailSubj(subject);
    setDistData(null);
    setDistLoading(true);
    try {
      const res = await marksApi.gradeDistribution(subject.id) as any;
      setDistData(res);
    } catch {
      setDistData({ distribution: {} });
    } finally {
      setDistLoading(false);
    }
  }, []);

  // Compute pass stats from distribution
  const computeStats = (dist: Record<string, number>) => {
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    const passed = Object.entries(dist)
      .filter(([g]) => PASS_GRADES.has(g))
      .reduce((a, [, v]) => a + v, 0);
    const passPct = total > 0 ? Math.round((passed / total) * 100) : null;
    const chartData = GRADE_ORDER.filter(g => dist[g] > 0).map(g => ({ grade: g, count: dist[g] }));
    return { total, passed, passPct, chartData };
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const dist = distData?.distribution ?? {};
  const stats = computeStats(dist);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Marks Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {meData?.profile?.department?.name ?? 'Department'} · {subjects.length} subjects
          </p>
        </div>
        <Button variant="outline"><BarChart2 className="mr-2 h-4 w-4" /> Export Analysis</Button>
      </div>

      {/* Grade distribution detail dialog */}
      <Dialog
        isOpen={!!detailSubj}
        onClose={() => setDetailSubj(null)}
        title={`${detailSubj?.name} — Grade Distribution`}
        footer={<Button variant="outline" onClick={() => setDetailSubj(null)}>Close</Button>}
      >
        {distLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-xs text-slate-500">Students</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-green-600">Passed</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.passed}</p>
              </div>
              <div className={`text-center p-3 rounded-lg ${(stats.passPct ?? 100) < 60 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                <p className="text-xs text-slate-500">Pass %</p>
                <p className={`text-2xl font-bold ${(stats.passPct ?? 100) < 60 ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>
                  {stats.passPct !== null ? `${stats.passPct}%` : '—'}
                </p>
              </div>
            </div>

            {/* Bar chart */}
            {stats.chartData.length > 0 ? (
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="grade" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}
                      fill="#2563EB"
                      label={{ position: 'top', fontSize: 11, fill: '#64748b' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-slate-400 text-sm py-6">No marks published for this subject yet.</p>
            )}

            {/* Grade breakdown table */}
            {stats.chartData.length > 0 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Grade</th>
                      <th className="px-4 py-2 text-center font-medium text-slate-500">Students</th>
                      <th className="px-4 py-2 text-center font-medium text-slate-500">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {GRADE_ORDER.filter(g => (dist[g] ?? 0) > 0).map(g => (
                      <tr key={g}>
                        <td className="px-4 py-2 font-bold" style={{ color: GRADE_COLOR[g] }}>{g}</td>
                        <td className="px-4 py-2 text-center">{dist[g]}</td>
                        <td className="px-4 py-2 text-center text-slate-500">
                          {stats.total > 0 ? `${Math.round((dist[g] / stats.total) * 100)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Subjects table */}
      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search subject…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {['Subject', 'Code', 'Course', 'Semester', 'Credits', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{s.code}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{s.course?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">Sem {s.semester}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{s.credits} cr</Badge></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 h-7 px-2 text-xs"
                        onClick={() => openDetail(s)}>
                        <BarChart2 className="w-3.5 h-3.5 mr-1" /> View Grades
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No subjects found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            {filtered.length} subjects · Click "View Grades" to see grade distribution and pass % for any subject
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
