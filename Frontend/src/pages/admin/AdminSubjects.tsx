import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const initialSubjects = [
  { id: 1, name: 'Data Structures', code: 'CS301', course: 'BTECH-COMP', sem: '3', type: 'Theory', credits: '4' },
  { id: 2, name: 'Operating Systems', code: 'CS302', course: 'BTECH-COMP', sem: '5', type: 'Theory', credits: '4' },
  { id: 3, name: 'Data Structures Lab', code: 'CS301L', course: 'BTECH-COMP', sem: '3', type: 'Lab', credits: '1.5' },
];

export function AdminSubjects() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [deletingSubject, setDeletingSubject] = useState<any>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [course, setCourse] = useState('');
  const [sem, setSem] = useState('');
  const [type, setType] = useState('');
  const [credits, setCredits] = useState('');

  const openAddDialog = () => {
     setEditingSubject(null);
     setName('');
     setCode('');
     setCourse('');
     setSem('');
     setType('');
     setCredits('');
     setIsDialogOpen(true);
  };

  const openEditDialog = (subj: any) => {
     setEditingSubject(subj);
     setName(subj.name);
     setCode(subj.code);
     setCourse(subj.course);
     setSem(subj.sem);
     setType(subj.type);
     setCredits(subj.credits);
     setIsDialogOpen(true);
  };

  const openDeleteDialog = (subj: any) => {
     setDeletingSubject(subj);
     setIsAlertOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Subjects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage curriculum and subjects</p>
        </div>
        <Button  onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Subject</Button>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={editingSubject ? "Edit Subject" : "Add Subject"}
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Data Structures" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Code <span className="text-red-500">*</span></label>
                 <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. CS301" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course <span className="text-red-500">*</span></label>
                 <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="BTECH-COMP">BTECH-COMP</option>
                    <option value="BTECH-MECH">BTECH-MECH</option>
                 </select>
              </div>
           </div>
           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester <span className="text-red-500">*</span></label>
                 <input type="number" value={sem} onChange={(e) => setSem(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="3" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Credits <span className="text-red-500">*</span></label>
                 <input type="number" value={credits} onChange={(e) => setCredits(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="4" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type <span className="text-red-500">*</span></label>
                 <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Project">Project</option>
                 </select>
              </div>
           </div>
        </div>
      </Dialog>

      <AlertDialog
         isOpen={isAlertOpen}
         onClose={() => setIsAlertOpen(false)}
         onConfirm={() => setIsAlertOpen(false)}
         title={`Delete ${deletingSubject?.name}?`}
         description="This subject can only be deleted if no marks have been entered. Are you sure?"
         confirmText="Delete"
         isDestructive={true}
      />

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50 flex-wrap">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search subjects..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none hidden sm:block">
            <option>All Courses</option>
            <option>BTECH-COMP</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none hidden sm:block">
            <option>All Semesters</option>
            <option>Semester 1</option>
            <option>Semester 5</option>
          </select>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Subject Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Code</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Course</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Sem</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Credits</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{s.code}</td>
                    <td className="px-4 py-3">{s.course}</td>
                    <td className="px-4 py-3 text-center">{s.sem}</td>
                    <td className="px-4 py-3 text-center">
                       <Badge variant="outline">{s.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{s.credits}</td>
                    <td className="px-4 py-3 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => openEditDialog(s)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => openDeleteDialog(s)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
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
