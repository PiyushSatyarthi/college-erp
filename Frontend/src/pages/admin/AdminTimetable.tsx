import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Loader2, Calendar } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { timetableApi, coursesApi, subjectsApi, facultyApi } from '@/lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const EMPTY_FORM = {
  courseId: '', division: 'A', dayOfWeek: 0,
  startTime: '09:00', endTime: '10:00',
  subjectId: '', facultyId: '', room: '',
};

export function AdminTimetable() {
  const { toast } = useToast();

  const { data: coursesData } = useFetch(() => coursesApi.list() as Promise<any>);
  const { data: facultyData }  = useFetch(() => facultyApi.list() as Promise<any>);

  const [filterCourse, setFilterCourse] = useState('');
  const [filterDiv,    setFilterDiv]    = useState('A');

  const { data, loading, error, refetch } = useFetch(
    () => (filterCourse
      ? timetableApi.list({ courseId: filterCourse, division: filterDiv })
      : Promise.resolve({ slots: [] })) as Promise<any>,
    [filterCourse, filterDiv]
  );

  // Load subjects when a course is selected
  const { data: subjectsData } = useFetch(
    () => filterCourse ? (subjectsApi.list({ courseId: filterCourse }) as Promise<any>) : Promise.resolve({ subjects: [] }),
    [filterCourse]
  );

  const [isOpen,      setIsOpen]      = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deleting,    setDeleting]    = useState<any>(null);
  const [saving,      setSaving]      = useState(false);
  const [removing,    setRemoving]    = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const courses:  any[] = (coursesData  as any)?.courses  ?? [];
  const allFaculty: any[] = (facultyData as any)?.faculty ?? [];
  const subjects: any[] = (subjectsData as any)?.subjects ?? [];
  const slots:    any[] = (data as any)?.slots ?? [];

  // Group slots by day
  const byDay = slots.reduce<Record<number, any[]>>((acc, s) => {
    if (!acc[s.day_of_week]) acc[s.day_of_week] = [];
    acc[s.day_of_week].push(s);
    return acc;
  }, {});

  const f = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, courseId: filterCourse, division: filterDiv });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.courseId || !form.subjectId) { toast('error', 'Course and subject are required.'); return; }
    setSaving(true);
    try {
      await timetableApi.create({
        courseId: form.courseId, division: form.division,
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime, endTime: form.endTime,
        subjectId: form.subjectId || undefined,
        facultyId: form.facultyId || undefined,
        room: form.room || undefined,
      });
      toast('success', 'Slot added to timetable.');
      setIsOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await timetableApi.delete(deleting.id);
      toast('success', 'Slot removed.');
      setIsAlertOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to delete slot.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Timetable</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Weekly recurring schedule template</p>
        </div>
        <Button onClick={openCreate} disabled={!filterCourse}>
          <Plus className="mr-2 h-4 w-4" /> Add Slot
        </Button>
      </div>

      {/* Add slot dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Timetable Slot"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Add Slot'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Course" required>
              <Select value={form.courseId} onChange={f('courseId')}>
                <option value="">Select…</option>
                {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Division" required>
              <Select value={form.division} onChange={f('division')}>
                {['A','B','C','D'].map(d => <option key={d} value={d}>Division {d}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Day" required>
              <Select value={form.dayOfWeek} onChange={f('dayOfWeek')}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </Select>
            </FormField>
            <FormField label="Room">
              <Input value={form.room} onChange={f('room')} placeholder="e.g. A-204" />
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
          <FormField label="Subject" required>
            <Select value={form.subjectId} onChange={f('subjectId')}>
              <option value="">Select subject…</option>
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} (Sem {s.semester})</option>)}
            </Select>
          </FormField>
          <FormField label="Faculty">
            <Select value={form.facultyId} onChange={f('facultyId')}>
              <option value="">Select faculty…</option>
              {allFaculty.map((f: any) => <option key={f.id} value={f.id}>{f.user?.name}</option>)}
            </Select>
          </FormField>
        </div>
      </Dialog>

      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDelete} title="Remove this slot?"
        description="This removes the recurring schedule entry. It does not cancel any existing sessions."
        confirmText={removing ? 'Removing…' : 'Remove Slot'} isDestructive />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="flex-1 min-w-[220px] max-w-xs">
          <option value="">— Select a course to view its timetable —</option>
          {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={filterDiv} onChange={(e) => setFilterDiv(e.target.value)} className="w-36">
          {['A','B','C','D'].map(d => <option key={d} value={d}>Division {d}</option>)}
        </Select>
      </div>

      {!filterCourse ? (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Select a course above to view or edit its weekly timetable.</p>
          </CardContent>
        </Card>
      ) : loading ? <DashboardSkeleton /> : (
        <div className="grid grid-cols-1 gap-4">
          {DAYS.map((day, idx) => {
            const daySlots = (byDay[idx] ?? []).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
            return (
              <Card key={idx} className={daySlots.length === 0 ? 'opacity-60' : ''}>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                  <span className="font-bold text-xs w-10 text-blue-600 dark:text-blue-400">{DAY_SHORT[idx]}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{day}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">{daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}</Badge>
                </div>
                <CardContent className="p-3">
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-slate-400 py-2 text-center">No classes scheduled</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {daySlots.map((slot: any) => (
                        <div key={slot.id}
                          className="flex-1 min-w-[200px] max-w-xs rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-950 relative group">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{slot.subject?.name ?? '—'}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{slot.start_time} – {slot.end_time}</p>
                          <p className="text-xs text-slate-500 mt-1">{slot.faculty?.user?.name ?? '—'}</p>
                          {slot.room && <p className="text-xs text-slate-400 mt-0.5">Room: {slot.room}</p>}
                          <button
                            onClick={() => { setDeleting(slot); setIsAlertOpen(true); }}
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
