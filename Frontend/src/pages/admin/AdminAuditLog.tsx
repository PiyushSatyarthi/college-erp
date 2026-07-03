import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/FormField';
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import { auditApi } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';
import { useToast } from '@/components/ui/Toast';

const MODULE_COLORS: Record<string, string> = {
  Auth: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  Students: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  Faculty: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  Departments: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  Courses: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
  Subjects: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  Marks: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
  Condonations: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
  Timetable: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
  Grading: 'text-red-600 bg-red-50 dark:bg-red-900/20',
};

export function AdminAuditLog() {
  const { toast } = useToast();
  const [search,    setSearch]    = useState('');
  const [module,    setModule]    = useState('');
  const [status,    setStatus]    = useState('');
  const [from,      setFrom]      = useState('');
  const [to,        setTo]        = useState('');
  const [page,      setPage]      = useState(1);

  const params = { search: search || undefined, module: module || undefined, status: status || undefined, from: from || undefined, to: to || undefined, page, limit: 50 };

  const { data, loading, error, refetch } = useFetch(() => auditApi.list(params) as Promise<any>, [search, module, status, from, to, page]);
  const { data: modulesData } = useFetch(() => auditApi.modules() as Promise<any>);

  const logs: any[]    = (data as any)?.logs ?? [];
  const total: number  = (data as any)?.total ?? 0;
  const totalPages     = (data as any)?.totalPages ?? 1;
  const modules: string[] = (modulesData as any)?.modules ?? [];

  const handleExport = () => {
    if (!logs.length) { toast('error', 'No logs to export.'); return; }
    downloadCsv('audit-log', logs.map((l: any) => ({
      Timestamp: new Date(l.created_at).toLocaleString('en-IN'),
      User: l.user_name, Email: l.user_email,
      Action: l.action, Module: l.module,
      Status: l.status, IP: l.ip_address ?? '—',
    })));
  };

  const clearFilters = () => { setSearch(''); setModule(''); setStatus(''); setFrom(''); setTo(''); setPage(1); };

  if (loading && logs.length === 0) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{total} events recorded</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetch(); }} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search user, email, action…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option value="">All Modules</option>
            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option value="">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-36 py-2" />
          <span className="text-slate-400 text-sm">to</span>
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-36 py-2" />
          {(search || module || status || from || to) && (
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear</button>
          )}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {['Timestamp', 'User', 'Module', 'Action', 'Status', 'IP'].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{log.user_name}</p>
                      <p className="text-xs text-slate-400">{log.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${MODULE_COLORS[log.module] ?? 'text-slate-600 bg-slate-50 dark:bg-slate-800'}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{log.action}</td>
                    <td className="px-4 py-3">
                      <Badge variant={log.status === 'Success' ? 'success' : 'danger'} className="text-[10px] py-0">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.ip_address ?? '—'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    {loading ? 'Loading…' : 'No audit logs found. Actions like login, creating students, and marking attendance will appear here.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">Page {page} of {totalPages} · {total} total events</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
