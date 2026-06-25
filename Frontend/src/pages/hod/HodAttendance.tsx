import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function HodAttendance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Department Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor overall attendance and identify defaulters</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Defaulters</Button>
      </div>

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50 flex-wrap">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search student or roll no..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option>Semester 5</option>
            <option>Semester 3</option>
            <option>Semester 1</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option>All Divisions</option>
            <option>Division A</option>
            <option>Division B</option>
          </select>
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> More Filters</Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Roll No</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Student Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Subject</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Total Classes</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Attended</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Percentage</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {[
                  { roll: '2024CS01', name: 'Rahul Sharma', subject: 'Operating Systems', total: 40, attended: 35, perc: 87.5, status: 'safe' },
                  { roll: '2024CS02', name: 'Priya Desai', subject: 'Operating Systems', total: 40, attended: 26, perc: 65.0, status: 'danger' },
                  { roll: '2024CS03', name: 'Amit Patel', subject: 'Data Structures', total: 45, attended: 33, perc: 73.3, status: 'warning' },
                ].map((s, i) => (
                  <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${s.status === 'danger' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3 font-mono text-slate-500">{s.roll}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="px-4 py-3">{s.subject}</td>
                    <td className="px-4 py-3 text-center">{s.total}</td>
                    <td className="px-4 py-3 text-center">{s.attended}</td>
                    <td className={`px-4 py-3 text-center font-bold ${s.status === 'safe' ? 'text-green-600' : s.status === 'danger' ? 'text-red-600' : 'text-amber-600'}`}>
                      {s.perc.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                       <Badge variant={s.status === 'safe' ? 'success' : s.status === 'warning' ? 'warning' : 'danger'}>
                         {s.status === 'safe' ? 'Good' : s.status === 'warning' ? 'Borderline' : 'Defaulter'}
                       </Badge>
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
