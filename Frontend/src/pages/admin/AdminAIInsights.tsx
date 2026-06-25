import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Brain, RefreshCw, AlertTriangle, Info } from 'lucide-react';

const anomalies = [
  { id: 1, type: 'critical', desc: 'Student 2024CS014 marked present in 2 simultaneous sessions — possible QR code sharing', target: 'Rahul Sharma', time: '10 mins ago', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-900/50' },
  { id: 2, type: 'warning', desc: 'Marks for 60 students entered in under 3 minutes by Dr. Patil — unusually fast bulk entry', target: 'Dr. Suresh Patil', time: '2 hours ago', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-slate-200 dark:border-amber-900/50' },
  { id: 3, type: 'info', desc: 'Attendance in Division B dropped 18% vs Division A for the same subject this week', target: 'Computer Eng - Div B', time: '1 day ago', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/50' },
];

export function AdminAIInsights() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <Brain className="w-6 h-6 text-blue-600" /> AI Anomaly Detection
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Unusual patterns detected in the last 24 hours</p>
        </div>
        <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh Analysis</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {anomalies.map((a) => (
          <Card key={a.id} className={`overflow-hidden border ${a.border} shadow-sm`}>
             <div className="flex flex-col sm:flex-row">
                 <div className={`w-full sm:w-16 ${a.bg} flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r ${a.border}`}>
                    <a.icon className={`w-8 h-8 ${a.color}`} />
                 </div>
                 <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <Badge variant={a.type as any} className="uppercase text-[10px] tracking-wider font-bold">
                           {a.type}
                         </Badge>
                         <span className="text-xs text-slate-500 font-medium">{a.time}</span>
                      </div>
                      <p className="text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                        {a.desc}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                       <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                         Related: {a.target}
                       </span>
                    </div>
                 </div>
                 <div className={`p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-center gap-2 border-t sm:border-t-0 sm:border-l ${a.border}`}>
                    <Button variant="outline" className="w-full">Investigate</Button>
                    <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700">Dismiss</Button>
                 </div>
             </div>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
           <CardTitle>Anomaly History</CardTitle>
           <CardDescription>Recently resolved or dismissed anomalies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 text-center py-8">
            No recent history to display.
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
