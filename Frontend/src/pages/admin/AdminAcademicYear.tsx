import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Check, Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { FormField, Input } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useFetch } from '@/hooks/useFetch';
import { academicYearApi } from '@/lib/api';

export function AdminAcademicYear() {
  const { toast } = useToast();

  const { data: yearData, loading: yl, error: ye, refetch: refetchYear } = useFetch(() => academicYearApi.current() as Promise<any>);
  const year = (yearData as any)?.academicYear ?? null;

  const { data: holidaysData, loading: hl, refetch: refetchHolidays } = useFetch(
    () => year?.id ? (academicYearApi.getHolidays(year.id) as Promise<any>) : Promise.resolve(null),
    [year?.id]
  );
  const holidays: any[] = (holidaysData as any)?.holidays ?? [];

  // Local-only UI state — not backed by the database yet
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const toggleWorkingDay = (day: string) =>
    setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const [isAyDialogOpen, setIsAyDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [savingYear, setSavingYear] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);

  const [ayName,  setAyName]  = useState('');
  const [ayStart, setAyStart] = useState('');
  const [ayEnd,   setAyEnd]   = useState('');
  const [hName,   setHName]   = useState('');
  const [hDate,   setHDate]   = useState('');

  const openAyDialog = () => { setAyName(''); setAyStart(''); setAyEnd(''); setIsAyDialogOpen(true); };

  const saveAy = async () => {
    if (!ayName || !ayStart || !ayEnd) { toast('error', 'All fields are required.'); return; }
    setSavingYear(true);
    try {
      await academicYearApi.create({ name: ayName, startDate: ayStart, endDate: ayEnd, isCurrent: true });
      toast('success', `Academic year "${ayName}" created and set as current.`);
      setIsAyDialogOpen(false);
      refetchYear();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to create academic year.');
    } finally {
      setSavingYear(false);
    }
  };

  const openHolidayDialog = () => { setHName(''); setHDate(''); setIsHolidayDialogOpen(true); };

  const saveHoliday = async () => {
    if (!hName || !hDate || !year?.id) { toast('error', 'Name and date are required.'); return; }
    setSavingHoliday(true);
    try {
      await academicYearApi.addHoliday(year.id, { description: hName, date: hDate });
      toast('success', 'Holiday added.');
      setIsHolidayDialogOpen(false);
      refetchHolidays();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to add holiday.');
    } finally {
      setSavingHoliday(false);
    }
  };

  if (yl) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Year</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure terms and holidays</p>
        </div>
        <Button onClick={openAyDialog}><Plus className="mr-2 h-4 w-4" /> New Academic Year</Button>
      </div>

      {/* New academic year dialog */}
      <Dialog isOpen={isAyDialogOpen} onClose={() => setIsAyDialogOpen(false)}
        title="New Academic Year"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAyDialogOpen(false)} disabled={savingYear}>Cancel</Button>
            <Button onClick={saveAy} disabled={savingYear}>
              {savingYear ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Create & Set Active'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <FormField label="Name" required><Input value={ayName} onChange={(e) => setAyName(e.target.value)} placeholder="e.g. 2025-26" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required><Input type="date" value={ayStart} onChange={(e) => setAyStart(e.target.value)} /></FormField>
            <FormField label="End Date" required><Input type="date" value={ayEnd} onChange={(e) => setAyEnd(e.target.value)} /></FormField>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20 p-3 text-xs text-amber-800 dark:text-amber-300">
            Creating a new academic year will mark it as current and deactivate the previous one.
          </div>
        </div>
      </Dialog>

      {/* Add holiday dialog */}
      <Dialog isOpen={isHolidayDialogOpen} onClose={() => setIsHolidayDialogOpen(false)}
        title="Add Holiday"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsHolidayDialogOpen(false)} disabled={savingHoliday}>Cancel</Button>
            <Button onClick={saveHoliday} disabled={savingHoliday}>
              {savingHoliday ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Add Holiday'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <FormField label="Holiday Name" required><Input value={hName} onChange={(e) => setHName(e.target.value)} placeholder="e.g. Diwali" /></FormField>
          <FormField label="Date" required><Input type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} /></FormField>
        </div>
      </Dialog>

      {/* Current year card */}
      {ye || !year ? (
        <Card className="border-t-4 border-t-slate-300">
          <CardContent className="p-6 text-center text-slate-400">
            No academic year is currently active. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-t-4 border-t-blue-600">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{year.name} (Active)</h2>
                <p className="text-sm text-slate-500 flex gap-4">
                  <span>Start: {year.start_date}</span>
                  <span>End: {year.end_date}</span>
                </p>
              </div>
            </div>

            <div className="mt-8 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Working Days</h3>
                <Badge variant="outline" className="text-[10px]">Local preview — not saved to server yet</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => {
                  const isSelected = workingDays.includes(d);
                  return (
                    <div key={d} onClick={() => toggleWorkingDay(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer select-none transition-colors ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      {d} {isSelected && <Check className="inline w-3 h-3 ml-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Public Holidays</CardTitle></div>
          <Button size="sm" variant="outline" onClick={openHolidayDialog} disabled={!year}><Plus className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="p-0">
          {hl ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {holidays.map((h: any) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{h.description}</td>
                    <td className="px-6 py-3 text-slate-500">{h.date}</td>
                  </tr>
                ))}
                {holidays.length === 0 && (
                  <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">No holidays added yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Exam Blocks</CardTitle>
            <Badge variant="outline" className="text-[10px]">Not connected to backend yet</Badge>
          </div>
          <CardDescription>This feature needs a new database table before it can be saved — coming in a future update.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
