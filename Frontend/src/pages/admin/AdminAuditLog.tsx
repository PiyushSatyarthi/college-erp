import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Filter, History } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function AdminAuditLog() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">System-wide activity and security trails</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Logs</Button>
      </div>

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user, action, or IP..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Timestamp</th>
                  <th className="px-4 py-3 font-medium text-slate-500">User</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Action</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Module</th>
                   <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[
                  { time: '10:45 AM, Today', user: 'Admin (System)', action: 'Generated Defaulters List', module: 'Reports', status: 'Success', ip: '192.168.1.100' },
                  { time: '09:30 AM, Today', user: 'Dr. Suresh Patil', action: 'Modified marks for CS302 (IT-1)', module: 'Grading', status: 'Warning', ip: '14.139.121.2' },
                  { time: '08:15 AM, Today', user: 'Prof. Amit Kumar', action: 'Started active session (CS305 Lab)', module: 'Attendance', status: 'Success', ip: '14.139.121.5' },
                  { time: '07:50 AM, Today', user: 'Unknown', action: 'Failed login attempt - Invalid password', module: 'Auth', status: 'Failed', ip: '45.22.11.90' },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-mono text-xs">
                    <td className="px-4 py-3 text-slate-500">{log.time}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 font-sans">{log.user}</td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3 font-sans text-xs">
                       <Badge variant="outline">{log.module}</Badge>
                    </td>
                    <td className="px-4 py-3 font-sans">
                       <Badge variant={log.status === 'Success' ? 'success' : log.status === 'Failed' ? 'danger' : 'warning'}>{log.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick hack for Download icon missing in imports
import { Download } from 'lucide-react';
