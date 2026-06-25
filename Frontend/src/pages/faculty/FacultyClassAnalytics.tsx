import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Check } from 'lucide-react';

export function FacultyClassAnalytics() {
  const [exported, setExported] = React.useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const attendanceTrendData = [
    { week: 'W1', attendance: 92 },
    { week: 'W2', attendance: 88 },
    { week: 'W3', attendance: 85 },
    { week: 'W4', attendance: 89 },
    { week: 'W5', attendance: 78 },
    { week: 'W6', attendance: 82 },
  ];

  const marksDistribution = [
    { range: '0-10', students: 2 },
    { range: '11-15', students: 5 },
    { range: '16-20', students: 15 },
    { range: '21-25', students: 25 },
    { range: '26-30', students: 13 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Class Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Insights for CS301 - Data Structures (Div A)</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exported}>
          {exported ? <><Check className="mr-2 h-4 w-4" /> Exported!</> : <><Download className="mr-2 h-4 w-4" /> Export Report</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Attendance Trend (Current Semester)</h2>
          </div>
          <CardContent className="p-6">
             <div className="h-[300px] w-full">
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

        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100">Internal Test 1 - Marks Distribution</h2>
          </div>
          <CardContent className="p-6">
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marksDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                    <Bar dataKey="students" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
