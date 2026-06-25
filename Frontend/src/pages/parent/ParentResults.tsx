import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Award, Download, DownloadCloud, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ParentResults() {
  const [selectedYear, setSelectedYear] = useState('2');
  const [selectedSem, setSelectedSem] = useState('Sem 3');

  const semesters = [
    { sem: 'Sem 1', year: '1', cgpa: '8.2', status: 'Passed' },
    { sem: 'Sem 2', year: '1', cgpa: '8.6', status: 'Passed' },
    { sem: 'Sem 3', year: '2', cgpa: '8.4', status: 'Passed' },
    { sem: 'Sem 4', year: '2', cgpa: '-', status: 'Ongoing' },
  ];

  const currentResult = [
    { subject: 'Data Structures', marks: '85', grade: 'A', status: 'Pass' },
    { subject: 'Operating Systems', marks: '78', grade: 'B+', status: 'Pass' },
    { subject: 'Algorithms', marks: '92', grade: 'A+', status: 'Pass' },
    { subject: 'Computer Networks', marks: '74', grade: 'B', status: 'Pass' },
    { subject: 'Database Systems', marks: '88', grade: 'A', status: 'Pass' },
    { subject: 'Data Structures Lab', marks: '45/50', grade: 'O', status: 'Pass' },
    { subject: 'Operating Systems Lab', marks: '42/50', grade: 'A', status: 'Pass' },
  ];

  const years = ['1', '2', '3', '4'];
  const filteredSems = semesters.filter(s => s.year === selectedYear);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" /> Exam Results
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View semester-wise results and report cards for Rahul Sharma</p>
        </div>
        <Button variant="outline"><DownloadCloud className="mr-2 h-4 w-4" /> Download Transcript</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="md:col-span-1 border-blue-100 dark:border-blue-900/30">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/10">
               <h2 className="font-semibold text-slate-900 dark:text-slate-100">Filter By Year</h2>
            </div>
            <CardContent className="p-4 space-y-2">
               {years.map(year => (
                  <button 
                     key={year}
                     onClick={() => { setSelectedYear(year); setSelectedSem(`Sem ${parseInt(year) * 2 - 1}`); }}
                     className={`w-full text-left px-4 py-2 text-sm rounded-lg border transition-all ${
                        selectedYear === year 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300 font-medium' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900'
                     }`}
                  >
                     Year {year} ({year === '1' ? 'First Year' : year === '2' ? 'Second Year' : year === '3' ? 'Third Year' : 'Final Year'})
                  </button>
               ))}
            </CardContent>
         </Card>

         <div className="md:col-span-3 space-y-6">
            <div className="flex flex-wrap gap-2">
               {filteredSems.map(sem => (
                  <button
                     key={sem.sem}
                     onClick={() => setSelectedSem(sem.sem)}
                     className={`px-5 py-2.5 rounded-full text-sm transition-colors border ${
                        selectedSem === sem.sem
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/50'
                     }`}
                  >
                     {sem.sem}
                  </button>
               ))}
            </div>

            <Card>
               <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <div>
                     <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Result Statement - {selectedSem}</h2>
                     <p className="text-sm text-slate-500">December 2024 Examination</p>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-xs text-slate-500 mb-1">SGPA</span>
                     <span className="font-bold text-xl text-slate-900 dark:text-white">
                        {semesters.find(s => s.sem === selectedSem)?.cgpa || '-'}
                     </span>
                  </div>
               </div>
               <CardContent className="p-0">
                  {semesters.find(s => s.sem === selectedSem)?.status === 'Ongoing' ? (
                     <div className="p-12 text-center flex flex-col items-center text-slate-500 dark:text-slate-400">
                        <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="font-medium text-slate-900 dark:text-slate-100">Semester is ongoing</p>
                        <p className="text-sm mt-1">Results will be published after the final examinations.</p>
                     </div>
                  ) : (
                     <>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                 <tr>
                                 <th className="px-5 py-3 font-medium text-slate-500">Course / Subject</th>
                                 <th className="px-5 py-3 font-medium text-slate-500 text-center">Marks Score</th>
                                 <th className="px-5 py-3 font-medium text-slate-500 text-center">Grade</th>
                                 <th className="px-5 py-3 font-medium text-slate-500 text-center">Status</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                 {currentResult.map((res, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                       <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{res.subject}</td>
                                       <td className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 font-mono">{res.marks}</td>
                                       <td className="px-5 py-3 text-center">
                                          <span className={`font-bold ${res.grade === 'O' || res.grade === 'A+' ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>{res.grade}</span>
                                       </td>
                                       <td className="px-5 py-3 text-center">
                                          <Badge variant="success" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">Pass</Badge>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                           <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20">
                              <Download className="w-4 h-4 mr-2" /> Download Marksheet (PDF)
                           </Button>
                        </div>
                     </>
                  )}
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
