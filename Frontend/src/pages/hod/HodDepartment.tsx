import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, GraduationCap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

export function HodDepartment() {
  const [viewAllType, setViewAllType] = useState<'faculty' | 'students' | 'courses' | null>(null);

  const allFaculty = [
      { name: 'Dr. Suresh Patil', role: 'Associate Professor', subs: 3 },
      { name: 'Prof. Amit Kumar', role: 'Assistant Professor', subs: 2 },
      { name: 'Dr. Ramesh Singh', role: 'Professor', subs: 1 },
      { name: 'Dr. Sneha Rao', role: 'Assistant Professor', subs: 2 },
      { name: 'Dr. Anjali Desai', role: 'Associate Professor', subs: 2 },
      { name: 'Prof. Karan Mehta', role: 'Assistant Professor', subs: 3 },
      { name: 'Dr. Vikram Seth', role: 'Professor', subs: 1 },
      { name: 'Prof. Nidhi Jain', role: 'Assistant Professor', subs: 2 },
  ];

  const allStudents = [
      { name: 'Rahul Sharma', roll: '2024CS01', sem: 'Sem 5', status: 'Active' },
      { name: 'Priya Desai', roll: '2024CS02', sem: 'Sem 5', status: 'Active' },
      { name: 'Amit Patel', roll: '2024CS03', sem: 'Sem 3', status: 'Active' },
      { name: 'Neha Gupta', roll: '2024CS04', sem: 'Sem 1', status: 'Leave' },
      { name: 'Vikram Singh', roll: '2024CS05', sem: 'Sem 5', status: 'Active' },
      { name: 'Sarah Khan', roll: '2024CS06', sem: 'Sem 3', status: 'Active' },
      { name: 'Arjun Das', roll: '2024CS07', sem: 'Sem 7', status: 'Active' },
      { name: 'Pooja Iyer', roll: '2024CS08', sem: 'Sem 1', status: 'Active' },
  ];

  const allCourses = [
      { name: 'B.Tech in Computer Eng', code: 'BTECH-COMP', dur: '4 Years' },
      { name: 'B.Tech in AI & ML', code: 'BTECH-AIML', dur: '4 Years' },
      { name: 'M.Tech in Data Science', code: 'MTECH-DS', dur: '2 Years' },
      { name: 'Ph.D in Computer Science', code: 'PHD-CS', dur: '3+ Years' },
      { name: 'Diploma in Web Dev', code: 'DIP-WEB', dur: '1 Year' },
      { name: 'Certificate in Cloud Computing', code: 'CERT-CC', dur: '6 Months' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Department</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Computer Engineering</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Faculty List */}
         <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center">
               <CardTitle className="text-lg flex items-center gap-2 m-0"><Users className="w-5 h-5 text-blue-600" /> Faculty</CardTitle>
               <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500" onClick={() => setViewAllType('faculty')}>View All</Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {allFaculty.slice(0, 4).map((f, i) => (
                     <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div>
                           <p className="font-semibold text-slate-900 dark:text-slate-100">{f.name}</p>
                           <p className="text-xs text-slate-500">{f.role}</p>
                        </div>
                        <Badge variant="outline">{f.subs} Subjects</Badge>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Student List */}
         <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center">
               <CardTitle className="text-lg flex items-center gap-2 m-0"><GraduationCap className="w-5 h-5 text-indigo-600" /> Students</CardTitle>
               <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500" onClick={() => setViewAllType('students')}>View All</Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {allStudents.slice(0, 4).map((s, i) => (
                     <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div>
                           <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                           <p className="text-xs font-mono text-slate-500 mt-1">{s.roll}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <Badge variant="outline" className="text-xs font-normal">{s.sem}</Badge>
                           <span className={`text-[10px] font-medium ${s.status === 'Active' ? 'text-green-500' : 'text-amber-500'}`}>{s.status}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Courses List */}
         <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center">
               <CardTitle className="text-lg flex items-center gap-2 m-0"><Layers className="w-5 h-5 text-blue-600" /> Courses</CardTitle>
               <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500" onClick={() => setViewAllType('courses')}>View All</Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {allCourses.slice(0, 4).map((c, i) => (
                     <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div>
                           <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{c.name}</p>
                           <p className="text-xs font-mono text-slate-500 mt-1">{c.code}</p>
                        </div>
                        <Badge variant="outline" className="whitespace-nowrap shrink-0">{c.dur}</Badge>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <Dialog
        isOpen={!!viewAllType}
        onClose={() => setViewAllType(null)}
        title={
          viewAllType === 'faculty' ? 'All Faculty' : 
          viewAllType === 'students' ? 'All Students' : 
          'All Courses'
        }
        footer={<Button variant="outline" onClick={() => setViewAllType(null)}>Close</Button>}
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-slate-800/50">
          {viewAllType === 'faculty' && allFaculty.map((f, i) => (
             <div key={i} className="py-3 flex items-center justify-between">
                <div>
                   <p className="font-semibold text-slate-900 dark:text-slate-100">{f.name}</p>
                   <p className="text-sm text-slate-500">{f.role}</p>
                </div>
                <Badge variant="outline">{f.subs} Subjects</Badge>
             </div>
          ))}

          {viewAllType === 'students' && allStudents.map((s, i) => (
             <div key={i} className="py-3 flex items-center justify-between">
                <div>
                   <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                   <p className="text-sm font-mono text-slate-500 mt-1">{s.roll}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <Badge variant="outline" className="text-xs font-normal">{s.sem}</Badge>
                   <span className={`text-[10px] font-medium ${s.status === 'Active' ? 'text-green-500' : 'text-amber-500'}`}>{s.status}</span>
                </div>
             </div>
          ))}

          {viewAllType === 'courses' && allCourses.map((c, i) => (
             <div key={i} className="py-3 flex items-center justify-between">
                <div>
                   <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{c.name}</p>
                   <p className="text-sm font-mono text-slate-500 mt-1">{c.code}</p>
                </div>
                <Badge variant="outline" className="whitespace-nowrap shrink-0">{c.dur}</Badge>
             </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
