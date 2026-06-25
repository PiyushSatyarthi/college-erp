import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, BarChart2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';

export function HodMarks() {
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const subjects = [
    { subject: 'Operating Systems', faculty: 'Dr. Suresh Patil', avg: 18.5, max: 28, min: 4, pass: 82, totalStudents: 60, passed: 49 },
    { subject: 'Computer Networks', faculty: 'Prof. Amit Kumar', avg: 14.2, max: 26, min: 2, pass: 64, totalStudents: 60, passed: 38 },
    { subject: 'Data Structures', faculty: 'Dr. Ramesh Singh', avg: 21.0, max: 30, min: 8, pass: 95, totalStudents: 60, passed: 57 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Marks Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Department academic performance analysis</p>
        </div>
        <Button variant="outline"><BarChart2 className="mr-2 h-4 w-4" /> Generat Analysis Report</Button>
      </div>

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50 flex-wrap">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search subject..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option>Internal Test 1</option>
            <option>Internal Test 2</option>
            <option>End Semester</option>
          </select>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Subject</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Faculty</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Class Avg</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Highest</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Pass %</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {subjects.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.subject}</td>
                    <td className="px-4 py-3 text-slate-500">{s.faculty}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">{s.avg.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 30</span></td>
                    <td className="px-4 py-3 text-center">{s.max}</td>
                    <td className={`px-4 py-3 text-center font-medium ${s.pass < 70 ? 'text-red-500' : 'text-green-500'}`}>{s.pass}%</td>
                    <td className="px-4 py-3 text-right">
                       <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" onClick={() => setSelectedSubject(s)}>View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog 
        isOpen={!!selectedSubject} 
        onClose={() => setSelectedSubject(null)}
        title={`${selectedSubject?.subject} - Details`}
        footer={
          <Button variant="outline" onClick={() => setSelectedSubject(null)}>Close</Button>
        }
      >
        {selectedSubject && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Faculty</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubject.faculty}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Students</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubject.totalStudents}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Passed</p>
                <p className="font-medium text-green-600 dark:text-green-400">{selectedSubject.passed}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Failed</p>
                <p className="font-medium text-red-600 dark:text-red-400">{selectedSubject.totalStudents - selectedSubject.passed}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Highest Score</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubject.max} / 30</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Lowest Score</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubject.min} / 30</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

