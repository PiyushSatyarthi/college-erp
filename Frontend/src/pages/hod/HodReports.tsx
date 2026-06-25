import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download } from 'lucide-react';

export function HodReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Department Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate academic and operational documentation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
           { title: 'Defaulters List (Department)', desc: 'Cumulative attendance below 75% for current semester', format: 'PDF', bg: 'bg-red-50/80 dark:bg-red-900/10' },
           { title: 'Syllabus Coverage Status', desc: 'Faculty progress vs planned timeline', format: 'Excel', bg: 'bg-blue-50/80 dark:bg-blue-900/10' },
           { title: 'Result Analysis', desc: 'Pass/Fail breakdown by subject and division', format: 'PDF / Excel', bg: 'bg-blue-50/80 dark:bg-blue-900/10' },
           { title: 'Faculty Workload & Extra Sessions', desc: 'Summary of sessions conducted per faculty', format: 'Excel', bg: 'bg-slate-50/80 dark:bg-slate-900/50' },
        ].map((r, i) => (
          <Card key={i} className={`flex flex-col border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer group ${r.bg}`}>
             <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                   <FileText className="w-8 h-8 text-slate-400 w-8 h-8 mb-4 group-hover:text-blue-500 transition-colors" />
                   <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{r.title}</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10">{r.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
                   <span className="text-xs font-mono font-medium text-slate-400">{r.format}</span>
                   <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-4 h-4 mr-2" /> Export
                   </Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
