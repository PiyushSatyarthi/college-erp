import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { DashboardSkeleton, ErrorBanner, Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Search, Download, Eye, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { studentsApi, attendanceApi, api } from '@/lib/api';

export function HodAttendance() {
  const { toast } = useToast();

  // Get dept ID from profile
  const { data: meData } = useFetch(() => api.get<any>('/api/auth/me'));
  const deptId: string | undefined = meData?.profile?.department?.id;

  const { data: studentsData, loading, error, refetch } = useFetch(
    () => deptId ? (studentsApi.list({ departmentId: deptId }) as Promise<any>) : Promise.resolve(null),
    [deptId]
  );

  const { data: summaryData } = useFetch(() => attendanceApi.summary() as Promise<any>);

  const [search,    setSearch]    = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Student detail modal
  const [viewStudent, setViewStudent] = useState<any>(null);
  const [attLoading,  setAttLoading]  = useState(false);
  const [attDetail,   setAttDetail]   = useState<any>(null);

  const students: any[] = studentsData?.students ?? [];

  const filtered = students.filter((s: any) => {
    const name = (s.user?.name ?? '').toLowerCase();
    const roll = (s.roll_number ?? '').toLowerCase();
    const q    = search.toLowerCase();
    return (!q || name.includes(q) || roll.includes(q))
      && (!filterDiv  || s.division === filterDiv)
      && (!filterYear || String(s.year) === filterYear);
  });

  const deptSummary = (summaryData as any)?.summary?.[0];

  const openDetail = async (student: any) => {
    setViewStudent(student);
    setAttDetail(null);
    setAttLoading(true);
    try {
      const res = await attendanceApi.student(student.id) as any;
      setAttDetail(res);
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to load attendance.');
    } finally {
      setAttLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const defaulters = filtered.filter((s: any) => {
    // Flag students — we don't have overall % without loading each; flag as "check required"
    return false; // Will be shown in detail dialog
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Department Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {meData?.profile?.department?.name ?? 'Your department'} · {students.length} students enrolled
          </p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      {/* Dept summary */}
      {deptSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-blue-50/60 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
            <CardContent className="p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">Dept Avg Attendance</p>
              <p className={`text-3xl font-bold mt-1 ${(deptSummary.attendancePercentage ?? 0) < 75 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                {deptSummary.attendancePercentage !== null ? `${deptSummary.attendancePercentage}%` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Active Students</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{deptSummary.studentCount ?? students.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Shown in Table</p>
              <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{filtered.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student detail dialog */}
      <Dialog
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title={`Attendance — ${viewStudent?.user?.name ?? ''}`}
        footer={<Button variant="outline" onClick={() => setViewStudent(null)}>Close</Button>}
      >
        {attLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : attDetail ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-sm text-slate-500">
              Roll: <strong>{viewStudent?.roll_number}</strong> · Div {viewStudent?.division} · Year {viewStudent?.year}
            </p>
            {(attDetail.subjects ?? []).map((s: any) => {
              const pct = s.percentage;
              const isLow = pct !== null && pct < 75;
              return (
                <div key={s.subject?.id} className={`p-3 rounded-lg border ${isLow ? 'border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{s.subject?.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.subject?.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{s.present + s.late}/{s.totalSessions}</span>
                      <Badge variant={isLow ? 'danger' : 'success'}>
                        {pct !== null ? `${pct}%` : '—'}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(pct ?? 0, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {(attDetail.subjects ?? []).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No attendance records yet.</p>
            )}
          </div>
        ) : null}
      </Dialog>

      {/* Table */}
      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search name or roll no…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterDiv} onChange={(e) => setFilterDiv(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option value="">All Divisions</option>
            {['A','B','C','D'].map(d => <option key={d} value={d}>Division {d}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option value="">All Years</option>
            {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          {(search || filterDiv || filterYear) && (
            <button onClick={() => { setSearch(''); setFilterDiv(''); setFilterYear(''); }}
              className="text-sm text-blue-600 hover:underline">Clear</button>
          )}
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {['Roll No', 'Student Name', 'Course', 'Div / Year', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.roll_number}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {(s.user?.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p>{s.user?.name}</p>
                          <p className="text-xs text-slate-400">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{s.course?.name ?? '—'}</td>
                    <td className="px-4 py-3">Div {s.division} / Year {s.year}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.is_active ? 'success' : 'danger'}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(s)}
                        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        <Eye className="w-3.5 h-3.5" /> View Attendance
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            {filtered.length} of {students.length} students · Click "View Attendance" to see per-subject breakdown
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
