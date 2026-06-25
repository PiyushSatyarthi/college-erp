import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Lock, ChevronDown } from 'lucide-react';

export function StudentMarks() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Marks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Academic performance</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download Marksheet</Button>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
        {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'].map((sem, i) => (
          <Button 
            key={i} 
            variant={sem === 'Sem 5' ? 'primary' : 'outline'} 
            roleColor={sem === 'Sem 5' ? 'student' : undefined}
            className={`shrink-0 ${sem !== 'Sem 5' ? 'text-slate-600 dark:text-slate-300' : ''}`}
          >
            {sem}
          </Button>
        ))}
      </div>

      <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
        <CardContent className="p-6 flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Semester 5 GPA</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">7.8</span>
              <span className="text-sm text-slate-500 font-medium">/ 10</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Credits completed: 22</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[
          { sub: 'Computer Networks', code: 'CS301', grade: 'A', credits: 4 },
          { sub: 'Operating Systems', code: 'CS302', grade: 'B+', credits: 4 },
          { sub: 'Data Structures', code: 'CS303', grade: 'O', credits: 4 },
        ].map((s, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{s.sub}</h3>
                <p className="font-mono text-xs text-slate-500 mt-1">{s.code}</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                   <p className="text-xs text-slate-500 font-medium">Credits</p>
                   <p className="text-sm font-semibold">{s.credits}</p>
                 </div>
                 <Badge variant="outline" className="text-base py-1 px-3 bg-white dark:bg-slate-950">{s.grade}</Badge>
                 <ChevronDown className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-500">Assessment</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Type</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Max</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Score</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-950">
                       <tr>
                         <td className="px-4 py-3 font-medium">Internal Test 1</td>
                         <td className="px-4 py-3">Internal</td>
                         <td className="px-4 py-3">30</td>
                         <td className="px-4 py-3 font-mono font-medium">24</td>
                         <td className="px-4 py-3"><Badge variant="default">A</Badge></td>
                       </tr>
                       <tr>
                         <td className="px-4 py-3 font-medium text-slate-500">Internal Test 2</td>
                         <td className="px-4 py-3 text-slate-500">Internal</td>
                         <td className="px-4 py-3 text-slate-500">30</td>
                         <td className="px-4 py-3 block" colSpan={2}>
                           <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded inline-flex">
                             <Lock className="w-3 h-3" /> Not published
                           </div>
                         </td>
                       </tr>
                    </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
