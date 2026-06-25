import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function StudentTimetable() {
  const [view, setView] = useState<'week' | 'day'>('week');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Timetable</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Semester 5 - Div A</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg dark:bg-slate-800">
           <button 
             onClick={() => setView('week')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === 'week' ? 'bg-white shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Week View</button>
           <button 
             onClick={() => setView('day')}
             className={`px-4 py-1.5 text-sm font-medium rounded-md ${view === 'day' ? 'bg-white shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Day View</button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {view === 'week' ? (
          <table className="w-full text-sm text-left table-fixed min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="w-24 px-4 py-3 font-medium text-slate-500 border-r border-slate-200 dark:border-slate-800 text-center">Time</th>
                <th className="px-4 py-3 font-medium text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 text-center">Mon (Today)</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-center">Tue</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-center">Wed</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-center">Thu</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-center">Fri</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-center">Sat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'].map((time, i) => (
                <tr key={i} className="h-24">
                  <td className="w-24 px-2 py-3 font-mono text-xs text-slate-500 border-r border-slate-200 dark:border-slate-800 align-top text-center pt-4">
                    {time}
                  </td>
                  <td className="px-2 py-2 align-top bg-blue-50/30 dark:bg-blue-900/10 border-r border-slate-100 dark:border-slate-800/50 relative">
                     {i === 2 && <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 z-10 flex items-center shadow-[0_0_8px_rgba(239,68,68,0.6)]"><div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div></div>}
                     {i === 1 && (
                       <div className="h-full w-full rounded-md bg-blue-50/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-2 flex flex-col justify-between">
                         <span className="font-semibold text-blue-800 dark:text-blue-400 text-xs">CS301</span>
                         <span className="text-[10px] text-blue-600 dark:text-blue-500 truncate">Dr. Patil • Rm 204</span>
                       </div>
                     )}
                  </td>
                  <td className="px-2 py-2 align-top border-r border-slate-100 dark:border-slate-800/50">
                     {i === 2 && (
                       <div className="h-full w-full rounded-md bg-blue-50/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-2 flex flex-col justify-between">
                         <span className="font-semibold text-blue-800 dark:text-blue-400 text-xs">CS302</span>
                         <span className="text-[10px] text-blue-600 dark:text-blue-500 truncate">Prof. Kumar • Rm 205</span>
                       </div>
                     )}
                  </td>
                  <td className="px-2 py-2 align-top border-r border-slate-100 dark:border-slate-800/50"></td>
                  <td className="px-2 py-2 align-top border-r border-slate-100 dark:border-slate-800/50">
                    {i === 1 && (
                       <div className="h-full w-full rounded-md bg-indigo-100/50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 p-2 flex flex-col justify-between">
                         <span className="font-semibold text-indigo-800 dark:text-indigo-400 text-xs">CS305</span>
                         <span className="text-[10px] text-indigo-600 dark:text-indigo-500 truncate">Lab 1</span>
                       </div>
                     )}
                  </td>
                  <td className="px-2 py-2 align-top border-r border-slate-100 dark:border-slate-800/50"></td>
                  <td className="px-2 py-2 align-top"></td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : (
          <table className="w-full text-sm text-left min-w-[400px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="w-32 px-4 py-3 font-medium text-slate-500 border-r border-slate-200 dark:border-slate-800 text-center">Time</th>
                <th className="px-4 py-3 font-medium text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 text-center">Today's Classes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'].map((time, i) => (
                <tr key={i} className="h-24">
                  <td className="w-32 px-4 py-3 font-mono text-sm text-slate-500 border-r border-slate-200 dark:border-slate-800 align-top text-center pt-4">
                    {time}
                  </td>
                  <td className="px-4 py-2 align-top bg-blue-50/10 dark:bg-blue-900/5 relative">
                     {i === 2 && <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 z-10 flex items-center shadow-[0_0_8px_rgba(239,68,68,0.6)]"><div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div></div>}
                     {i === 1 && (
                       <div className="h-full w-full rounded-md bg-blue-50/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 flex flex-col justify-center gap-1">
                         <span className="font-semibold text-blue-800 dark:text-blue-400 text-sm">CS301 - Data Structures</span>
                         <span className="text-xs text-blue-600 dark:text-blue-500">Dr. Patil • Rm 204</span>
                       </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </Card>
    </div>
  );
}
