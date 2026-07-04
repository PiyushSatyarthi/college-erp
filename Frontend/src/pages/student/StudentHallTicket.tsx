import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { XCircle, CheckCircle2, ArrowRight, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { attendanceApi, api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Opens a clean new window containing ONLY the hall ticket and prints it.
// This bypasses the sidebar/topbar entirely.
// ---------------------------------------------------------------------------
function printTicket(studentName: string, profile: any, subjects: any[], isEligible: boolean, shortfalls: any[]) {
  const rows = subjects.map((s: any) => {
    const pct = s.percentage;
    const ok  = pct !== null && pct >= 75;
    const low = pct !== null && pct < 75;
    const statusHtml = ok
      ? `<span style="color:#16a34a;font-weight:600;">✓ Eligible</span>`
      : low
      ? `<span style="color:#dc2626;font-weight:600;">✗ Shortfall</span>`
      : `<span style="color:#94a3b8;">—</span>`;
    return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:8px 12px;font-weight:500;">${s.subject?.name ?? '—'} <span style="color:#94a3b8;font-size:11px;font-family:monospace;">${s.subject?.code ?? ''}</span></td>
        <td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:${pct !== null && pct < 75 ? '#dc2626' : pct !== null ? '#16a34a' : '#94a3b8'};">${pct !== null ? pct + '%' : '—'}</td>
        <td style="padding:8px 12px;text-align:center;">${statusHtml}</td>
      </tr>`;
  }).join('');

  const eligibilityBanner = isEligible
    ? `<div style="margin-bottom:20px;padding:12px 16px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;color:#15803d;font-weight:600;font-size:14px;">
        ✓ ELIGIBLE FOR EXAMINATIONS
       </div>`
    : `<div style="margin-bottom:20px;padding:12px 16px;background:#fef2f2;border:1.5px solid #fca5a5;border-radius:8px;color:#dc2626;font-weight:700;font-size:16px;letter-spacing:2px;text-align:center;">
        ✗ NOT ELIGIBLE
        <div style="font-size:12px;font-weight:400;letter-spacing:0;margin-top:4px;color:#7f1d1d;">
          Shortfall in: ${shortfalls.map((s: any) => `${s.subject?.name} (${s.percentage}%)`).join(', ')}
        </div>
       </div>`;

  const details = [
    ['Student Name',  studentName],
    ['Roll Number',   profile?.roll_number ?? '—'],
    ['Course',        profile?.course?.name ?? '—'],
    ['Department',    profile?.department?.name ?? '—'],
    ['Division',      profile?.division ?? '—'],
    ['Year',          profile?.year ? `Year ${profile.year}` : '—'],
  ].map(([label, value]) => `
    <div style="display:flex;flex-direction:column;gap:2px;">
      <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;font-weight:600;">${label}</span>
      <span style="font-weight:600;font-size:14px;color:#0f172a;">${value}</span>
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Hall Ticket — ${studentName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; background: #fff; padding: 32px; max-width: 780px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
    th:nth-child(2), th:nth-child(3) { text-align: center; }
    @media print {
      body { padding: 16px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <!-- College header -->
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;">
    <div style="width:52px;height:52px;background:#2563eb;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:800;flex-shrink:0;">SV</div>
    <div>
      <div style="font-size:20px;font-weight:700;color:#0f172a;">Shri Vivekanand College of Engineering</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">Examination Hall Ticket</div>
    </div>
    <div style="margin-left:auto;font-size:11px;color:#94a3b8;">
      Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
    </div>
  </div>

  ${eligibilityBanner}

  <!-- Student details -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 40px;margin-bottom:28px;padding:20px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
    ${details}
  </div>

  <!-- Subjects table -->
  <div style="margin-bottom:28px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;font-weight:700;margin-bottom:8px;">Subject-wise Attendance</div>
    <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <table>
        <thead><tr><th>Subject</th><th>Attendance</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#94a3b8;">No records</td></tr>'}</tbody>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
    <div>
      <div>Status: <strong style="color:${isEligible ? '#16a34a' : '#dc2626'};">${isEligible ? 'ELIGIBLE FOR EXAMINATIONS' : 'NOT ELIGIBLE'}</strong></div>
      <div style="margin-top:4px;font-size:11px;color:#94a3b8;">This ticket is system-generated and valid only with official stamp.</div>
    </div>
    <div style="text-align:right;">
      <div style="border-top:1px solid #64748b;width:150px;margin-bottom:4px;"></div>
      <div>Controller of Examinations</div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  // Give the browser a tick to render, then print
  win.addEventListener('load', () => {
    win.focus();
    win.print();
    // Close the helper window after the print dialog closes
    win.addEventListener('afterprint', () => win.close());
  });
}

// ---------------------------------------------------------------------------

export function StudentHallTicket() {
  const navigate = useNavigate();

  const { data: meData,  loading: meLoading  } = useFetch(() => api.get<any>('/api/auth/me'));
  const { data: attData, loading: attLoading, error, refetch } = useFetch(
    () => attendanceApi.student() as Promise<any>
  );

  const loading = meLoading || attLoading;

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  const subjects: any[] = (attData as any)?.subjects ?? [];
  const shortfalls      = subjects.filter((s: any) => s.percentage !== null && s.percentage < 75);
  const isEligible      = subjects.length > 0 && shortfalls.length === 0;
  const noDataYet       = subjects.length === 0;

  const profile     = meData?.profile;
  const studentName = meData?.name ?? '—';

  const handlePrint = () =>
    printTicket(studentName, profile, subjects, isEligible, shortfalls);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hall Ticket</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Examination eligibility and admission card</p>
        </div>
        {isEligible && (
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Hall Ticket
          </Button>
        )}
      </div>

      {/* Eligibility status */}
      {isEligible && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/10 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 shrink-0" />
          <p className="text-sm font-medium text-green-800 dark:text-green-400">
            You are eligible for examinations. Attendance is at or above 75% in all subjects.
          </p>
        </div>
      )}

      {!isEligible && !noDataYet && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 p-4">
          <div className="flex items-start gap-4">
            <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-base font-bold text-red-800 dark:text-red-400 mb-3">
                Not eligible — attendance shortfall
              </h2>
              <table className="w-full text-sm mb-4 rounded-lg overflow-hidden border border-red-100 dark:border-red-900/30">
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
                      <td className="px-4 py-2 font-medium">{s.subject?.name}</td>
                      <td className="px-4 py-2 text-center font-mono font-bold text-red-600">{s.percentage}%</td>
                      <td className="px-4 py-2 text-center text-red-500">{(75 - s.percentage).toFixed(1)}% below</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => navigate('/student/condonation')}>
                Apply for Condonation <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {noDataYet && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 p-5 text-center text-slate-500 text-sm">
          No attendance records yet. Eligibility will appear here once sessions have been marked.
        </div>
      )}

      {/* Preview card (screen only — not the thing that gets printed) */}
      <Card className="border-t-8 border-t-blue-600">
        <CardContent className="p-8">
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">SV</div>
              <div className="text-left">
                <p className="text-lg font-bold text-slate-900 dark:text-white">Shri Vivekanand College of Engineering</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Examination Hall Ticket</p>
              </div>
            </div>
          </div>

          <div className={`transition-opacity ${!isEligible ? 'opacity-50' : ''}`}>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-6 max-w-2xl mx-auto text-sm">
              {[
                ['Student Name',  studentName],
                ['Roll Number',   profile?.roll_number ?? '—'],
                ['Course',        profile?.course?.name ?? '—'],
                ['Department',    profile?.department?.name ?? '—'],
                ['Division',      profile?.division ?? '—'],
                ['Year',          profile?.year ? `Year ${profile.year}` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{label}</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{value}</p>
                </div>
              ))}
            </div>

            <div className="max-w-2xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Subject-wise Attendance</p>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500">Subject</th>
                      <th className="px-4 py-2.5 text-center font-medium text-slate-500">Attendance</th>
                      <th className="px-4 py-2.5 text-center font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {subjects.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-xs">No attendance data yet</td></tr>
                    ) : subjects.map((s: any) => {
                      const pct = s.percentage;
                      const ok  = pct !== null && pct >= 75;
                      const low = pct !== null && pct < 75;
                      return (
                        <tr key={s.subject?.id}>
                          <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                            {s.subject?.name}
                            <span className="ml-2 text-xs text-slate-400 font-mono">{s.subject?.code}</span>
                          </td>
                          <td className={`px-4 py-2.5 text-center font-mono font-bold ${low ? 'text-red-600' : ok ? 'text-green-600' : 'text-slate-400'}`}>
                            {pct !== null ? `${pct}%` : '—'}
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs font-medium">
                            {ok  && <span className="text-green-700 dark:text-green-400">✓ Eligible</span>}
                            {low && <span className="text-red-600 dark:text-red-400">✗ Shortfall</span>}
                            {!ok && !low && <span className="text-slate-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {isEligible && (
            <div className="mt-6 flex justify-center">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" /> Print / Save as PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
