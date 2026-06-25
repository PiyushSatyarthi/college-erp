import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QrCode, CheckSquare, Upload, CalendarDays, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

export function FacultyDashboard() {
  const attendanceData = [
    { name: 'Present', value: 85 },
    { name: 'Absent', value: 15 },
  ];
  const COLORS = ['#2563EB', '#f1f5f9']; // blue-600 and slate-100 (for light mode) 

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Good morning, Dr. Patil 👋</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monday, 13 January 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Sessions Today</p>
            <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">3</h2>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">My Attendance</p>
              <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">85%</h2>
            </div>
            <div className="h-16 w-16 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={attendanceData}
                       innerRadius={20}
                       outerRadius={30}
                       paddingAngle={2}
                       dataKey="value"
                       stroke="none"
                    >
                       {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className={index === 1 ? 'dark:fill-slate-800' : ''} />
                       ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                 </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Marks Pending</p>
            <h2 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">2</h2>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" /> Today's Timetable
               </h2>
               <Button variant="outline" size="sm" className="hidden sm:flex text-slate-500"><CalendarDays className="w-4 h-4 mr-2" /> View Full Schedule</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="border-l-4 border-l-blue-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between md:justify-start gap-3 mb-1">
                       <CardTitle className="text-lg text-slate-900 dark:text-white">CS301 — Data Structures</CardTitle>
                       <Badge variant="warning" className="md:hidden">Ongoing</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                       <span className="font-medium text-slate-800 dark:text-slate-200">Room 204</span> • Computer Eng • Div A 
                    </CardDescription>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="warning" className="hidden md:inline-flex">Ongoing</Badge>
                      <span className="text-xs text-slate-500 font-medium font-mono flex items-center gap-1"><Clock className="w-3 h-3"/> 09:00 AM – 10:00 AM</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">60 Students</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                    <Link to="/faculty/sessions/1">
                      <Button  className="w-full justify-start"><CheckSquare className="mr-2 h-4 w-4"/> Start & Take Attendance</Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start text-blue-600 dark:text-blue-400"><QrCode className="mr-2 h-4 w-4"/> Generate Subject QR</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-slate-200 dark:border-l-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between md:justify-start gap-3 mb-1">
                       <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">CS302 — Algorithms</CardTitle>
                       <Badge variant="outline" className="md:hidden text-slate-500">Upcoming</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                       <span className="font-medium text-slate-800 dark:text-slate-200">Room 205</span> • Computer Eng • Div B
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Badge variant="outline" className="hidden md:inline-flex text-slate-500">Upcoming</Badge>
                      <span className="text-xs text-slate-500 font-medium font-mono flex items-center gap-1"><Clock className="w-3 h-3"/> 11:00 AM – 12:00 PM</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">62 Students</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                    <Button variant="outline" className="w-full justify-start text-slate-500" disabled><CheckSquare className="mr-2 h-4 w-4"/> Start Class</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-slate-200 dark:border-l-slate-700 shadow-sm hover:shadow-md transition-shadow opacity-60">
                <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between md:justify-start gap-3 mb-1">
                       <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">CS301L — Data Structure Lab</CardTitle>
                       <Badge variant="outline" className="md:hidden text-slate-500">Upcoming</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                       <span className="font-medium text-slate-800 dark:text-slate-200">Lab 3</span> • Computer Eng • Batch B1
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <Badge variant="outline" className="hidden md:inline-flex text-slate-500">Upcoming</Badge>
                      <span className="text-xs text-slate-500 font-medium font-mono flex items-center gap-1"><Clock className="w-3 h-3"/> 02:00 PM – 04:00 PM</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">20 Students</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                    <Button variant="outline" className="w-full justify-start text-slate-500" disabled><CheckSquare className="mr-2 h-4 w-4"/> Start Class</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
         </div>
         
         <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Pending Tasks</h2>
            <Card className="border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="p-5 flex flex-col justify-between gap-4">
                 <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">CS301 — Internal Test 1</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">You need to upload marks for Div A. The deadline is approaching.</p>
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                       <Clock className="w-3 h-3 mr-1" /> Due by 20 Jan 2025
                    </div>
                    <Link to="/faculty/marks">
                      <Button  className="w-full">Enter Marks</Button>
                    </Link>
                    <Link to="/faculty/ocr">
                      <Button variant="outline" className="w-full bg-white dark:bg-slate-950 hover:bg-slate-50"><Upload className="mr-2 h-4 w-4"/> OCR Upload</Button>
                    </Link>
                 </div>
              </CardContent>
            </Card>
         </div>
      </div>

    </div>
  );
}
