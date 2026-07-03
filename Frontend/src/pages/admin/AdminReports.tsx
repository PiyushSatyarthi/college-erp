import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormField';
import { FileText, Download, BarChart2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { studentsApi, subjectsApi, facultyApi, sessionsApi, condonationsApi, marksApi, attendanceApi } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';

type ReportKey = 'defaulters' | 'results' | 'workload' | 'condonations' | 'dailylog';

export function AdminReports() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<ReportKey | null>(null);
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));

  const run = async (key: ReportKey, fn: () => Promise<void>) => {
    setGenerating(key);
    try {
      await fn();
      toast('success', 'Report downloaded.');
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to generate report.');
    } finally {
      setGenerating(null);
    }
  };

  const genDefaulters = () => run('defaulters', async () => {
    const { students } = await studentsApi.list() as any;
    const rows: Record<string, unknown>[] = [];
    for (const s of students ?? []) {
      const att = await attendanceApi.student(s.id) as any;
      for (const subj of att.subjects ?? []) {
        if (subj.percentage !== null && subj.percentage < 75) {
          rows.push({
            'Roll Number': s.roll_number, 'Student Name': s.user?.name,
            'Course': s.course?.name, 'Division': s.division,
            'Subject': subj.subject?.name, 'Attendance %': subj.percentage,
            'Sessions Attended': subj.present + subj.late, 'Total Sessions': subj.totalSessions,
          });
        }
      }
    }
    downloadCsv('defaulters-list', rows);
  });

  const genResults = () => run('results', async () => {
    const { subjects } = await subjectsApi.list() as any;
    const rows: Record<string, unknown>[] = [];
    for (const subj of subjects ?? []) {
      const dist = await marksApi.gradeDistribution(subj.id) as any;
      const d = dist.distribution ?? {};
      const total = Object.values(d).reduce((a: number, b: any) => a + b, 0);
      const passed = Object.entries(d).filter(([g]) => g !== 'F').reduce((a, [, v]: any) => a + v, 0);
      rows.push({
        'Subject': subj.name, 'Code': subj.code, 'Semester': subj.semester,
        'Total Graded': total, 'Passed': passed,
        'Pass %': total > 0 ? Math.round((passed / total) * 100) : 0,
        'O': d.O ?? 0, 'A+': d['A+'] ?? 0, 'A': d.A ?? 0, 'B+': d['B+'] ?? 0, 'B': d.B ?? 0, 'C': d.C ?? 0, 'F': d.F ?? 0,
      });
    }
    downloadCsv('subject-result-analysis', rows);
  });

  const genWorkload = () => run('workload', async () => {
    const { faculty } = await facultyApi.list() as any;
    const rows: Record<string, unknown>[] = [];
    for (const f of faculty ?? []) {
      const { sessions } = await sessionsApi.list({ facultyId: f.id } as any) as any;
      const completed = (sessions ?? []).filter((s: any) => s.status === 'Completed').length;
      const cancelled = (sessions ?? []).filter((s: any) => s.status === 'Cancelled').length;
      rows.push({
        'Faculty Name': f.user?.name, 'Department': f.department?.name,
        'Total Sessions': (sessions ?? []).length, 'Completed': completed,
        'Scheduled': (sessions ?? []).length - completed - cancelled, 'Cancelled': cancelled,
      });
    }
    downloadCsv('faculty-workload', rows);
  });

  const genCondonations = () => run('condonations', async () => {
    const { condonations } = await condonationsApi.list() as any;
    const rows = (condonations ?? []).map((c: any) => ({
      'Student': c.student?.user?.name, 'Roll Number': c.student?.roll_number,
      'Subject': c.subject?.name, 'Status': c.status,
      'Applied On': new Date(c.applied_at).toLocaleDateString('en-IN'),
      'Reviewed By': c.reviewed_by?.name ?? '—',
      'Reason': c.reason,
    }));
    downloadCsv('condonation-summary', rows);
  });

  const genDailyLog = () => run('dailylog', async () => {
    const { sessions } = await sessionsApi.list({ date: logDate } as any) as any;
    const rows: Record<string, unknown>[] = [];
    for (const sess of sessions ?? []) {
      if (sess.status !== 'Completed') continue;
      const detail = await sessionsApi.get(sess.id) as any;
      for (const student of detail.roster ?? []) {
        rows.push({
          'Date': logDate, 'Subject': sess.subject?.name, 'Division': sess.division,
          'Time': `${sess.start_time}-${sess.end_time}`,
          'Roll Number': student.roll_number, 'Student': student.user?.name,
          'Status': student.attendance?.status ?? 'Unmarked',
        });
      }
    }
    downloadCsv(`attendance-log-${logDate}`, rows);
  });

  const REPORTS: { key: ReportKey; title: string; desc: string; format: string; icon: any; color: string; bg: string; action: () => void }[] = [
    { key: 'defaulters',   title: 'Defaulters List',          desc: 'Students with attendance below 75%, per subject',          format: 'CSV', icon: FileText,   color: 'text-red-500',   bg: 'bg-red-100 dark:bg-red-900/30',   action: genDefaulters },
    { key: 'results',      title: 'Subject Result Analysis',  desc: 'Pass % and grade distribution per subject',                format: 'CSV', icon: BarChart2,  color: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/30',  action: genResults },
    { key: 'workload',     title: 'Faculty Workload',         desc: 'Total sessions conducted per faculty member',              format: 'CSV', icon: FileText,   color: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/30',  action: genWorkload },
    { key: 'condonations', title: 'Condonation Summary',      desc: 'All approved, rejected, and pending requests',             format: 'CSV', icon: FileText,   color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', action: genCondonations },
    { key: 'dailylog',     title: 'Daily Attendance Log',     desc: 'Raw per-student attendance for a specific date',           format: 'CSV', icon: FileText,   color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800',  action: genDailyLog },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate and export real institutional data as CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map((r) => (
          <Card key={r.key} className="flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${r.bg}`}>
                  <r.icon className={`w-5 h-5 ${r.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{r.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{r.desc}</p>

                {r.key === 'dailylog' && (
                  <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="mb-3" />
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                <span className="text-xs font-mono font-medium text-slate-400">{r.format}</span>
                <Button variant="outline" size="sm" onClick={r.action} disabled={generating !== null}>
                  {generating === r.key
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                    : <><Download className="w-4 h-4 mr-2" /> Generate</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
