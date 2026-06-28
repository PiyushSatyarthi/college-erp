import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Save, CheckCircle, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { assignmentsApi, marksApi } from '@/lib/api';

const MAX_PER_Q = 20;
const MAX_TOTAL = 60;

function computeGrade(total: number): string {
  const pct = (total / MAX_TOTAL) * 100;
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
}

const GRADE_COLOR: Record<string, string> = {
  O: 'text-blue-700 dark:text-blue-400', 'A+': 'text-blue-600 dark:text-blue-400',
  A: 'text-green-700 dark:text-green-400', 'B+': 'text-green-600 dark:text-green-400',
  B: 'text-amber-600 dark:text-amber-400', C: 'text-orange-600 dark:text-orange-400',
  F: 'text-red-600 dark:text-red-400',
};

type MarksRow = { studentId: string; q1: string; q2: string; q3: string; dirty: boolean };

export function FacultyMarksEntry() {
  const { toast } = useToast();

  const { data: assignData } = useFetch(() => assignmentsApi.mySubjects() as Promise<any>);
  const assignments: any[] = (assignData as any)?.subjects ?? [];

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [search,             setSearch]             = useState('');
  const [isPublishOpen,      setIsPublishOpen]      = useState(false);
  const [saving,             setSaving]             = useState(false);
  const [publishing,         setPublishing]         = useState(false);
  const [gridLoading,        setGridLoading]        = useState(false);
  const [gridError,          setGridError]          = useState<string | null>(null);

  // raw grid from API
  const [grid, setGrid] = useState<any[]>([]);
  // local edits keyed by studentId
  const [marks, setMarks] = useState<Record<string, MarksRow>>({});

  const loadGrid = useCallback(async (subjectId: string, division: string) => {
    setGridLoading(true);
    setGridError(null);
    try {
      const res = await marksApi.grid(subjectId, division) as any;
      setGrid(res.grid ?? []);
      // initialise local marks from saved values
      const init: Record<string, MarksRow> = {};
      for (const row of res.grid ?? []) {
        init[row.student.id] = {
          studentId: row.student.id,
          q1: row.marks.q1 > 0 ? String(row.marks.q1) : '',
          q2: row.marks.q2 > 0 ? String(row.marks.q2) : '',
          q3: row.marks.q3 > 0 ? String(row.marks.q3) : '',
          dirty: false,
        };
      }
      setMarks(init);
    } catch (err: any) {
      setGridError(err.message ?? 'Failed to load marks grid.');
    } finally {
      setGridLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadGrid(selectedAssignment.subject?.id, selectedAssignment.division);
    }
  }, [selectedAssignment, loadGrid]);

  const setMark = (studentId: string, field: 'q1' | 'q2' | 'q3', raw: string) => {
    const val = raw === '' ? '' : String(Math.min(MAX_PER_Q, Math.max(0, Number(raw))));
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: val, dirty: true },
    }));
  };

  const getTotal = (row: MarksRow) =>
    (Number(row.q1) || 0) + (Number(row.q2) || 0) + (Number(row.q3) || 0);

  const dirtyCount = Object.values(marks).filter((m) => m.dirty).length;

  const handleSave = async () => {
    if (!selectedAssignment) return;
    setSaving(true);
    try {
      const entries = Object.values(marks).map((m) => ({
        studentId: m.studentId,
        q1: Number(m.q1) || 0,
        q2: Number(m.q2) || 0,
        q3: Number(m.q3) || 0,
      }));
      await marksApi.bulk(selectedAssignment.subject?.id, entries);
      toast('success', `Marks saved for ${entries.length} students.`);
      // clear dirty flags
      setMarks((prev) => {
        const next = { ...prev };
        for (const id in next) next[id] = { ...next[id], dirty: false };
        return next;
      });
      // reload to get server-computed totals/grades
      await loadGrid(selectedAssignment.subject?.id, selectedAssignment.division);
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedAssignment) return;
    setPublishing(true);
    try {
      // save any unsaved changes first
      if (dirtyCount > 0) await handleSave();
      await marksApi.publish(selectedAssignment.subject?.id, selectedAssignment.division);
      toast('success', 'Marks published to students.');
      setIsPublishOpen(false);
      await loadGrid(selectedAssignment.subject?.id, selectedAssignment.division);
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to publish marks.');
    } finally {
      setPublishing(false);
    }
  };

  const filteredGrid = grid.filter((row: any) =>
    !search ||
    row.student?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    row.student?.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const allPublished = grid.length > 0 && grid.every((row: any) => row.marks?.published);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Marks Entry</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Q1 + Q2 + Q3 each out of {MAX_PER_Q} marks (total {MAX_TOTAL})
          </p>
        </div>
        {selectedAssignment && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={saving || dirtyCount === 0}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                : <><Save className="mr-2 h-4 w-4" />Save Draft{dirtyCount > 0 ? ` (${dirtyCount})` : ''}</>}
            </Button>
            <Button onClick={() => setIsPublishOpen(true)} disabled={publishing || allPublished}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {allPublished ? 'Published' : 'Publish Marks'}
            </Button>
          </div>
        )}
      </div>

      {/* Publish confirm dialog */}
      <Dialog isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)}
        title="Publish Marks to Students?"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPublishOpen(false)} disabled={publishing}>Cancel</Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</> : 'Confirm & Publish'}
            </Button>
          </>
        }
      >
        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This will make marks for <strong>{selectedAssignment?.subject?.name}</strong> (Division {selectedAssignment?.division}) visible to all students.
          </p>
          {dirtyCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''} will be saved automatically before publishing.
            </div>
          )}
        </div>
      </Dialog>

      <Card>
        {/* Subject / division selector */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-3 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <select
            value={selectedAssignment ? `${selectedAssignment.subject?.id}__${selectedAssignment.division}` : ''}
            onChange={(e) => {
              if (!e.target.value) { setSelectedAssignment(null); setGrid([]); return; }
              const [subjectId, division] = e.target.value.split('__');
              const found = assignments.find((a: any) => a.subject?.id === subjectId && a.division === division);
              setSelectedAssignment(found ?? null);
            }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none min-w-[240px]"
          >
            <option value="">— Select subject & division —</option>
            {assignments.map((a: any) => (
              <option key={`${a.subject?.id}__${a.division}`} value={`${a.subject?.id}__${a.division}`}>
                {a.subject?.name} · Div {a.division} · Sem {a.subject?.semester}
              </option>
            ))}
          </select>

          {selectedAssignment && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search name or roll no…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          )}

          {selectedAssignment && (
            <button onClick={() => loadGrid(selectedAssignment.subject?.id, selectedAssignment.division)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>

        <CardContent className="p-0">
          {!selectedAssignment ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-sm">Select a subject and division above to start entering marks.</p>
            </div>
          ) : gridLoading ? (
            <div className="py-20 flex items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading student roster…
            </div>
          ) : gridError ? (
            <div className="p-6">
              <ErrorBanner message={gridError} onRetry={() => loadGrid(selectedAssignment.subject?.id, selectedAssignment.division)} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-500 w-28">Roll No</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Student Name</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-center font-mono">Q1 /{MAX_PER_Q}</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-center font-mono">Q2 /{MAX_PER_Q}</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-center font-mono">Q3 /{MAX_PER_Q}</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-center font-mono">Total /{MAX_TOTAL}</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-center">Grade</th>
                      <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredGrid.map((row: any) => {
                      const m = marks[row.student?.id];
                      if (!m) return null;
                      const total   = getTotal(m);
                      const grade   = total > 0 ? computeGrade(total) : '—';
                      const isPublished = row.marks?.published;

                      return (
                        <tr key={row.student?.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${m.dirty ? 'bg-amber-50/40 dark:bg-amber-900/5' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.student?.roll_number}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {(row.student?.user?.name ?? '?').charAt(0).toUpperCase()}
                              </div>
                              {row.student?.user?.name ?? '—'}
                            </div>
                          </td>
                          {(['q1', 'q2', 'q3'] as const).map((q) => (
                            <td key={q} className="px-4 py-2 text-center">
                              <input
                                type="number" min={0} max={MAX_PER_Q}
                                value={m[q]}
                                disabled={isPublished}
                                onChange={(e) => setMark(row.student?.id, q, e.target.value)}
                                className="w-16 px-2 py-1.5 text-sm text-center border border-slate-300 rounded-md dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                            {total > 0 ? total : '—'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            <span className={GRADE_COLOR[grade] ?? 'text-slate-400'}>{grade}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isPublished
                              ? <Badge variant="success">Published</Badge>
                              : m.dirty
                              ? <Badge variant="warning">Unsaved</Badge>
                              : total > 0
                              ? <Badge variant="info">Saved</Badge>
                              : <Badge variant="outline">Empty</Badge>
                            }
                          </td>
                        </tr>
                      );
                    })}
                    {filteredGrid.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                          {grid.length === 0 ? 'No students found for this subject/division.' : 'No results match your search.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">
                <span>{filteredGrid.length} of {grid.length} students shown</span>
                <div className="flex gap-4">
                  {dirtyCount > 0 && (
                    <span className="text-amber-600 font-medium">{dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}</span>
                  )}
                  {allPublished && <span className="text-green-600 font-medium">All marks published ✓</span>}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
