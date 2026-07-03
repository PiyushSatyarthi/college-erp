import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useFetch } from '@/hooks/useFetch';
import { studentsApi, subjectsApi, coursesApi, facultyApi, sessionsApi, condonationsApi, marksApi, attendanceApi, api } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';

type ReportKey = 'defaulters' | 'results' | 'workload' | 'condonations';

export function HodReports() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<ReportKey | null>(null);

  const { data: meData } = useFetch(() => api.get<any>('/api/auth/me'));
  const deptId: string | undefined = meData?.profile?.department?.id;
  const deptName: string = meData?.profile?.department?.name ?? 'Department';

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
    const { students } = await studentsApi.list({ departmentId: deptId }) as any;
    const rows: Record<string, unknown>[] = [];
    for (const s of students ?? []) {
      const att = await attendanceApi.student(s.id) as any;
      for (const subj of att.subjects ?? []) {
        if (subj.percentage !== null && subj.percentage < 75) {
          rows.push({
            'Roll Number': s.roll_number, 'Student': s.user?.name, 'Division': s.division,
            'Subject': subj.subject?.name, 'Attendance %': subj.percentage,
          });
        }
      }
    }
    downloadCsv(`${deptName}-defaulters`, rows);
  });

  const genResults = () => run('results', async () => {
    const { courses } = await coursesApi.list({ departmentId: deptId }) as any;
    const allSubjects: any[] = [];
    for (const c of courses ?? []) {
      const { subjects } = await subjectsApi.list({ courseId: c.id }) as any;
      allSubjects.push(...(subjects ?? []));
    }
    const rows: Record<string, unknown>[] = [];
    for (const subj of allSubjects) {
      const dist = await marksApi.gradeDistribution(subj.id) as any;
      const d = dist.distribution ?? {};
      const total = Object.values(d).reduce((a: number, b: any) => a + b, 0);
      const passed = Object.entries(d).filter(([g]) => g !== 'F').reduce((a, [, v]: any) => a + v, 0);
      rows.push({
        'Subject': subj.name, 'Code': subj.code, 'Semester': subj.semester,
        'Total Graded': total, 'Pass %': total > 0 ? Math.round((passed / total) * 100) : 0,
      });
    }
    downloadCsv(`${deptName}-result-analysis`, rows);
  });

  const genWorkload = () => run('workload', async () => {
    const { faculty } = await facultyApi.list({ departmentId: deptId }) as any;
    const rows: Record<string, unknown>[] = [];
    for (const f of faculty ?? []) {
      const { sessions } = await sessionsApi.list({ facultyId: f.id } as any) as any;
      rows.push({
        'Faculty': f.user?.name, 'Designation': f.designation ?? '—',
        'Total Sessions': (sessions ?? []).length,
        'Completed': (sessions ?? []).filter((s: any) => s.status === 'Completed').length,
      });
    }
    downloadCsv(`${deptName}-faculty-workload`, rows);
  });

  const genCondonations = () => run('condonations', async () => {
    const { students } = await studentsApi.list({ departmentId: deptId }) as any;
    const deptStudentIds = new Set((students ?? []).map((s: any) => s.id));
    const { condonations } = await condonationsApi.list() as any;
    const rows = (condonations ?? [])
      .filter((c: any) => deptStudentIds.has(c.student?.id))
      .map((c: any) => ({
        'Student': c.student?.user?.name, 'Subject': c.subject?.name, 'Status': c.status,
        'Applied On': new Date(c.applied_at).toLocaleDateString('en-IN'), 'Reason': c.reason,
      }));
    downloadCsv(`${deptName}-condonation-summary`, rows);
  });

  const REPORTS: { key: ReportKey; title: string; desc: string; format: string; bg: string; action: () => void }[] = [
    { key: 'defaulters',   title: 'Defaulters List (Department)',       desc: 'Students below 75% attendance per subject',     format: 'CSV', bg: 'bg-red-50/80 dark:bg-red-900/10',   action: genDefaulters },
    { key: 'results',      title: 'Result Analysis',                    desc: 'Pass/fail breakdown by subject',                 format: 'CSV', bg: 'bg-blue-50/80 dark:bg-blue-900/10', action: genResults },
    { key: 'workload',     title: 'Faculty Workload',                   desc: 'Sessions conducted per faculty member',          format: 'CSV', bg: 'bg-slate-50/80 dark:bg-slate-900/50', action: genWorkload },
    { key: 'condonations', title: 'Condonation Summary (Department)',   desc: 'All condonation requests for this department',  format: 'CSV', bg: 'bg-amber-50/80 dark:bg-amber-900/10', action: genCondonations },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Department Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{deptName} — generate real exportable data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORTS.map((r) => (
          <Card key={r.key} className={`flex flex-col border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors ${r.bg}`}>
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <FileText className="w-8 h-8 text-slate-400 mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{r.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10">{r.desc}</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
                <span className="text-xs font-mono font-medium text-slate-400">{r.format}</span>
                <Button variant="outline" size="sm" onClick={r.action} disabled={generating !== null || !deptId}>
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
