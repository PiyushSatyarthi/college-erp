import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { XCircle, CheckCircle2, ArrowRight, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { attendanceApi, api } from '@/lib/api';

export function StudentHallTicket() {
  const navigate = useNavigate();

  // Both fetches run in parallel
  const { data: meData,   loading: meLoading }  = useFetch(() => api.get<any>('/api/auth/me'));
  const { data: attData,  loading: attLoading, error, refetch } = useFetch(
    () => attendanceApi.student() as Promise<any>
  );

  const loading = meLoading || attLoading;

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const subjects: any[]  = (attData as any)?.subjects ?? [];
  const shortfalls       = subjects.filter((s: any) => s.percentage !== null && s.percentage < 75);
  const isEligible       = subjects.length > 0 && shortfalls.length === 0;
  const noDataYet        = subjects.length === 0;

  const profile     = meData?.profile;
  const studentName = meData?.name ?? '—';

  return (
    <div className="space-y-6">
      {/* Screen-only header — hidden when printing */}
      <div className="print:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hall Ticket</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Examination eligibility and admission card</p>
      </div>

      {/* ── Eligibility banner (screen only) ─────────────────────────────── */}
      {isEligible && (
        <div className="print:hidden rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 shrink-0" />
            <p className="text-sm font-medium text-green-800 dark:text-green-400">
              Eligible! Attendance is at or above 75% in all subjects.
            </p>
          </div>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Hall Ticket
          </Button>
        </div>
      )}

      {!isEligible && !noDataYet && (
        <div className="print:hidden rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 p-4">
          <div className="flex items-start gap-4">
            <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-base font-bold text-red-800 dark:text-red-400 mb-1">
                Not eligible — attendance shortfall
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                You are below 75% in the following subjects:
              </p>
              <div className="rounded-lg overflow-hidden border border-red-100 dark:border-red-900/30 mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-red-700 dark:text-red-400">Subject</th>
                      <th className="px-4 py-2 text-center font-medium text-red-700 dark:text-red-400">Attendance</th>
                      <th className="px-4 py-2 text-center font-medium text-red-700 dark:text-red-400">Shortfall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortfalls.map((s: any) => (
                      <tr key={s.subject?.id} className="border-t border-red-50 dark:border-red-900/20">
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{s.subject?.name}</td>
                        <td className="px-4 py-2 text-center font-mono text-red-600 font-bold">{s.percentage}%</td>
                        <td className="px-4 py-2 text-center text-red-500">{(75 - s.percentage).toFixed(1)}% below</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => navigate('/student/condonation')}>
                Apply for Condonation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {noDataYet && (
        <div className="print:hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 p-5 text-center text-slate-500 text-sm">
          No attendance records found yet. Your eligibility will show here once sessions have been marked.
        </div>
      )}

      {/* ── The actual hall ticket ─────────────────────────────────────────
           Always rendered so the print layout is in the DOM.
           When NOT eligible: screen shows it greyed-out; print shows a
           "NOT ELIGIBLE" watermark-style notice instead of blank.
      ─────────────────────────────────────────────────────────────────── */}

      {/* Print-only NOT ELIGIBLE notice (hidden on screen) */}
      {!isEligible && (
        <div className="hidden print:block text-center py-8">
          <p className="text-4xl font-black text-red-600 tracking-widest uppercase border-4 border-red-600 inline-block px-8 py-4 rounded-xl">
            NOT ELIGIBLE
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Attendance shortfall in:{' '}
            {shortfalls.map((s: any) => `${s.subject?.name} (${s.percentage}%)`).join(', ') || 'No records yet'}
          </p>
        </div>
      )}

      {/* Hall ticket card — greyed on screen when ineligible, always printable */}
      <div className={`transition-all ${!isEligible ? 'opacity-50 pointer-events-none grayscale print:opacity-100 print:grayscale-0 print:pointer-events-auto' : ''}`}>
        <Card className="border-t-8 border-t-blue-600 print:shadow-none print:border print:border-slate-300">
          <CardContent className="p-8 print:p-6">
            {/* College header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold print:bg-blue-600">
                  SV
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-900 dark:text-white print:text-black">
                    Shri Vivekanand College of Engineering
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest print:text-slate-600">
                    Examination Hall Ticket
                  </p>
                </div>
              </div>
            </div>

            {/* Student details grid */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-6 max-w-2xl mx-auto text-sm">
              {[
                { label: 'Student Name',  value: studentName },
                { label: 'Roll Number',   value: profile?.roll_number ?? '—' },
                { label: 'Course',        value: profile?.course?.name ?? '—' },
                { label: 'Department',    value: profile?.department?.name ?? '—' },
                { label: 'Division',      value: profile?.division ?? '—' },
                { label: 'Year',          value: profile?.year ? `Year ${profile.year}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-slate-400 print:text-slate-500 uppercase tracking-wide font-medium">{label}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 print:text-black">{value}</p>
                </div>
              ))}
            </div>

            {/* Subject eligibility table */}
            <div className="max-w-2xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-slate-500 mb-2">
                Subject-wise Attendance
              </p>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 print:border-slate-300 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 print:bg-slate-100 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500 print:text-slate-600">Subject</th>
                      <th className="px-4 py-2.5 text-center font-medium text-slate-500 print:text-slate-600">Attendance</th>
                      <th className="px-4 py-2.5 text-center font-medium text-slate-500 print:text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-200">
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-xs">
                          No attendance data available
                        </td>
                      </tr>
                    ) : subjects.map((s: any) => {
                      const pct   = s.percentage;
                      const ok    = pct !== null && pct >= 75;
                      const low   = pct !== null && pct < 75;
                      return (
                        <tr key={s.subject?.id}>
                          <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100 print:text-black">
                            {s.subject?.name}
                            <span className="ml-2 text-xs text-slate-400 font-mono">{s.subject?.code}</span>
                          </td>
                          <td className={`px-4 py-2.5 text-center font-mono font-bold ${low ? 'text-red-600' : ok ? 'text-green-600' : 'text-slate-400'}`}>
                            {pct !== null ? `${pct}%` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {ok  && <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full print:bg-transparent print:text-green-700">✓ Eligible</span>}
                            {low && <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full print:bg-transparent print:text-red-700">✗ Shortfall</span>}
                            {!ok && !low && <span className="text-xs text-slate-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-between items-end max-w-2xl mx-auto text-xs text-slate-400 print:text-slate-500">
              <div>
                <p>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="mt-0.5 print:block">
                  Status: <span className={`font-semibold ${isEligible ? 'text-green-600' : 'text-red-600'}`}>
                    {isEligible ? 'ELIGIBLE FOR EXAMINATIONS' : 'NOT ELIGIBLE'}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <div className="border-t border-slate-400 dark:border-slate-600 print:border-slate-400 w-32 mb-1" />
                <p>Controller of Examinations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
