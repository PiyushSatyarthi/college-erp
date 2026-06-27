import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  ChevronLeft, CheckSquare, Search, Check, X, Minus,
  Users, Clock, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sessionsApi } from '@/lib/api';

type AttStatus = 'Present' | 'Absent' | 'Late';

export function FacultySessionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(
    () => sessionsApi.get(id!) as Promise<any>,
    [id]
  );

  const [search,    setSearch]    = useState('');
  const [attMap,    setAttMap]    = useState<Record<string, AttStatus>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [markAll,   setMarkAll]   = useState<AttStatus | null>(null);

  const session: any  = (data as any)?.session ?? null;
  const roster: any[] = (data as any)?.roster ?? [];

  // Pre-fill attMap from already-saved records whenever data reloads
  useMemo(() => {
    if (!roster.length) return;
    const initial: Record<string, AttStatus> = {};
    roster.forEach((r: any) => {
      if (r.attendance?.status) initial[r.id] = r.attendance.status as AttStatus;
    });
    setAttMap(initial);
    // If all have been marked already, set submitted flag
    const allMarked = roster.every((r: any) => r.attendance?.status);
    if (allMarked && roster.length > 0) setSubmitted(true);
  }, [data]);

  const filteredRoster = roster.filter((r: any) =>
    !search ||
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const setStatus = (studentId: string, status: AttStatus) =>
    setAttMap((prev) => ({ ...prev, [studentId]: status }));

  const markAllAs = (status: AttStatus) => {
    setMarkAll(status);
    const next: Record<string, AttStatus> = {};
    roster.forEach((r: any) => { next[r.id] = status; });
    setAttMap(next);
  };

  const presentCount = Object.values(attMap).filter((s) => s === 'Present').length;
  const lateCount    = Object.values(attMap).filter((s) => s === 'Late').length;
  const absentCount  = Object.values(attMap).filter((s) => s === 'Absent').length;
  const unmarked     = roster.filter((r: any) => !attMap[r.id]).length;

  const handleSubmit = async () => {
    if (unmarked > 0) {
      toast('error', `${unmarked} student(s) not yet marked. Please mark all before finishing.`);
      return;
    }
    setSaving(true);
    try {
      const records = roster.map((r: any) => ({
        studentId: r.id,
        status: attMap[r.id] ?? 'Absent',
      }));
      await sessionsApi.markAttendance(id!, records);
      toast('success', 'Attendance saved and session marked as Completed.');
      setSubmitted(true);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading session…
      </div>
    );
  }
  if (error) return <ErrorBanner message={error} onRetry={refetch} />;
  if (!session) return <ErrorBanner message="Session not found." />;

  const isCancelled = session.status === 'Cancelled';
  const isCompleted = session.status === 'Completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/faculty/sessions">
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isCompleted ? 'Attendance Report' : 'Take Attendance'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {session.subject?.name} · Division {session.division}
            </p>
          </div>
        </div>
        {!isCancelled && !isCompleted && (
          <Button onClick={handleSubmit} disabled={saving || unmarked > 0}>
            {saving
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              : <><CheckSquare className="mr-2 h-4 w-4" />Finish &amp; Save</>
            }
          </Button>
        )}
      </div>

      {/* Unmarked warning */}
      {!isCompleted && !isCancelled && unmarked > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {unmarked} student{unmarked > 1 ? 's' : ''} not yet marked.
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Attendance already submitted. You can review it below.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Session info card */}
        <Card className="md:col-span-1 border-l-4 border-l-blue-600">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">Session Info</h2>
              <Badge variant={
                isCancelled ? 'danger' : isCompleted ? 'success' : 'warning'
              }>{session.status}</Badge>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: 'Subject',   value: session.subject?.name },
                { label: 'Code',      value: session.subject?.code },
                { label: 'Division',  value: `Division ${session.division}` },
                { label: 'Date',      value: new Date(session.session_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) },
                { label: 'Time',      value: `${session.start_time} – ${session.end_time}` },
                { label: 'Year',      value: session.academic_year?.name },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900 dark:text-white text-right max-w-[160px]">{value ?? '—'}</span>
                </div>
              ))}
            </div>

            {/* Live stats */}
            <div className="pt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{presentCount}</p>
                <p className="text-[10px] text-green-600 dark:text-green-500">Present</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{lateCount}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-500">Late</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-2">
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{absentCount}</p>
                <p className="text-[10px] text-red-600 dark:text-red-500">Absent</p>
              </div>
            </div>

            <div className="text-xs text-slate-400 text-center">{roster.length} students in roster</div>
          </CardContent>
        </Card>

        {/* Roster card */}
        <Card className="md:col-span-2">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search name or roll number…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              {!isCompleted && !isCancelled && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => markAllAs('Present')}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/40 transition-colors">
                    All Present
                  </button>
                  <button onClick={() => markAllAs('Absent')}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40 transition-colors">
                    All Absent
                  </button>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500 w-24">Roll No</th>
                    <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredRoster.map((student: any) => {
                    const status = attMap[student.id] ?? null;
                    return (
                      <tr key={student.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors
                          ${!status && !isCompleted && !isCancelled ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{student.roll_number}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {(student.user?.name ?? '?').charAt(0).toUpperCase()}
                            </div>
                            {student.user?.name ?? '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isCompleted || isCancelled ? (
                            <div className="flex justify-center">
                              {status === 'Present' && <Badge variant="success">Present</Badge>}
                              {status === 'Late'    && <Badge variant="warning">Late</Badge>}
                              {status === 'Absent'  && <Badge variant="danger">Absent</Badge>}
                              {!status              && <Badge variant="outline">—</Badge>}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              {(['Present', 'Late', 'Absent'] as AttStatus[]).map((s) => (
                                <button key={s} onClick={() => setStatus(student.id, s)}
                                  className={`h-7 px-2.5 text-xs font-medium rounded-md border transition-colors
                                    ${status === s
                                      ? s === 'Present' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                        : s === 'Late'    ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                        : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                      : 'border-slate-200 text-slate-400 hover:border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}>
                                  {s === 'Present' ? <Check className="w-3 h-3" /> : s === 'Late' ? <Minus className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  <span className="ml-1">{s}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRoster.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-slate-400">
                        {roster.length === 0 ? 'No students in roster for this division.' : 'No results match your search.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500">
              <span>{filteredRoster.length} shown · {roster.length} total</span>
              {!isCompleted && !isCancelled && (
                <span className={unmarked > 0 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>
                  {unmarked > 0 ? `${unmarked} unmarked` : 'All students marked ✓'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
