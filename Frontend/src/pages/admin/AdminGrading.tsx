import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { FormField, Input } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Star, Loader2, GraduationCap } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { gradingApi } from '@/lib/api';

interface Band { grade: string; minPercentage: number }

const PRESET_BANDS: Band[] = [
  { grade: 'O',  minPercentage: 90 },
  { grade: 'A+', minPercentage: 80 },
  { grade: 'A',  minPercentage: 70 },
  { grade: 'B+', minPercentage: 60 },
  { grade: 'B',  minPercentage: 50 },
  { grade: 'C',  minPercentage: 40 },
  { grade: 'F',  minPercentage: 0  },
];

export function AdminGrading() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => gradingApi.list() as Promise<any>);
  const schemes: any[] = (data as any)?.schemes ?? [];

  const [isOpen,      setIsOpen]      = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting,    setDeleting]    = useState<any>(null);
  const [saving,      setSaving]      = useState(false);
  const [removing,    setRemoving]    = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const [schemeName,  setSchemeName]  = useState('');
  const [isDefault,   setIsDefault]   = useState(false);
  const [bands,       setBands]       = useState<Band[]>(PRESET_BANDS);

  const openCreate = () => {
    setSchemeName('');
    setIsDefault(false);
    setBands(PRESET_BANDS);
    setIsOpen(true);
  };

  const addBand = () => setBands(prev => [...prev, { grade: '', minPercentage: 0 }]);
  const removeBand = (i: number) => setBands(prev => prev.filter((_, idx) => idx !== i));
  const updateBand = (i: number, field: keyof Band, value: string) =>
    setBands(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: field === 'minPercentage' ? Number(value) : value } : b));

  const handleSave = async () => {
    if (!schemeName.trim()) { toast('error', 'Scheme name is required.'); return; }
    if (bands.some(b => !b.grade.trim())) { toast('error', 'All grade labels must be filled.'); return; }
    setSaving(true);
    try {
      await gradingApi.create({
        name: schemeName.trim(),
        isDefault,
        bands: bands.map((b, i) => ({ grade: b.grade.trim(), minPercentage: b.minPercentage, sortOrder: i })),
      });
      toast('success', `Scheme "${schemeName}" created.${isDefault ? ' It is now the active grading scheme.' : ''}`);
      setIsOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to create grading scheme.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string, name: string) => {
    setSettingDefault(id);
    try {
      await gradingApi.setDefault(id);
      toast('success', `"${name}" is now the active grading scheme.`);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to set default scheme.');
    } finally {
      setSettingDefault(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await gradingApi.delete(deleting.id);
      toast('success', `"${deleting.name}" deleted.`);
      setIsDeleteOpen(false);
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Cannot delete the active default scheme.');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Grading Schemes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define letter-grade bands. The active (default) scheme is used when saving marks.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New Scheme</Button>
      </div>

      {/* Create dialog */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Grading Scheme"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Create Scheme'}
            </Button>
          </>
        }
      >
        <div className="space-y-5 py-2">
          <FormField label="Scheme Name" required>
            <Input value={schemeName} onChange={(e) => setSchemeName(e.target.value)} placeholder="e.g. Standard UG Grading" />
          </FormField>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <label htmlFor="isDefault" className="text-sm text-slate-700 dark:text-slate-300">Set as active grading scheme immediately</label>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade Bands</p>
              <button onClick={addBand} className="text-xs text-blue-600 hover:underline">+ Add band</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {bands.map((band, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={band.grade} onChange={(e) => updateBand(i, 'grade', e.target.value)}
                    placeholder="Grade (e.g. O)" className="w-24 uppercase" />
                  <span className="text-xs text-slate-400 shrink-0">≥</span>
                  <Input type="number" min={0} max={100} value={band.minPercentage}
                    onChange={(e) => updateBand(i, 'minPercentage', e.target.value)}
                    placeholder="%" className="w-20" />
                  <span className="text-xs text-slate-400 shrink-0">%</span>
                  {bands.length > 1 && (
                    <button onClick={() => removeBand(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      <AlertDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete} title={`Delete "${deleting?.name}"?`}
        description="All grade bands will be removed. Cannot delete the active default scheme."
        confirmText={removing ? 'Deleting…' : 'Delete'} isDestructive />

      {/* Schemes grid */}
      {schemes.length === 0 ? (
        <Card><CardContent className="py-20 text-center text-slate-400">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No grading schemes yet. Create one to enable dynamic grade computation.</p>
          <p className="text-xs mt-2">Until then, the built-in fallback scheme (O ≥ 90%, F below 40%) is used.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((s: any) => (
            <Card key={s.id} className={s.is_default ? 'border-2 border-blue-500 dark:border-blue-600' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {s.is_default && <Star className="w-4 h-4 fill-blue-500 text-blue-500 shrink-0" />}
                      {s.name}
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-1">{s.bands?.length ?? 0} grade bands</p>
                  </div>
                  {s.is_default && <Badge variant="info" className="shrink-0">Active</Badge>}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-slate-500">Grade</th>
                        <th className="px-3 py-2 text-right font-medium text-slate-500">Min %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {(s.bands ?? []).map((b: any) => (
                        <tr key={b.id}>
                          <td className="px-3 py-1.5 font-bold text-blue-700 dark:text-blue-400">{b.grade}</td>
                          <td className="px-3 py-1.5 text-right text-slate-500 font-mono">≥ {b.min_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2">
                  {!s.is_default && (
                    <Button size="sm" variant="outline" className="flex-1"
                      onClick={() => handleSetDefault(s.id, s.name)}
                      disabled={settingDefault === s.id}>
                      {settingDefault === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 mr-1" />}
                      Set Active
                    </Button>
                  )}
                  {!s.is_default && (
                    <Button size="sm" variant="outline"
                      onClick={() => { setDeleting(s); setIsDeleteOpen(true); }}
                      className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {s.is_default && (
                    <p className="text-xs text-slate-400 italic self-center">
                      Grades are computed using this scheme
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
