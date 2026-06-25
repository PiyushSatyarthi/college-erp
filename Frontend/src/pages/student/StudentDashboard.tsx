import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Brain, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="bg-blue-600 text-white border-none shadow-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Rahul 👋</h1>
          <p className="mt-1 opacity-90 font-mono text-sm">2024CS001 | Computer Engineering | Semester 5</p>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20 flex gap-4 items-start">
         <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
         <div className="flex-1">
           <h3 className="font-semibold text-red-800 dark:text-red-400">Attendance Warning!</h3>
           <p className="text-sm text-red-700 dark:text-red-300 mt-1">You are below 75% attendance in 2 subjects. Risk of exam ineligibility.</p>
           <Button variant="outline" size="sm" className="mt-3 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50" onClick={() => navigate('/student/condonation')}>
             Apply for Condonation <ArrowRight className="ml-2 h-4 w-4" />
           </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-800">
               <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-blue-600" strokeDasharray="289" strokeDashoffset="75" />
               </svg>
               <div className="text-center">
                 <span className="text-3xl font-bold text-slate-900 dark:text-white">74%</span>
               </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">142 present / 200 total sessions</p>
            
            <div className="w-full mt-6 flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span>Operating Systems</span>
                  <span className="text-red-700">68%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                   <span>Data Structures</span>
                  <span className="text-green-700">82%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-blue-500/30 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Brain className="h-24 w-24 text-blue-500" />
           </div>
           <CardHeader>
             <CardTitle className="flex items-center gap-2 relative z-10">
               🤖 Attendance Predictor
             </CardTitle>
           </CardHeader>
           <CardContent className="relative z-10 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                 <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Operating Systems — Current: 68%</h4>
                 <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <p className="flex items-center gap-2"><span className="text-green-600">📈</span> Need to attend next 8 classes to reach 75%</p>
                    <p className="flex items-center gap-2"><span className="text-slate-500">📅</span> You can skip max 0 more classes</p>
                    <p className="flex items-center gap-2"><span className="text-red-600">⚠</span> If you miss 2 more, drops to 61%</p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Latest Published Marks</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">View All →</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { sub: 'Computer Networks', test: 'Internal Test 1', score: '24/30', grade: 'A' },
                { sub: 'Operating Systems', test: 'Assignment 1', score: '8/10', grade: 'B+' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{item.sub}</h4>
                    <p className="text-xs text-slate-500">{item.test}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-medium">{item.score}</span>
                    <Badge variant="outline">{item.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
       </Card>

    </div>
  );
}
