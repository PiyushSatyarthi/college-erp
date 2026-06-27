import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Search, FileText, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { subjectsApi, coursesApi } from '@/lib/api';

const EMPTY_FORM = { name: '', code: '', courseId: '', semester: 1, credits: 3 };

export function AdminSubjects() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => subjectsApi.list() as Promise<any>);
  const { data: coursesData } = useFetch(() => coursesApi.list() as Promise<any>);

  const [search,       setSearch]       = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSem,    setFilterSem]    = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen,  setIsAlertOpen]  = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [removing, setRemoving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const courses: any[]  = (coursesData as any)?.courses ?? [];
  const allSubjects: any[] = (data as any)?.subjects ?? [];

  const filtered = allSubjects.filter((s: any) => {
    const matchQ  = !search      || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchC  = !filterCourse || s.course?.id === filterCourse;
    const matchS  = !filterSem   || String(s.semester) === filterSem;
    return matchQ && matchC && matchS;
  });

  // Group by semester for display
  const bySemester = filtered.reduce<Record<number, any[]>>((acc, s) => {
    const sem = s.semester ?? 0;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(s);
    return acc;
  }, {});
  const semesterKeys = Object.keys(bySemester).map(Number).sort((a, b) => a - b);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setIsDialogOpen(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code, courseId: s.course?.id ?? '', semester: s.semester, credits: s.credits });
    setIsDialogOpen(true);
  };

  const f = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.code || !form.courseId) {
      toast('error', 'Name, code, and course are required.'); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name, code: form.code.toUpperCase(),
        courseId: form.courseId, semester: Number(form.semester), credits: Number(form.credits),
      };
      if (editing) {
        await subjectsApi.update(editing.id, payload);
        toast('success', 'Subject updated.');
      } else {
        await subjectsApi.create(payload);
        toast('success', 'Subject created.');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await subjectsApi.delete(deleting.id);
      toast('success', `"${deleting.name}" deleted.`);
      setIsAlertOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Cannot delete — subject may have linked sessions or marks.');
    } finally {
      setRemoving(false);
    }
  };

  // Unique semesters across all subjects for filter dropdown
  const allSemesters = [...new Set(allSubjects.map((s: any) => s.semester))].sort((a: any, b: any) => a - b);

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Subjects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{allSubjects.length} subjects across all courses</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Subject</Button>
      </div>

      {/* Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}
        title={editing ? 'Edit Subject' : 'Add Subject'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : editing ? 'Save Changes' : 'Create Subject'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <FormField label="Subject Name" required>
            <Input value={form.name} onChange={f('name')} placeholder="Data Structures and Algorithms" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Subject Code" required>
              <Input value={form.code} onChange={f('code')} placeholder="DS" className="uppercase" />
            </FormField>
            <FormField label="Course" required>
              <Select value={form.courseId} onChange={f('courseId')}>
                <option value="">Select course…</option>
                {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Semester" required>
              <Select value={form.semester} onChange={f('semester')}>
                {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>Semester {n}</option>)}
              </Select>
            </FormField>
            <FormField label="Credits" required>
              <Select value={form.credits} onChange={f('credits')}>
                {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} credit{n > 1 ? 's' : ''}</option>)}
              </Select>
            </FormField>
          </div>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${deleting?.name}"?`}
        description="This will fail if any sessions, attendance records, or marks are linked to this subject."
        confirmText={removing ? 'Deleting…' : 'Delete'} isDestructive />

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search name or code…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
            <option value="">All Courses</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterSem} onChange={(e) => setFilterSem(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
            <option value="">All Semesters</option>
            {allSemesters.map((s: any) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {(search || filterCourse || filterSem) && (
            <button onClick={() => { setSearch(''); setFilterCourse(''); setFilterSem(''); }}
              className="text-sm text-blue-600 hover:underline whitespace-nowrap">
              Clear filters
            </button>
          )}
        </div>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No subjects found.</p>
            </div>
          ) : (
            semesterKeys.map((sem) => (
              <div key={sem}>
                <div className="px-5 py-2 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 tracking-wider uppercase">
                  Semester {sem}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {bySemester[sem].map((subject: any) => (
                    <div key={subject.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{subject.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {subject.code} · {subject.course?.name ?? '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className="text-xs hidden sm:flex">
                          {subject.credits} cr
                        </Badge>
                        <button onClick={() => openEdit(subject)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setDeleting(subject); setIsAlertOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
