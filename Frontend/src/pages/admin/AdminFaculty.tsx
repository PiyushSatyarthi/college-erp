import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Edit2, Ban, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { facultyApi, departmentsApi } from '@/lib/api';

const EMPTY_FORM = {
  name: '', email: '', password: 'password123', phone: '',
  departmentId: '', designation: '', isHod: false,
};

export function AdminFaculty() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => facultyApi.list() as Promise<any>);
  const { data: deptsData } = useFetch(() => departmentsApi.list() as Promise<any>);

  const [search,     setSearch]     = useState('');
  const [filterDept, setFilterDept] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen,  setIsAlertOpen]  = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [actionFac, setActionFac] = useState<any>(null);
  const [saving,       setSaving]       = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const departments: any[] = (deptsData as any)?.departments ?? [];
  const faculty: any[]     = (data as any)?.faculty ?? [];

  const filtered = faculty.filter((f: any) => {
    const name = (f.user?.name ?? '').toLowerCase();
    const matchQ = !search || name.includes(search.toLowerCase());
    const matchD = !filterDept || f.department?.id === filterDept;
    return matchQ && matchD;
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setIsDialogOpen(true); };
  const openEdit = (f: any) => {
    setEditing(f);
    setForm({
      name: f.user?.name ?? '', email: f.user?.email ?? '',
      password: '', phone: f.user?.phone ?? '',
      departmentId: f.department?.id ?? '', designation: f.designation ?? '',
      isHod: f.is_hod ?? false,
    });
    setIsDialogOpen(true);
  };

  const f = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.departmentId) {
      toast('error', 'Full name and department are required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await facultyApi.update(editing.id, {
          name: form.name, phone: form.phone || undefined,
          departmentId: form.departmentId, designation: form.designation || undefined,
          isHod: form.isHod,
        });
        toast('success', 'Faculty member updated.');
      } else {
        if (!form.email || !form.password) {
          toast('error', 'Email and password are required.');
          setSaving(false); return;
        }
        await facultyApi.create(form);
        toast('success', 'Faculty account created successfully.');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!actionFac) return;
    setDeactivating(true);
    try {
      await facultyApi.deactivate(actionFac.id);
      toast('success', `${actionFac.user?.name} deactivated.`);
      setIsAlertOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to deactivate.');
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Faculty</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage teaching staff across departments</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Faculty</Button>
      </div>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}
        title={editing ? 'Edit Faculty' : 'Add Faculty'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : editing ? 'Save Changes' : 'Create Account'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input value={form.name} onChange={f('name')} placeholder="Dr. Suresh Kumar" />
            </FormField>
            <FormField label="Email" required={!editing}>
              <Input type="email" value={form.email} disabled={!!editing} onChange={f('email')} placeholder="suresh@college.edu" />
            </FormField>
          </div>
          {!editing && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Password" required>
                <Input type="password" value={form.password} onChange={f('password')} placeholder="Min 8 characters" />
              </FormField>
              <FormField label="Phone">
                <Input value={form.phone} onChange={f('phone')} placeholder="9876543210" />
              </FormField>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department" required>
              <Select value={form.departmentId} onChange={f('departmentId')}>
                <option value="">Select…</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Designation">
              <Input value={form.designation} onChange={f('designation')} placeholder="Assistant Professor" />
            </FormField>
          </div>
          {editing && (
            <FormField label="Phone">
              <Input value={form.phone} onChange={f('phone')} placeholder="9876543210" />
            </FormField>
          )}
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isHod" checked={form.isHod}
              onChange={(e) => setForm((p) => ({ ...p, isHod: e.target.checked }))}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="isHod" className="text-sm text-slate-700 dark:text-slate-300">
              Set as Head of Department (HOD)
            </label>
          </div>
        </div>
      </Dialog>

      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDeactivate}
        title={`Deactivate ${actionFac?.user?.name}?`}
        description="They will lose login access immediately."
        confirmText={deactivating ? 'Deactivating…' : 'Deactivate'} isDestructive />

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search by name…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {['Name','Department','Designation','Role','Status','Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((fac: any) => (
                  <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold dark:bg-slate-800 dark:text-blue-400">
                          {(fac.user?.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white">{fac.user?.name}</p>
                          <p className="text-xs text-slate-400">{fac.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fac.department?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{fac.designation ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={fac.is_hod ? 'info' : 'outline'}>
                        {fac.is_hod ? 'HOD' : 'Faculty'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={fac.is_active ? 'success' : 'danger'}>
                        {fac.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(fac)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {fac.is_active && (
                          <button onClick={() => { setActionFac(fac); setIsAlertOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No faculty found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            Showing {filtered.length} of {faculty.length} faculty members
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
