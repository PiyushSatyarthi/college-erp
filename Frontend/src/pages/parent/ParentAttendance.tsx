import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ParentAttendance() {
  const attendanceTrendData = [
    { week: 'W1', attendance: 92 },
    { week: 'W2', attendance: 88 },
    { week: 'W3', attendance: 85 },
    { week: 'W4', attendance: 89 },
    { week: 'W5', attendance: 78 },
    { week: 'W6', attendance: 82 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Details</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Detailed attendance view for Rahul Sharma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Overall Attendance</p>
            <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">78%</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Just above minimum criteria (75%)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Subject-wise Attendance</h2>
          </div>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                   <tr>
                     <th className="px-4 py-3 font-medium text-slate-500">Subject</th>
                     <th className="px-4 py-3 font-medium text-slate-500 text-center">Classes</th>
                     <th className="px-4 py-3 font-medium text-slate-500 text-center">Attended</th>
                     <th className="px-4 py-3 font-medium text-slate-500 text-right">%</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   {[
                      { subject: 'Data Structures', total: 40, attended: 35, perc: 87.5 },
                      { subject: 'Operating Systems', total: 38, attended: 25, perc: 65.7 },
                      { subject: 'Algorithms', total: 35, attended: 30, perc: 85.7 },
                      { subject: 'Computer Networks', total: 36, attended: 26, perc: 72.2 },
                   ].map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                         <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.subject}</td>
                         <td className="px-4 py-3 text-center text-slate-500">{s.total}</td>
                         <td className="px-4 py-3 text-center text-slate-500">{s.attended}</td>
                         <td className={`px-4 py-3 text-right font-medium ${s.perc < 75 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{s.perc}%</td>
                      </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Weekly Trend</h2>
          </div>
          <CardContent className="p-6">
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
