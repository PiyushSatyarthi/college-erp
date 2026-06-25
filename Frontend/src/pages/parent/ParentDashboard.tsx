import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Mic, Phone, AlertTriangle } from 'lucide-react';

import { Link } from 'react-router-dom';

export function ParentDashboard() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Parent Dashboard</h1>
        </div>
        <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
          <option>👤 Rahul Sharma (Sem 5)</option>
        </select>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
         <div className="flex items-start gap-4">
           <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
           <div>
             <h3 className="font-semibold text-red-800 dark:text-red-400">Attendance Alert!</h3>
             <p className="text-sm text-red-700 dark:text-red-300 mt-1">Rahul's attendance in OS has dropped to 68%. Exam ineligibility risk.</p>
           </div>
         </div>
         <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50 whitespace-nowrap">
           <Phone className="mr-2 h-4 w-4" /> Call College
         </Button>
      </div>

      <Card className="bg-blue-600 text-white border-none overflow-hidden relative shadow-lg">
        <div className="absolute right-[-20px] top-[-20px] opacity-20">
          <Mic className="h-48 w-48" />
        </div>
        <CardContent className="p-8 relative z-10">
          <h2 className="text-2xl font-bold mb-2">Voice Assistant</h2>
          <p className="opacity-90 max-w-sm mb-6">Ask about Rahul's academic progress, attendance, and recent marks using your voice.</p>
          <Link to="/parent/voice-agent">
            <Button variant="secondary" className="text-blue-700 font-semibold shadow-sm hover:bg-blue-50">
              <Mic className="mr-2 h-5 w-5" /> Start Voice Chat
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Attendance Summary</CardTitle>
              <Link to="/parent/attendance">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-amber-700">74%</span>
                <p className="text-sm text-slate-500 mt-1">Overall Attendance</p>
              </div>
              <div className="w-full space-y-4">
                 {[
                   { sub: 'OS', val: 68 },
                   { sub: 'DS', val: 82 },
                   { sub: 'CN', val: 75 },
                 ].map(s => (
                   <div key={s.sub}>
                     <div className="flex justify-between text-xs mb-1">
                       <span>{s.sub}</span><span>{s.val}%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600" style={{width: `${s.val}%`}}></div>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Marks</CardTitle>
              <Link to="/parent/marks">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { sub: 'Computer Networks', test: 'Internal Test 1', score: '24/30', grade: 'A' },
                  { sub: 'Operating Systems', test: 'Assignment 1', score: '8/10', grade: 'B+' },
                  { sub: 'Web Tech', test: 'Practical', score: '20/25', grade: 'A+' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">{item.sub}</h4>
                      <p className="text-xs text-slate-500">{item.test}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm font-medium">{item.score}</span>
                      <Badge variant="outline" className="text-[10px] py-0">{item.grade}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
         </Card>
      </div>

    </div>
  );
}
