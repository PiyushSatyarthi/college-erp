import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { FormField, Textarea } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Check, X, FileText, Loader2, User } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { condonationsApi } from '@/lib/api';

type Tab = 'Pending' | 'Approved' | 'Rejected';

export function HodCondonations() {
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>('Pending');

  const { data, loading, error, refetch } = useFetch(
    () => condonationsApi.list(tab) as Promise<any>,
    [tab]
  );

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen,  setIsRejectOpen]  = useState(false);
  const [actionReq,     setActionReq]     = useState<any>(null);
  const [saving,        setSaving]        = useState(false);

  const requests: any[] = (data as any)?.condonations ?? [];

  // Separate count fetch for pending badge
  const { data: pendingData } = useFetch(() => condonationsApi.list('Pending') as Promise<any>);
  const pendingCount = (pendingData as any)?.condonations?.length ?? 0;

  const openApprove = (req: any) => { setActionReq(req); setIsApproveOpen(true); };
  const openReject  = (req: any) => { setActionReq(req); setIsRejectOpen(true);  };

  const handleApprove = async () => {
    if (!actionReq) return;
    setSaving(true);
    try {
      await condonationsApi.approve(actionReq.id);
      toast('success', `Condonation approved for ${actionReq.student?.user?.name}.`);
      setIsApproveOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to approve.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!actionReq) return;
    setSaving(true);
    try {
      await condonationsApi.reject(actionReq.id);
      toast('success', `Condonation rejected for ${actionReq.student?.user?.name}.`);
      setIsRejectOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to reject.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Condonation Approvals</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review attendance shortfall waiver requests</p>
      </div>

      {/* Approve dialog */}
      <Dialog isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)}
        title="Approve Condonation"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleApprove} disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white border-green-600">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving…</> : <><Check className="mr-2 h-4 w-4" />Confirm Approve</>}
            </Button>
          </>
        }
      >
        <div className="py-3 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Approving condonation for <strong>{actionReq?.student?.user?.name}</strong> in{' '}
            <strong>{actionReq?.subject?.name}</strong>.
          </p>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-medium mb-1">Student's Reason:</p>
            <p className="text-slate-500 italic">"{actionReq?.reason}"</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20 p-3 text-xs text-green-800 dark:text-green-300">
            The student will be notified and their attendance shortage will be condoned.
          </div>
        </div>
      </Dialog>

      {/* Reject dialog */}
      <Dialog isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)}
        title="Reject Condonation"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleReject} disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rejecting…</> : <><X className="mr-2 h-4 w-4" />Confirm Reject</>}
            </Button>
          </>
        }
      >
        <div className="py-3 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Rejecting condonation for <strong>{actionReq?.student?.user?.name}</strong> in{' '}
            <strong>{actionReq?.subject?.name}</strong>.
          </p>
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-medium mb-1">Student's Reason:</p>
            <p className="text-slate-500 italic">"{actionReq?.reason}"</p>
          </div>
        </div>
      </Dialog>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {(['Pending', 'Approved', 'Rejected'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
              ${tab === t
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t}
            {t === 'Pending' && pendingCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No {tab.toLowerCase()} condonation requests.</p>
            </CardContent>
          </Card>
        ) : requests.map((req: any) => (
          <Card key={req.id}>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="space-y-3 flex-1">
                  {/* Student info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                      {(req.student?.user?.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {req.student?.user?.name ?? '—'}
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          ({req.student?.roll_number ?? '—'})
                        </span>
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{req.subject?.name}</span>
                        {' · '}{req.subject?.code}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 p-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Reason</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{req.reason}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                    <span>Applied: {new Date(req.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {req.reviewed_at && (
                      <span>Reviewed: {new Date(req.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                    {req.reviewed_by?.name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {req.reviewed_by.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions / status */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {tab === 'Pending' ? (
                    <>
                      <Button onClick={() => openApprove(req)} variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800">
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button onClick={() => openReject(req)} variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800">
                        <X className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Badge variant={tab === 'Approved' ? 'success' : 'danger'} className="text-sm px-3 py-1.5">
                      {tab}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
