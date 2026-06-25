import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, QrCode, CheckSquare, Search, FileText, Check, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export function FacultySessionDetails() {
  const { id } = useParams();

  // Mock data for the session details based on typical structure
  const session = {
     id: id || '1',
     subject: 'CS301 — Data Structures',
     div: 'Div A',
     date: '13 Jan 2025',
     time: '09:00 AM - 10:00 AM',
     room: '204',
     status: 'Ongoing',
     topic: 'Binary Search Trees & Traversal',
  };

  const [students, setStudents] = useState([
     { roll: '2024CS01', name: 'Rahul Sharma', attStatus: 'Present', time: '09:05 AM' },
     { roll: '2024CS02', name: 'Priya Desai', attStatus: 'Absent', time: '-' },
     { roll: '2024CS03', name: 'Amit Patel', attStatus: 'Present', time: '09:12 AM' },
     { roll: '2024CS04', name: 'Sneha Rao', attStatus: null, time: '-' },
  ]);

  const toggleAttendance = (index: number, status: 'Present' | 'Absent') => {
    const newStudents = [...students];
    newStudents[index].attStatus = status;
    newStudents[index].time = status === 'Present' ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-';
    setStudents(newStudents);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/faculty/sessions">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Session Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage real-time classroom activities</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200"><QrCode className="mr-2 h-4 w-4"/> Generate Attendance QR</Button>
           <Button ><CheckSquare className="mr-2 h-4 w-4"/> Finish Session</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="md:col-span-1 border-l-4 border-l-blue-600">
            <CardContent className="p-6">
               <Badge variant="warning" className="mb-4">Ongoing</Badge>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{session.subject}</h2>
               <div className="space-y-3 mt-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-medium">Class / Div</span>
                    <span className="text-slate-900 dark:text-slate-100">{session.div}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-medium">Date & Time</span>
                    <span className="text-slate-900 dark:text-slate-100 text-right">{session.date}<br/><span className="text-xs">{session.time}</span></span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-medium">Room</span>
                    <span className="text-slate-900 dark:text-slate-100">{session.room}</span>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Topics Covered</span>
                    <input type="text" defaultValue={session.topic} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm dark:bg-slate-900/50 dark:border-slate-800 outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="md:col-span-2">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
               <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">Live Attendance Roster</h2>
                  <p className="text-xs text-slate-500">2 present out of 60 students (Auto-refreshing via QR)</p>
               </div>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search students..." 
                   className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>
            </div>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                     <tr>
                       <th className="px-4 py-3 font-medium text-slate-500">Roll No</th>
                       <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                       <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                       <th className="px-4 py-3 font-medium text-slate-500 text-right">Time Marked</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                     {students.map((st, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                           <td className="px-4 py-3 font-mono text-slate-500">{st.roll}</td>
                           <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{st.name}</td>
                           <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleAttendance(i, 'Present')}
                                  className={`h-7 px-2 text-xs font-medium ${st.attStatus === 'Present' ? 'bg-green-100/50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                                >
                                  <Check className="w-3 h-3 mr-1" /> Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleAttendance(i, 'Absent')}
                                  className={`h-7 px-2 text-xs font-medium ${st.attStatus === 'Absent' ? 'bg-red-100/50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                >
                                  <X className="w-3 h-3 mr-1" /> Absent
                                </Button>
                              </div>
                           </td>
                           <td className="px-4 py-3 text-right text-slate-500 font-mono text-xs">{st.time}</td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
