import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { FormField, Select, Textarea } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { attendanceApi, condonationsApi } from '@/lib/api';

export function StudentAttendance() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => attendanceApi.student() as Promise<any>);

  const [isApplyOpen,  setIsApplyOpen]  = useState(false);
  const [selectedId,   setSelectedId]   = useState('');
  const [reason,       setReason]       = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const subjects: any[] = (data as any)?.subjects ?? [];

  const totalSessions = subjects.reduce((acc: number, s: any) => acc + (s.totalSessions ?? 0), 0);
  const totalPresent  = subjects.reduce((acc: number, s: any) => acc + (s.present ?? 0) + (s.late ?? 0), 0);
  const totalAbsent   = subjects.reduce((acc: number, s: any) => acc + (s.absent ?? 0), 0);
  const overallPct    = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : null;

  const lowAtt = subjects.filter((s: any) => s.percentage !== null && s.percentage < 75);

  const circumference = 2 * Math.PI * 46;
  const offset = overallPct !== null ? circumference - (overallPct / 100) * circumference : circumference;

  const openCondonation = (subjectId: string) => {
    setSelectedId(subjectId);
    setReason('');
    setIsApplyOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedId) { toast('error', 'Please select a subject.'); return; }
    if (reason.trim().length < 50) { toast('error', 'Please provide at least 50 characters of explanation.'); return; }
    setSubmitting(true);
    try {
      await condonationsApi.apply(selectedId, reason.trim());
      toast('success', 'Condonation request submitted. Your HOD will review it shortly.');
      setIsApplyOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Current academic year — all subjects</p>
      </div>

      {/* Condonation dialog */}
      <Dialog isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)}
        title="Apply for Condonation"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApplyOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || reason.trim().length < 50}>
              {submitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                : 'Submit Application'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <FormField label="Subject" required>
            <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">Select subject…</option>
              {lowAtt.map((s: any) => (
                <option key={s.subject?.id} value={s.subject?.id}>
                  {s.subject?.name} — {s.percentage}% attendance
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Detailed Reason" required>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="Explain the reason for your low attendance in detail…"
            />
            <p className={`text-xs text-right mt-1 ${reason.trim().length < 50 ? 'text-red-500' : 'text-slate-400'}`}>
              {reason.trim().length} / 50 minimum characters
            </p>
          </FormField>
          {selectedId && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20 p-3 text-xs text-blue-800 dark:text-blue-300">
              After approval your attendance shortage for this subject will be condoned.
            </div>
          )}
        </div>
      </Dialog>

      {/* Overall hero */}
      <Card className="bg-blue-600 text-white border-none shadow-md overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center shrink-0">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none"
                  stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                {overallPct !== null && (
                  <circle cx="50" cy="50" r="46" fill="none"
                    stroke="white" strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round" />
                )}
              </svg>
              <span className="text-2xl font-bold z-10">
                {overallPct !== null ? `${overallPct}%` : '—'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Overall Attendance</h2>
              <p className="opacity-90 mt-1 text-sm">
                {totalPresent} attended out of {totalSessions} total sessions
              </p>
              {overallPct !== null && overallPct < 75 && (
                <p className="mt-2 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                  ⚠ Below 75% minimum requirement
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalPresent}</p>
              <p className="text-xs opacity-80 mt-1">Present + Late</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{totalAbsent}</p>
              <p className="text-xs opacity-80 mt-1">Absent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low attendance alert */}
      {lowAtt.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-400">Low Attendance Warning</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              You are below 75% in {lowAtt.map((s: any) => s.subject?.name).join(', ')}.
              Apply for condonation before the deadline.
            </p>
          </div>
        </div>
      )}

      {/* Per-subject cards */}
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <p>No attendance records yet. Sessions will appear here once marked.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((s: any) => {
            const pct    = s.percentage;
            const isLow  = pct !== null && pct < 75;
            const isGood = pct !== null && pct >= 75;
            const barPct = pct ?? 0;

            return (
              <Card key={s.subject?.id} className={isLow ? 'border-red-200 dark:border-red-900/40' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-tight truncate">{s.subject?.name}</CardTitle>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">
                        {s.subject?.code} · Sem {s.subject?.semester}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant={isLow ? 'danger' : isGood ? 'success' : 'outline'}>
                        {pct !== null ? `${pct}%` : '—'}
                      </Badge>
                      {isLow && (
                        <button onClick={() => openCondonation(s.subject?.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800 rounded px-2 py-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          Apply Condonation
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3 mt-1">
                    <div
                      className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(barPct, 100)}%` }}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="flex justify-between text-sm">
                    <div className="flex gap-4 text-slate-500">
                      <span><strong className="text-slate-900 dark:text-white">{s.present ?? 0}</strong> Present</span>
                      <span><strong className="text-slate-900 dark:text-white">{s.late ?? 0}</strong> Late</span>
                      <span><strong className="text-slate-900 dark:text-white">{s.absent ?? 0}</strong> Absent</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {isGood
                        ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600">Eligible</span></>
                        : pct !== null
                        ? <><AlertTriangle className="h-3.5 w-3.5 text-red-500" /><span className="text-red-500">At risk</span></>
                        : null
                      }
                    </div>
                  </div>

                  {/* Sessions count */}
                  <p className="text-xs text-slate-400 mt-2">
                    {s.totalSessions ?? 0} session{s.totalSessions !== 1 ? 's' : ''} conducted
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
