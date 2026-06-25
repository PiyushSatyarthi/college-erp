import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download, BarChart2 } from 'lucide-react';

export function AdminReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate and export institutional data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
           { title: 'Defaulters List', desc: 'Students with attendance below 75%', format: 'PDF / CSV', icon: FileText, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
           { title: 'Subject Result Analysis', desc: 'Pass percentage & grade distribution per subject', format: 'Excel', icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
           { title: 'Faculty Workload', desc: 'Total sessions conducted, hours logged', format: 'PDF / Excel', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
           { title: 'Condonation Summary', desc: 'Approved, rejected, and pending condonation requests', format: 'CSV', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
           { title: 'Daily Attendance Log', desc: 'Raw attendance data for auditing', format: 'CSV', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
        ].map((r, i) => (
          <Card key={i} className="flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group">
             <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${r.bg}`}>
                      <r.icon className={`w-5 h-5 ${r.color}`} />
                   </div>
                   <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{r.title}</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{r.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                   <span className="text-xs font-mono font-medium text-slate-400">{r.format}</span>
                   <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-4 h-4 mr-2" /> Generate
                   </Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
