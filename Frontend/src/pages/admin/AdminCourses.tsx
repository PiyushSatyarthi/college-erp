import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { coursesApi, departmentsApi } from '@/lib/api';

const EMPTY_FORM = { name: '', code: '', departmentId: '', durationYears: 4 };

export function AdminCourses() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => coursesApi.list() as Promise<any>);
  const { data: deptsData } = useFetch(() => departmentsApi.list() as Promise<any>);

  const [filterDept,   setFilterDept]   = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen,  setIsAlertOpen]  = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const departments: any[] = (deptsData as any)?.departments ?? [];
  const allCourses: any[]  = (data as any)?.courses ?? [];
  const courses = filterDept
    ? allCourses.filter((c: any) => c.department?.id === filterDept || c.department_id === filterDept)
    : allCourses;

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setIsDialogOpen(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name, code: c.code,
      departmentId: c.department?.id ?? c.department_id ?? '',
      durationYears: c.duration_years ?? 4,
    });
    setIsDialogOpen(true);
  };

  const f = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.code || !form.departmentId) {
      toast('error', 'Name, code, and department are required.'); return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, code: form.code.toUpperCase(), departmentId: form.departmentId, durationYears: Number(form.durationYears) };
      if (editing) {
        await coursesApi.update(editing.id, payload);
        toast('success', 'Course updated.');
      } else {
        await coursesApi.create(payload);
        toast('success', 'Course created.');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await coursesApi.delete(deleting.id);
      toast('success', `"${deleting.name}" deleted.`);
      setIsAlertOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Cannot delete — course may have linked subjects or students.');
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Courses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{allCourses.length} courses across all departments</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Course</Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}
        title={editing ? 'Edit Course' : 'Add Course'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : editing ? 'Save Changes' : 'Create Course'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <FormField label="Course Name" required>
            <Input value={form.name} onChange={f('name')} placeholder="B.E. Computer Engineering" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Short Code" required>
              <Input value={form.code} onChange={f('code')} placeholder="BE-COMP" className="uppercase" />
            </FormField>
            <FormField label="Duration (Years)" required>
              <Select value={form.durationYears} onChange={f('durationYears')}>
                {[1,2,3,4,5].map((y) => <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Department" required>
            <Select value={form.departmentId} onChange={f('departmentId')}>
              <option value="">Select department…</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${deleting?.name}"?`}
        description="This will fail if any subjects or students are linked to this course."
        confirmText={removing ? 'Deleting…' : 'Delete'} isDestructive />

      {/* Course cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white leading-tight truncate">{course.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{course.code}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(course)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setDeleting(course); setIsAlertOpen(true); }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                    {course.department?.name ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {course.duration_years} year{course.duration_years > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No courses found. {filterDept ? 'Try clearing the filter.' : 'Add one to get started.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
