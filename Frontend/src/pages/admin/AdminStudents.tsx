import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Download, Plus, Search, Filter, Edit2, Ban, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { studentsApi, coursesApi } from '@/lib/api';

const EMPTY_FORM = {
  name: '', email: '', password: 'password123', phone: '',
  rollNumber: '', courseId: '', departmentId: '', division: 'A', year: 1,
};

export function AdminStudents() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => studentsApi.list() as Promise<any>);
  const { data: coursesData } = useFetch(() => coursesApi.list() as Promise<any>);

  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterDiv, setFilterDiv] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen,  setIsAlertOpen]  = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [actionStudent,  setActionStudent]  = useState<any>(null);
  const [saving,    setSaving]    = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const courses: any[]  = (coursesData as any)?.courses ?? [];
  const students: any[] = (data as any)?.students ?? [];

  const filtered = students.filter((s: any) => {
    const name     = s.user?.name?.toLowerCase() ?? '';
    const roll     = s.roll_number?.toLowerCase() ?? '';
    const q        = search.toLowerCase();
    const matchQ   = !q || name.includes(q) || roll.includes(q);
    const matchC   = !filterCourse || s.course?.id === filterCourse;
    const matchD   = !filterDiv || s.division === filterDiv;
    return matchQ && matchC && matchD;
  });

  const openAdd = () => {
    setEditingStudent(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (s: any) => {
    setEditingStudent(s);
    setForm({
      name: s.user?.name ?? '', email: s.user?.email ?? '',
      password: '', phone: s.user?.phone ?? '',
      rollNumber: s.roll_number ?? '', courseId: s.course?.id ?? '',
      departmentId: s.department?.id ?? '', division: s.division ?? 'A',
      year: s.year ?? 1,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.rollNumber || !form.courseId) {
      toast('error', 'Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, {
          name: form.name, phone: form.phone || undefined,
          rollNumber: form.rollNumber, division: form.division, year: Number(form.year),
          courseId: form.courseId || undefined,
          departmentId: form.departmentId || undefined,
        });
        toast('success', 'Student updated successfully.');
      } else {
        if (!form.email || !form.password) {
          toast('error', 'Email and password are required for new students.');
          setSaving(false);
          return;
        }
        // Auto-fill departmentId from selected course
        const selectedCourse = courses.find((c: any) => c.id === form.courseId);
        await studentsApi.create({
          ...form,
          year: Number(form.year),
          departmentId: form.departmentId || selectedCourse?.department_id,
        });
        toast('success', 'Student created. They can now log in with the provided password.');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save student.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!actionStudent) return;
    setDeactivating(true);
    try {
      await studentsApi.deactivate(actionStudent.id);
      toast('success', `${actionStudent.user?.name} has been deactivated.`);
      setIsAlertOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to deactivate student.');
    } finally {
      setDeactivating(false);
    }
  };

  const f = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{students.length} students enrolled</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : editingStudent ? 'Save Changes' : 'Create Student'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <Input value={form.name} onChange={f('name')} placeholder="Rahul Sharma" />
            </FormField>
            <FormField label="Email" required={!editingStudent}>
              <Input type="email" value={form.email} disabled={!!editingStudent} onChange={f('email')} placeholder="rahul@college.edu" />
            </FormField>
          </div>
          {!editingStudent && (
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
            <FormField label="Roll Number" required>
              <Input value={form.rollNumber} onChange={f('rollNumber')} placeholder="2024CS001" />
            </FormField>
            <FormField label="Course" required>
              <Select value={form.courseId} onChange={f('courseId')}>
                <option value="">Select course…</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Division" required>
              <Select value={form.division} onChange={f('division')}>
                {['A', 'B', 'C', 'D'].map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </FormField>
            <FormField label="Year" required>
              <Select value={form.year} onChange={f('year')}>
                {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </Select>
            </FormField>
            {editingStudent && (
              <FormField label="Phone">
                <Input value={form.phone} onChange={f('phone')} placeholder="9876543210" />
              </FormField>
            )}
          </div>
        </div>
      </Dialog>

      {/* Deactivate confirm */}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDeactivate}
        title={`Deactivate ${actionStudent?.user?.name}?`}
        description="They will lose login access immediately. This can be reversed by an admin."
        confirmText={deactivating ? 'Deactivating…' : 'Deactivate'}
        isDestructive
      />

      {/* Table */}
      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search name or roll no…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
              <option value="">All Courses</option>
              {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterDiv} onChange={(e) => setFilterDiv(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
              <option value="">All Divisions</option>
              {['A','B','C','D'].map((d) => <option key={d} value={d}>Div {d}</option>)}
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {['Student Name','Roll Number','Course','Div / Year','Status','Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold dark:bg-slate-800 dark:text-blue-400">
                          {(s.user?.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p>{s.user?.name ?? '—'}</p>
                          <p className="text-xs text-slate-400">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{s.roll_number}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.course?.name ?? '—'}</td>
                    <td className="px-4 py-3">{s.division} / Year {s.year}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.is_active ? 'success' : 'danger'}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {s.is_active && (
                          <button onClick={() => { setActionStudent(s); setIsAlertOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Deactivate">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            Showing {filtered.length} of {students.length} students
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
