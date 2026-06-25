import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const initialCourses = [
  { id: 1, name: 'Bachelor of Technology in Computer Engineering', code: 'BTECH-COMP', dept: 'COMP', dur: '4', sem: '8', students: 480 },
  { id: 2, name: 'Bachelor of Technology in Mechanical', code: 'BTECH-MECH', dept: 'MECH', dur: '4', sem: '8', students: 320 },
  { id: 3, name: 'Master of Technology in Data Science', code: 'MTECH-DS', dept: 'COMP', dur: '2', sem: '4', students: 60 },
];

export function AdminCourses() {
  const [courses, setCourses] = useState(initialCourses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingCourse, setDeletingCourse] = useState<any>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [dept, setDept] = useState('');
  const [dur, setDur] = useState('');
  const [sem, setSem] = useState('');

  const openAddDialog = () => {
     setEditingCourse(null);
     setName('');
     setCode('');
     setDept('');
     setDur('');
     setSem('');
     setIsDialogOpen(true);
  };

  const openEditDialog = (course: any) => {
     setEditingCourse(course);
     setName(course.name);
     setCode(course.code);
     setDept(course.dept);
     setDur(course.dur);
     setSem(course.sem);
     setIsDialogOpen(true);
  };

  const openDeleteDialog = (course: any) => {
     setDeletingCourse(course);
     setIsAlertOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Courses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage academic programs</p>
        </div>
        <Button  onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Course</Button>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={editingCourse ? "Edit Course" : "Add Course"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button  onClick={() => setIsDialogOpen(false)}>Save</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. B.Tech in Computer Engineering" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Code <span className="text-red-500">*</span></label>
                 <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. BTECH-COMP" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department <span className="text-red-500">*</span></label>
                 <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="COMP">COMP</option>
                    <option value="MECH">MECH</option>
                 </select>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Duration (Years) <span className="text-red-500">*</span></label>
                 <input type="number" value={dur} onChange={(e) => setDur(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="4" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Semesters <span className="text-red-500">*</span></label>
                 <input type="number" value={sem} onChange={(e) => setSem(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="8" />
              </div>
           </div>
        </div>
      </Dialog>

      <AlertDialog
         isOpen={isAlertOpen}
         onClose={() => setIsAlertOpen(false)}
         onConfirm={() => setIsAlertOpen(false)}
         title={`Delete ${deletingCourse?.name}?`}
         description="This will remove all subjects linked to this course. Are you sure? This cannot be undone."
         confirmText="Delete"
         isDestructive={true}
      />

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none hidden sm:block">
            <option>All Departments</option>
            <option>Computer Eng</option>
          </select>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Course Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Code</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Department</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Duration</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Active Students</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{c.code}</td>
                    <td className="px-4 py-3">{c.dept}</td>
                    <td className="px-4 py-3">{c.dur} Years</td>
                    <td className="px-4 py-3 text-center">{c.students}</td>
                    <td className="px-4 py-3 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => openEditDialog(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => openDeleteDialog(c)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
