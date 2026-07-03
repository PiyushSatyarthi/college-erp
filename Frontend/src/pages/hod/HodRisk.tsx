import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Brain, AlertTriangle, TrendingDown, Users, CheckCircle2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { studentsApi, attendanceApi, api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export function HodRiskDashboard() {
  const navigate = useNavigate();

  const { data: meData }       = useFetch(() => api.get<any>('/api/auth/me'));
  const deptId: string | undefined = meData?.profile?.department?.id;

  const { data: studentsData, loading, error } = useFetch(
    () => deptId ? (studentsApi.list({ departmentId: deptId }) as Promise<any>) : Promise.resolve(null),
    [deptId]
  );
  const { data: summaryData } = useFetch(() => attendanceApi.summary() as Promise<any>);
  const { data: todayData }   = useFetch(() => attendanceApi.today() as Promise<any>);
  const { data: condonationCountData } = useFetch(
    () => api.get<any>('/api/condonations?status=Pending'),
  );

  const students: any[]  = (studentsData as any)?.students ?? [];
  const deptSummary: any = (summaryData as any)?.summary?.[0] ?? null;
  const today: any       = (todayData as any) ?? {};
  const pendingCond      = (condonationCountData as any)?.condonations?.length ?? 0;

  const avgPct = deptSummary?.attendancePercentage ?? null;

  // Risk tiers based on department average
  const highRiskThreshold = 65;
  const medRiskThreshold  = 75;

  // We can't compute per-student % without N+1 calls, so we show
  // department-level risk signals and let the HOD drill into attendance page
  const isHighRisk   = avgPct !== null && avgPct < highRiskThreshold;
  const isBorderline = avgPct !== null && avgPct >= highRiskThreshold && avgPct < medRiskThreshold;
  const isGood       = avgPct !== null && avgPct >= medRiskThreshold;

  const totalToday   = (today.present ?? 0) + (today.absent ?? 0) + (today.late ?? 0);
  const todayPct     = totalToday > 0 ? Math.round(((today.present + today.late) / totalToday) * 100) : null;

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={String(error)} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Brain className="w-6 h-6 text-blue-600" /> Risk Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time academic risk signals for {meData?.profile?.department?.name ?? 'your department'}
        </p>
      </div>

      {/* Risk signal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`border-2 ${isHighRisk ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' : isBorderline ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {isHighRisk || isBorderline
                ? <AlertTriangle className={`w-5 h-5 ${isHighRisk ? 'text-red-500' : 'text-amber-500'}`} />
                : <CheckCircle2 className="w-5 h-5 text-green-500" />}
              <h3 className={`font-semibold ${isHighRisk ? 'text-red-800 dark:text-red-400' : isBorderline ? 'text-amber-800 dark:text-amber-400' : 'text-green-800 dark:text-green-400'}`}>
                Department Attendance
              </h3>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <p className={`text-4xl font-bold ${isHighRisk ? 'text-red-600' : isBorderline ? 'text-amber-600' : 'text-green-600'}`}>
                {avgPct !== null ? `${avgPct}%` : '—'}
              </p>
              <Badge variant={isHighRisk ? 'danger' : isBorderline ? 'warning' : 'success'}>
                {isHighRisk ? 'High Risk' : isBorderline ? 'Borderline' : 'Healthy'}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isHighRisk
                ? `Overall attendance is critically low at ${avgPct}%. Immediate intervention required.`
                : isBorderline
                ? `Attendance is borderline at ${avgPct}%. Some students may be at risk of shortfall.`
                : `Department attendance is healthy at ${avgPct}%. Keep monitoring.`}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/hod/attendance')}>
              View Student Breakdown →
            </Button>
          </CardContent>
        </Card>

        <Card className={today.totalSessions > 0 && (todayPct ?? 100) < 70
          ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10'
          : 'border-slate-200 dark:border-slate-800'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Today's Sessions</h3>
            </div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
              {todayPct !== null ? `${todayPct}%` : '—'}
            </p>
            <p className="text-sm text-slate-500 mb-3">Today's attendance rate</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <p className="font-bold text-green-700 dark:text-green-400 text-lg">{today.present ?? 0}</p>
                <p className="text-green-600 dark:text-green-500">Present</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                <p className="font-bold text-amber-700 dark:text-amber-400 text-lg">{today.late ?? 0}</p>
                <p className="text-amber-600 dark:text-amber-500">Late</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                <p className="font-bold text-red-700 dark:text-red-400 text-lg">{today.absent ?? 0}</p>
                <p className="text-red-600 dark:text-red-500">Absent</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              {today.totalSessions ?? 0} sessions · {today.completedSessions ?? 0} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action items */}
      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">Action Items</h3>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {/* Pending condonations */}
            <div className="p-4 flex gap-4 items-start">
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${pendingCond > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                {pendingCond > 0
                  ? <AlertTriangle className="w-4 h-4 text-amber-500" />
                  : <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Condonation Requests
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                  {pendingCond > 0
                    ? `${pendingCond} request${pendingCond > 1 ? 's' : ''} awaiting your review.`
                    : 'No pending condonation requests. All clear.'}
                </p>
              </div>
              {pendingCond > 0 && (
                <Button size="sm" onClick={() => navigate('/hod/condonations')}>
                  Review ({pendingCond})
                </Button>
              )}
            </div>

            {/* Low overall attendance */}
            {(isHighRisk || isBorderline) && (
              <div className="p-4 flex gap-4 items-start">
                <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-900/30">
                  <Users className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Attendance Below Threshold
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Department average ({avgPct}%) is {isHighRisk ? 'critically' : ''} below the 75% requirement.
                    Review individual student attendance to identify defaulters.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/hod/attendance')}>
                  View Students
                </Button>
              </div>
            )}

            {/* All good state */}
            {isGood && pendingCond === 0 && (
              <div className="p-4 flex gap-4 items-center">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <p className="text-sm text-slate-500">
                  No critical issues detected. Department is performing well.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Department stats */}
      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-900 dark:text-white">Department Overview</h3>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/50">
            {[
              { label: 'Total Students',    value: students.length },
              { label: 'Active Students',   value: students.filter((s: any) => s.is_active).length },
              { label: 'Sessions Today',    value: today.totalSessions ?? 0 },
              { label: 'Pending Waivers',   value: pendingCond },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
