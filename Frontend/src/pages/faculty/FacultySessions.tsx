import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Clock, Users, Edit2, XCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sessionsApi, assignmentsApi } from '@/lib/api';

const EMPTY_FORM = { subjectId: '', division: '', sessionDate: '', startTime: '', endTime: '' };

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  Completed: 'success', Scheduled: 'default', Cancelled: 'danger',
};

export function FacultySessions() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => sessionsApi.list() as Promise<any>);
  const { data: assignData }              = useFetch(() => assignmentsApi.mySubjects() as Promise<any>);

  const [search,     setSearch]     = useState('');
  const [filterStat, setFilterStat] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen,  setIsAlertOpen]  = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [cancelling, setCancelling] = useState<any>(null);
  const [saving,    setSaving]    = useState(false);
  const [cancelling2, setCancelling2] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const assignments: any[] = (assignData as any)?.subjects ?? [];
  const sessions: any[]    = (data as any)?.sessions ?? [];

  const filtered = sessions.filter((s: any) => {
    const subjectName = s.subject?.name?.toLowerCase() ?? '';
    const matchQ = !search || subjectName.includes(search.toLowerCase());
    const matchS = !filterStat || s.status === filterStat;
    const matchD = !filterDate || s.session_date === filterDate;
    return matchQ && matchS && matchD;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sessionDate: new Date().toISOString().slice(0, 10) });
    setIsDialogOpen(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      subjectId:   s.subject?.id ?? '',
      division:    s.division ?? '',
      sessionDate: s.session_date ?? '',
      startTime:   s.start_time ?? '',
      endTime:     s.end_time ?? '',
    });
    setIsDialogOpen(true);
  };

  const f = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.subjectId || !form.division || !form.sessionDate || !form.startTime || !form.endTime) {
      toast('error', 'All fields are required.'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await sessionsApi.update(editing.id, { startTime: form.startTime, endTime: form.endTime });
        toast('success', 'Session updated.');
      } else {
        await sessionsApi.create({
          subjectId: form.subjectId, division: form.division,
          sessionDate: form.sessionDate, startTime: form.startTime, endTime: form.endTime,
        });
        toast('success', 'Session created.');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelling) return;
    setCancelling2(true);
    try {
      await sessionsApi.cancel(cancelling.id);
      toast('success', 'Session cancelled.');
      setIsAlertOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to cancel session.');
    } finally {
      setCancelling2(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sessions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {sessions.length} total · {sessions.filter((s: any) => s.status === 'Completed').length} completed
          </p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Create Session</Button>
      </div>

      {/* Create / Edit dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}
        title={editing ? 'Edit Session' : 'Create Session'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : editing ? 'Save Changes' : 'Create Session'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <FormField label="Subject" required>
            <Select value={form.subjectId} onChange={f('subjectId')} disabled={!!editing}>
              <option value="">Select subject…</option>
              {assignments.map((a: any) => (
                <option key={a.id} value={a.subject?.id}>
                  {a.subject?.name} — Div {a.division}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Division" required>
              <Select value={form.division} onChange={f('division')} disabled={!!editing}>
                <option value="">Select…</option>
                {['A','B','C','D'].map((d) => <option key={d} value={d}>Division {d}</option>)}
              </Select>
            </FormField>
            <FormField label="Date" required>
              <Input type="date" value={form.sessionDate} onChange={f('sessionDate')} disabled={!!editing} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time" required>
              <Input type="time" value={form.startTime} onChange={f('startTime')} />
            </FormField>
            <FormField label="End Time" required>
              <Input type="time" value={form.endTime} onChange={f('endTime')} />
            </FormField>
          </div>
          {editing && (
            <p className="text-xs text-slate-400">Subject, division, and date cannot be changed after creation.</p>
          )}
        </div>
      </Dialog>

      {/* Cancel confirm */}
      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}
        onConfirm={handleCancel}
        title={`Cancel "${cancelling?.subject?.name}" session?`}
        description={`${cancelling?.session_date} · ${cancelling?.start_time} – ${cancelling?.end_time}. This cannot be undone.`}
        confirmText={cancelling2 ? 'Cancelling…' : 'Cancel Session'} isDestructive />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by subject…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <select value={filterStat} onChange={(e) => setFilterStat(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <Input type="date" value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-3 py-2 w-auto" />
        {(search || filterStat || filterDate) && (
          <button onClick={() => { setSearch(''); setFilterStat(''); setFilterDate(''); }}
            className="text-sm text-blue-600 hover:underline whitespace-nowrap px-2">Clear</button>
        )}
      </div>

      {/* Sessions list */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card><CardContent className="py-16 text-center text-slate-400">No sessions found.</CardContent></Card>
        )}
        {filtered.map((s: any) => {
          const isCompleted = s.status === 'Completed';
          const isCancelled = s.status === 'Cancelled';
          const isScheduled = s.status === 'Scheduled';
          return (
            <Card key={s.id} className={`overflow-hidden ${isCancelled ? 'opacity-60' : ''}`}>
              <div className="flex flex-col sm:flex-row">
                {/* Date column */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 flex flex-col justify-center items-center shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 sm:w-40 gap-2">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                    {new Date(s.session_date + 'T00:00:00').getDate()}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    {new Date(s.session_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                  <Badge variant={STATUS_VARIANT[s.status] ?? 'default'}>{s.status}</Badge>
                </div>

                {/* Info */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`font-bold text-lg ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {s.subject?.name ?? '—'}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {s.subject?.code} · Division {s.division}
                      </p>
                    </div>
                    {isScheduled && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setCancelling(s); setIsAlertOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-mono">{s.start_time} – {s.end_time}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      {s.academic_year?.name ?? '—'}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="p-5 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 shrink-0">
                  {isCancelled ? (
                    <Button variant="outline" disabled className="whitespace-nowrap">Cancelled</Button>
                  ) : isCompleted ? (
                    <Link to={`/faculty/sessions/${s.id}`}>
                      <Button variant="outline" className="whitespace-nowrap">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> View Report
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/faculty/sessions/${s.id}`}>
                      <Button className="whitespace-nowrap">Take Attendance</Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
