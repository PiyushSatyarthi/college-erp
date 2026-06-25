import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Plus, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function AdminEmailAccounts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Email Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage institutional email addresses</p>
        </div>
        <Button ><Plus className="mr-2 h-4 w-4" /> Provision Accounts</Button>
      </div>

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none hidden sm:block">
            <option>All Roles</option>
            <option>Students</option>
            <option>Faculty</option>
          </select>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Email Address (Google Workspace)</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[
                  { name: 'Rahul Sharma', email: 'rahul.s@institute.edu', role: 'Student', status: 'Active' },
                  { name: 'Neha Gupta', email: 'neha.g@institute.edu', role: 'Student', status: 'Active' },
                  { name: 'Dr. Suresh Patil', email: 's.patil@institute.edu', role: 'Faculty', status: 'Active' },
                  { name: 'Priya Desai', email: 'priya.d@institute.edu', role: 'Student', status: 'Suspended (Fees)' },
                ].map((user, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                       <Mail className="w-4 h-4 text-slate-400" /> {user.name}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-4 py-4"><Badge variant="outline">{user.role}</Badge></td>
                    <td className="px-4 py-4">
                      <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right space-x-3">
                       <span className="text-blue-600 dark:text-blue-400 cursor-pointer font-medium text-xs hover:underline">Reset Password</span>
                    </td>
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
