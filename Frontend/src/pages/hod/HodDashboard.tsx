import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Users, ClipboardCheck, ArrowRight, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const dummyData = [

  { name: 'W1', value: 72 },
  { name: 'W2', value: 75 },
  { name: 'W3', value: 68 },
  { name: 'W4', value: 71 },
];

export function HodDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Department Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Computer Engineering — Semester 5, 2024-25</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">Dept Students</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">120</h2>
              </div>
              <Users className="text-blue-600 h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
           <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">Dept Faculty</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">8</h2>
              </div>
              <BookOpen className="text-blue-600 h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
           <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">Avg Attendance</p>
                <h2 className="text-3xl font-bold mt-2 text-amber-600 dark:text-amber-500">71%</h2>
              </div>
              <ClipboardCheck className="text-blue-600 h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
           <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">Pending Condonations</p>
                <h2 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">8</h2>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate('/hod/condonations')} className="w-full">Review Now</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend (Last 4 Weeks)</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={dummyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Faculty Overview</CardTitle>
              <CardDescription>Performance across department</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {[
                 { name: 'Dr. Suresh Patil', sub: 'CS301, CS302', att: 78, sessions: 12 },
                 { name: 'Prof. A. Kumar', sub: 'CS305', att: 65, sessions: 8 },
                 { name: 'Dr. R. Singh', sub: 'CS308', att: 82, sessions: 10 },
               ].map((f, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{f.name}</p>
                      <p className="text-xs text-slate-500">{f.sub} • {f.sessions} sessions this week</p>
                    </div>
                    <Badge variant={f.att >= 75 ? "success" : "warning"}>{f.att}% Avg</Badge>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
