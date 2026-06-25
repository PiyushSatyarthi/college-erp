import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, GraduationCap, CheckCircle, AlertCircle, TrendingUp, Download, Plus, Mail, FileWarning, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const attendanceData = [
  { name: 'COMP', value: 82, fill: '#1E40AF' },
  { name: 'MECH', value: 68, fill: '#2563EB' },
  { name: 'CIVIL', value: 75, fill: '#60A5FA' },
  { name: 'ELEX', value: 71, fill: '#BFDBFE' },
];

const gradeData = [
  { name: 'O', value: 45, color: '#1E3A8A' },
  { name: 'A+', value: 80, color: '#1E40AF' },
  { name: 'A', value: 120, color: '#1D4ED8' },
  { name: 'B+', value: 150, color: '#2563EB' },
  { name: 'B', value: 60, color: '#3B82F6' },
  { name: 'C', value: 20, color: '#60A5FA' },
  { name: 'F', value: 8, color: '#93C5FD' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [gradeSemester, setGradeSemester] = useState<string>('5');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickAddOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Shri Vivekanand College of Engineering — Overview</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <Button onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}>
            <Plus className="mr-2 h-4 w-4" /> Quick Add
          </Button>
          
          {isQuickAddOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => { navigate('/admin/students'); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Add Student
                </button>
                <button
                  onClick={() => { navigate('/admin/faculty'); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Add Faculty
                </button>
                <button
                  onClick={() => { navigate('/admin/courses'); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Add Course
                </button>
                <button
                  onClick={() => { navigate('/admin/departments'); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Add Department
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">483</h2>
                  <span className="text-xs text-green-600 font-medium">↑ +12 this semester</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Faculty</p>
                 <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">32</h2>
                  <span className="text-xs text-slate-500">Across 4 departments</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Attendance %</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-amber-600 dark:text-amber-500">74%</h2>
                  <span className="text-xs text-slate-500">342 / 460 present</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Condonations</p>
                 <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">8</h2>
                  <span className="text-xs text-slate-500">Requires HOD action</span>
                </div>
              </div>
              <div className="rounded-full bg-blue-50 p-3 dark:bg-slate-800">
                <FileWarning className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This Week's Attendance by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-20">
            <CardTitle>Grade Distribution</CardTitle>
            <select
              value={gradeSemester}
              onChange={(e) => setGradeSemester(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
             <div className="h-[250px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeData} innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">483</p>
                <p className="text-xs text-slate-500">Totals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 relative overflow-hidden ring-1 ring-blue-500/30">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                 <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">🤖 AI-Powered</Badge>
                 Students At Risk
              </CardTitle>
              <CardDescription>Top 5 at-risk students (below 65% + low marks)</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => navigate('/admin/students')}>View all →</Button>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead>
                   <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                     <th className="pb-3 font-medium">Name</th>
                     <th className="pb-3 font-medium">Course</th>
                     <th className="pb-3 font-medium">Attendance %</th>
                     <th className="pb-3 font-medium">Risk Level</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {[
                      { name: 'Rahul Sharma', course: 'Computer Eng', att: 61, risk: 'Critical', color: 'danger' },
                      { name: 'Priya Patel', course: 'Mechanical', att: 64, risk: 'High', color: 'warning' },
                      { name: 'Amit Kumar', course: 'Civil', att: 58, risk: 'Critical', color: 'danger' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{row.name}</td>
                        <td className="py-3 text-slate-500">{row.course}</td>
                        <td className="py-3">
                          <span className={`font-mono ${row.att >= 75 ? 'text-green-600' : 'text-red-600'}`}>{row.att}%</span>
                        </td>
                        <td className="py-3">
                          <Badge variant={row.color as any}>{row.risk}</Badge>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { msg: 'Dr. Patil updated marks for CS301', time: '2 min ago' },
              { msg: 'Priya Sharma applied for condonation', time: '15 min ago' },
              { msg: 'Rahul login from new device', time: '1 hour ago' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.msg}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Import Students</Button>
        <Button variant="outline"><BarChartIcon className="mr-2 h-4 w-4" /> Generate Report</Button>
        <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Send Broadcast</Button>
      </div>
    </div>
  );
}
