import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ParentMarks() {
  const performanceData = [
    { subject: 'Data Structures', test1: 22, test2: 25 },
    { subject: 'OS', test1: 18, test2: 20 },
    { subject: 'Algorithms', test1: 20, test2: 26 },
    { subject: 'Networks', test1: 15, test2: 19 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Grades</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Current semester performance for Rahul Sharma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">Internal Test Scores</h2>
          </div>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                   <tr>
                     <th className="px-4 py-3 font-medium text-slate-500">Subject</th>
                     <th className="px-4 py-3 font-medium text-slate-500 text-center">Test 1 (30)</th>
                     <th className="px-4 py-3 font-medium text-slate-500 text-center">Test 2 (30)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   {[
                      { subject: 'Data Structures', t1: 22, t2: 25 },
                      { subject: 'Operating Systems', t1: 18, t2: 20 },
                      { subject: 'Algorithms', t1: 20, t2: 26 },
                      { subject: 'Computer Networks', t1: 15, t2: 19 },
                   ].map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.subject}</td>
                         <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{s.t1}</td>
                         <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{s.t2}</td>
                      </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Performance Chart</h2>
          </div>
          <CardContent className="p-6">
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                    <Bar dataKey="test1" name="Test 1" fill="#2563EB" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="test2" name="Test 2" fill="#60A5FA" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
