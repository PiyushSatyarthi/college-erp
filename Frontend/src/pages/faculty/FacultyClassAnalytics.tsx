import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { assignmentsApi, marksApi, sessionsApi } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';

const GRADE_ORDER = ['F', 'C', 'B', 'B+', 'A', 'A+', 'O'];

export function FacultyClassAnalytics() {
  const { data: assignData } = useFetch(() => assignmentsApi.mySubjects() as Promise<any>);
  const assignments: any[] = (assignData as any)?.subjects ?? [];

  const [selected, setSelected] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const subjectId = selected?.subject?.id;
  const division  = selected?.division;

  const { data: distData, loading: dl } = useFetch(
    () => subjectId ? (marksApi.gradeDistribution(subjectId, division) as Promise<any>) : Promise.resolve(null),
    [subjectId, division]
  );

  const { data: sessionsData, loading: sl } = useFetch(
    () => subjectId ? (sessionsApi.list({ subjectId, division }) as Promise<any>) : Promise.resolve(null),
    [subjectId, division]
  );

  const dist = (distData as any)?.distribution ?? {};
  const gradeChartData = GRADE_ORDER.filter((g) => dist[g] > 0).map((g) => ({ grade: g, students: dist[g] }));

  const sessions: any[] = (sessionsData as any)?.sessions ?? [];
  // Attendance per completed session, ordered by date
  const sessionChartData = sessions
    .filter((s: any) => s.status === 'Completed')
    .sort((a: any, b: any) => a.session_date.localeCompare(b.session_date))
    .slice(-8); // last 8 sessions

  const handleExport = async () => {
    if (!subjectId) return;
    setExporting(true);
    try {
      const rows = gradeChartData.map((g) => ({ Grade: g.grade, Students: g.students }));
      downloadCsv(`${selected.subject.name}-grade-distribution`, rows);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Class Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selected ? `${selected.subject?.name} (Div ${selected.division})` : 'Select a subject below'}
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!selected || exporting}>
          {exporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Exporting…</> : <><Download className="mr-2 h-4 w-4" /> Export Report</>}
        </Button>
      </div>

      <Select
        value={selected ? `${selected.subject?.id}__${selected.division}` : ''}
        onChange={(e) => {
          if (!e.target.value) { setSelected(null); return; }
          const [sId, div] = e.target.value.split('__');
          setSelected(assignments.find((a: any) => a.subject?.id === sId && a.division === div) ?? null);
        }}
        className="max-w-md"
      >
        <option value="">— Select subject & division —</option>
        {assignments.map((a: any) => (
          <option key={`${a.subject?.id}__${a.division}`} value={`${a.subject?.id}__${a.division}`}>
            {a.subject?.name} · Div {a.division}
          </option>
        ))}
      </Select>

      {!selected ? (
        <Card><CardContent className="py-20 text-center text-slate-400">Select a subject to see analytics.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Session Attendance</h2>
            </div>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                {sl ? (
                  <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
                ) : sessionChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">No completed sessions yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionChartData.map((s: any) => ({
                      date: new Date(s.session_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                    }))} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey={() => 1} fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Showing last {sessionChartData.length} completed sessions. Open a session for detailed roster.
              </p>
            </CardContent>
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Grade Distribution</h2>
            </div>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                {dl ? (
                  <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /></div>
                ) : gradeChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">No published marks yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="grade" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                      <Bar dataKey="students" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
