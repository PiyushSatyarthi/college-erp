import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Search, Mail, Download } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { studentsApi, facultyApi } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';

type Row = { name: string; email: string; role: string; status: boolean };

export function AdminEmailAccounts() {
  const { data: studentsData, loading: sl, error: se } = useFetch(() => studentsApi.list() as Promise<any>);
  const { data: facultyData,  loading: fl, error: fe } = useFetch(() => facultyApi.list() as Promise<any>);

  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('');

  const loading = sl || fl;
  const error   = se || fe;

  const rows: Row[] = useMemo(() => {
    const students: any[] = studentsData?.students ?? [];
    const faculty:  any[] = facultyData?.faculty   ?? [];

    const studentRows: Row[] = students.map((s) => ({
      name: s.user?.name ?? '—', email: s.user?.email ?? '—',
      role: 'Student', status: s.user?.is_active ?? s.is_active,
    }));

    const facultyRows: Row[] = faculty.map((f) => ({
      name: f.user?.name ?? '—', email: f.user?.email ?? '—',
      role: f.is_hod ? 'HOD' : 'Faculty', status: f.user?.is_active ?? f.is_active,
    }));

    // Dedupe parents found nested inside student records
    const parentMap = new Map<string, Row>();
    for (const s of students) {
      if (s.parent?.email) {
        parentMap.set(s.parent.email, {
          name: s.parent.name, email: s.parent.email, role: 'Parent', status: true,
        });
      }
    }

    return [...studentRows, ...facultyRows, ...Array.from(parentMap.values())]
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [studentsData, facultyData]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    const matchR = !filterRole || r.role === filterRole;
    return matchQ && matchR;
  });

  const handleExport = () => {
    downloadCsv('email-accounts', filtered.map((r) => ({
      Name: r.name, Email: r.email, Role: r.role, Status: r.status ? 'Active' : 'Inactive',
    })));
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={String(error)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Email Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {rows.length} login accounts across all roles
          </p>
        </div>
        <button onClick={handleExport}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20 p-3 text-xs text-blue-800 dark:text-blue-300">
        Each user's login email doubles as their institutional email. New accounts are created from the Students or Faculty pages — there's no separate "provisioning" step.
        Admin accounts aren't listed here since they're created directly during initial setup, not through self-service pages.
      </div>

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search by name or email…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option value="">All Roles</option>
            <option value="Student">Students</option>
            <option value="Faculty">Faculty</option>
            <option value="HOD">HOD</option>
            <option value="Parent">Parents</option>
          </select>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Email Address</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((r, i) => (
                  <tr key={`${r.email}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        {r.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {r.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.role === 'HOD' ? 'info' : r.role === 'Faculty' ? 'success' : r.role === 'Parent' ? 'outline' : 'warning'}>
                        {r.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status ? 'success' : 'danger'}>{r.status ? 'Active' : 'Inactive'}</Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No accounts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            Showing {filtered.length} of {rows.length} accounts
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
