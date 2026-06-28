import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { FormField, Select, Textarea } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, FileText, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { condonationsApi, attendanceApi } from '@/lib/api';

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger'> = {
  Pending: 'warning', Approved: 'success', Rejected: 'danger',
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  Pending:  <Clock className="h-4 w-4 text-amber-500" />,
  Approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  Rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

export function StudentCondonation() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => condonationsApi.mine() as Promise<any>);
  const { data: attData } = useFetch(() => attendanceApi.student() as Promise<any>);

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [subjectId,   setSubjectId]   = useState('');
  const [reason,      setReason]      = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const condonations: any[] = (data as any)?.condonations ?? [];
  const allSubjects: any[]  = (attData as any)?.subjects ?? [];

  // Only subjects below 75% that don't already have a pending/approved request
  const existingSubjectIds = new Set(
    condonations.filter((c: any) => c.status !== 'Rejected').map((c: any) => c.subject?.id)
  );
  const eligibleSubjects = allSubjects.filter(
    (s: any) => s.percentage !== null && s.percentage < 75 && !existingSubjectIds.has(s.subject?.id)
  );

  const openApply = () => { setSubjectId(''); setReason(''); setIsApplyOpen(true); };

  const handleSubmit = async () => {
    if (!subjectId) { toast('error', 'Please select a subject.'); return; }
    if (reason.trim().length < 50) { toast('error', 'Please write at least 50 characters.'); return; }
    setSubmitting(true);
    try {
      await condonationsApi.apply(subjectId, reason.trim());
      toast('success', 'Application submitted successfully.');
      setIsApplyOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Condonation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Apply for attendance shortfall waiver</p>
        </div>
        <Button onClick={openApply} disabled={eligibleSubjects.length === 0 && condonations.length > 0}>
          <Plus className="mr-2 h-4 w-4" /> Apply for Condonation
        </Button>
      </div>

      {/* Apply dialog */}
      <Dialog isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)}
        title="Apply for Condonation"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApplyOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !subjectId || reason.trim().length < 50}>
              {submitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                : 'Submit Application'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          {eligibleSubjects.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 p-4 text-sm text-slate-500 text-center">
              No subjects currently eligible. Only subjects below 75% without an existing request are shown.
            </div>
          ) : (
            <>
              <FormField label="Subject" required>
                <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <option value="">Select subject…</option>
                  {eligibleSubjects.map((s: any) => (
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
                  placeholder="Describe the circumstances leading to your attendance shortage in detail…"
                />
                <p className={`text-xs text-right mt-1 ${reason.trim().length < 50 ? 'text-red-500' : 'text-slate-400'}`}>
                  {reason.trim().length} / 50 minimum characters
                </p>
              </FormField>

              {subjectId && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20 p-3 text-xs text-blue-800 dark:text-blue-300">
                  Your request will be reviewed by the HOD. You will be notified of the decision.
                </div>
              )}
            </>
          )}
        </div>
      </Dialog>

      {/* Eligibility info banner */}
      {eligibleSubjects.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
          You are eligible to apply for condonation in{' '}
          <strong>{eligibleSubjects.map((s: any) => s.subject?.name).join(', ')}</strong>.
        </div>
      )}

      {/* Applications list */}
      {condonations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No condonation applications yet.</p>
            {eligibleSubjects.length > 0 && (
              <Button variant="outline" size="sm" className="mt-4" onClick={openApply}>
                Apply Now
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {condonations.map((c: any) => (
            <Card key={c.id} className={`border-l-4 ${c.status === 'Approved' ? 'border-l-green-500' : c.status === 'Rejected' ? 'border-l-red-500' : 'border-l-amber-400'}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {STATUS_ICON[c.status]}
                      <h3 className="font-semibold text-slate-900 dark:text-white">{c.subject?.name}</h3>
                      <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                    </div>
                    <p className="text-xs font-mono text-slate-400">{c.subject?.code} · Sem {c.subject?.semester}</p>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                      <span>Applied {new Date(c.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {c.reviewed_at && (
                        <>
                          <span>→</span>
                          <span>{c.status} {new Date(c.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </>
                      )}
                    </div>

                    {/* Reason */}
                    <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 p-3 text-sm text-slate-600 dark:text-slate-300">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Your Reason</p>
                      <p>{c.reason}</p>
                    </div>

                    {/* Reviewer note (future: could be stored as reviewed_note) */}
                    {c.reviewed_by?.name && (
                      <p className="text-xs text-slate-400 mt-1">
                        Reviewed by <span className="font-medium text-slate-600 dark:text-slate-300">{c.reviewed_by.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
