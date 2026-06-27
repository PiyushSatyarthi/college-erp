import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Building2, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { departmentsApi } from '@/lib/api';

const EMPTY_FORM = { name: '', code: '', hodUserId: '' };

export function AdminDepartments() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => departmentsApi.list() as Promise<any>);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen,  setIsAlertOpen]  = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const departments: any[] = (data as any)?.departments ?? [];

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setIsDialogOpen(true); };
  const openEdit = (d: any) => {
    setEditing(d);
    setForm({ name: d.name, code: d.code, hodUserId: d.hod?.id ?? '' });
    setIsDialogOpen(true);
  };

  const f = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.code) { toast('error', 'Name and code are required.'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, code: form.code.toUpperCase(), hodUserId: form.hodUserId || null };
      if (editing) {
        await departmentsApi.update(editing.id, payload);
        toast('success', 'Department updated.');
      } else {
        await departmentsApi.create(payload);
        toast('success', 'Department created.');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await departmentsApi.delete(deleting.id);
      toast('success', `"${deleting.name}" deleted.`);
      setIsAlertOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Cannot delete — department may have linked courses or students.');
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Departments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{departments.length} departments configured</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
      </div>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}
        title={editing ? 'Edit Department' : 'Add Department'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : editing ? 'Save Changes' : 'Create Department'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <FormField label="Department Name" required>
            <Input value={form.name} onChange={f('name')} placeholder="Computer Engineering" />
          </FormField>
          <FormField label="Short Code" required>
            <Input value={form.code} onChange={f('code')} placeholder="CS" className="uppercase" />
          </FormField>
          <FormField label="HOD User ID">
            <Input value={form.hodUserId} onChange={f('hodUserId')} placeholder="UUID of HOD user (optional)" />
          </FormField>
          <p className="text-xs text-slate-400">Tip: Create the HOD faculty account first, then assign them here.</p>
        </div>
      </Dialog>

      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${deleting?.name}"?`}
        description="This will fail if any courses, students, or faculty are linked to this department."
        confirmText={removing ? 'Deleting…' : 'Delete'} isDestructive />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept: any) => (
          <Card key={dept.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {dept.code?.slice(0, 2) ?? <Building2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">{dept.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{dept.code}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => openEdit(dept)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setDeleting(dept); setIsAlertOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">HOD</span>
                  <span className="font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                    {dept.hod?.name ?? <span className="text-slate-400 italic">Not assigned</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(dept.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {departments.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No departments yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
