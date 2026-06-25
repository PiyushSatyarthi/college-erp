import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, CheckSquare } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';

export function AdminTimetable() {
  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{day: number, time: string} | null>(null);
  
  const [subject, setSubject] = useState('');
  const [faculty, setFaculty] = useState('');
  const [room, setRoom] = useState('');

  const openSlotDialog = (day: number, time: string) => {
    setSelectedCell({ day, time });
    setSubject(''); setFaculty(''); setRoom('');
    setIsSlotOpen(true);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [times, setTimes] = useState(['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM']);

  const handleTimeChange = (index: number, newTime: string) => {
    const updatedTimes = [...times];
    updatedTimes[index] = newTime;
    setTimes(updatedTimes);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Timetable Builder</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Schedule classes for different divisions</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">Copy Previous</Button>
           <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">Clear</Button>
           <Button ><CheckSquare className="mr-2 h-4 w-4"/> Save</Button>
        </div>
      </div>

      <div className="flex gap-4">
        <select className="px-3 py-2 w-[180px] bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
          <option>BTECH-COMP</option>
          <option>BTECH-MECH</option>
          <option>BTECH-CIVIL</option>
          <option>BTECH-ELEX</option>
        </select>
        <select className="px-3 py-2 w-[120px] bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
           <option>Semester 1</option>
           <option>Semester 2</option>
           <option>Semester 3</option>
           <option>Semester 4</option>
           <option>Semester 5</option>
           <option>Semester 6</option>
           <option>Semester 7</option>
           <option>Semester 8</option>
        </select>
      </div>

      <Dialog 
        isOpen={isSlotOpen} 
        onClose={() => setIsSlotOpen(false)} 
        title={`Add Slot: ${selectedCell ? days[selectedCell.day - 1] : ''} ${selectedCell?.time}`}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsSlotOpen(false)}>Cancel</Button>
              <Button  onClick={() => setIsSlotOpen(false)}>Save Slot</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject <span className="text-red-500">*</span></label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                 <option value="">Select subject...</option>
                 <option value="CS301">CS301 - Data Structures</option>
                 <option value="CS302">CS302 - Algorithms</option>
              </select>
           </div>
           
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Faculty <span className="text-red-500">*</span></label>
              <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                 <option value="">Select faculty...</option>
                 <option value="Dr. Patil">Dr. Patil</option>
                 <option value="Prof. Kumar">Prof. Kumar</option>
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Room <span className="text-red-500">*</span></label>
              <select value={room} onChange={(e) => setRoom(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                 <option value="">Select room...</option>
                 <option value="204">Room 204</option>
                 <option value="205">Room 205</option>
                 <option value="Lab 1">Lab 1</option>
              </select>
           </div>
        </div>
      </Dialog>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left table-fixed min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="w-24 px-4 py-3 font-medium text-slate-500 border-r border-slate-200 dark:border-slate-800 text-center">Time</th>
                  {days.map(d => (
                    <th key={d} className="px-4 py-3 font-medium text-slate-500 text-center">{d}</th>
                  ))}
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
               {times.map((time, i) => (
                  <tr key={i} className="h-24">
                    <td className="w-24 px-2 py-3 font-mono text-xs text-slate-500 border-r border-slate-200 dark:border-slate-800 align-top text-center pt-3">
                       <input
                          type="text"
                          value={time}
                          onChange={(e) => handleTimeChange(i, e.target.value)}
                          className="w-full text-center bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 rounded py-1 outline-none transition-colors"
                       />
                    </td>
                    {[1,2,3,4,5,6].map((day) => (
                       <td key={day} onClick={() => openSlotDialog(day, time)} className="px-2 py-2 align-top border-r border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer group relative">
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-slate-800 dark:text-blue-400 font-medium text-lg">+</div>
                          </div>
                          {(i === 1 && day === 1) && (
                            <div className="h-full w-full rounded-md bg-blue-50/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-2 flex flex-col justify-between relative z-10">
                               <span className="font-semibold text-blue-800 dark:text-blue-400 text-xs">CS301</span>
                               <span className="text-[10px] text-blue-600 dark:text-blue-500 truncate">Dr. Patil • Rm 204</span>
                            </div>
                          )}
                          {(i === 3 && day === 2) && (
                            <div className="h-full w-full rounded-md bg-amber-100/50 dark:bg-amber-900/30 border border-slate-200 dark:border-amber-800 p-2 flex flex-col justify-between relative z-10 border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)]">
                               <span className="font-semibold text-amber-800 dark:text-amber-400 text-xs">CS302</span>
                               <span className="text-[10px] text-amber-600 dark:text-amber-500 truncate">Dr. Patil • Rm 205</span>
                               <div className="absolute top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" title="Conflict"></div>
                            </div>
                          )}
                       </td>
                    ))}
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
