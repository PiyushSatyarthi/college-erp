import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Plus, Search, Building2, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const initialDepartments = [
  { id: 1, name: 'Computer Engineering', code: 'COMP', hod: 'Dr. Ramesh Kumar', students: 480, faculty: 32, status: 'Active' },
  { id: 2, name: 'Mechanical Engineering', code: 'MECH', hod: 'Dr. Suresh Patil', students: 320, faculty: 24, status: 'Active' },
  { id: 3, name: 'Civil Engineering', code: 'CIVIL', hod: 'Dr. Anita Desai', students: 280, faculty: 20, status: 'Active' },
  { id: 4, name: 'Electronics Engineering', code: 'ELEX', hod: 'Dr. Vivek Singh', students: 350, faculty: 26, status: 'Active' },
];

export function AdminDepartments() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deletingDept, setDeletingDept] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hod, setHod] = useState('');

  const openAddDialog = () => {
     setEditingDept(null);
     setName('');
     setCode('');
     setHod('');
     setIsDialogOpen(true);
  };

  const openEditDialog = (dept: any) => {
     setEditingDept(dept);
     setName(dept.name);
     setCode(dept.code);
     setHod(dept.hod);
     setIsDialogOpen(true);
  };

  const openDeleteDialog = (dept: any) => {
     setDeletingDept(dept);
     setIsAlertOpen(true);
  };

  const handleSave = () => {
     setIsDialogOpen(false);
  };

  const handleDelete = () => {
     setIsAlertOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Departments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage college departments and HOD assignments</p>
        </div>
        <Button  onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={editingDept ? "Edit Department" : "Add Department"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button  onClick={handleSave}>Save</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Computer Engineering" />
           </div>
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Code <span className="text-red-500">*</span></label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. COMP" />
           </div>
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">HOD</label>
              <select value={hod} onChange={(e) => setHod(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                 <option value="">Select Faculty...</option>
                 <option value="Dr. Ramesh Kumar">Dr. Ramesh Kumar</option>
                 <option value="Dr. Suresh Patil">Dr. Suresh Patil</option>
                 <option value="Dr. Anita Desai">Dr. Anita Desai</option>
                 <option value="Dr. Vivek Singh">Dr. Vivek Singh</option>
              </select>
           </div>
        </div>
      </Dialog>

      <AlertDialog
         isOpen={isAlertOpen}
         onClose={() => setIsAlertOpen(false)}
         onConfirm={handleDelete}
         title={`Delete ${deletingDept?.name}?`}
         description="All courses under it will be unlinked. Are you sure? This cannot be undone."
         confirmText="Delete"
         isDestructive={true}
      />

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search departments..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Department Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Code</th>
                  <th className="px-4 py-3 font-medium text-slate-500">HOD Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Students</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Faculty</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center dark:bg-slate-800 dark:text-blue-400">
                           <Building2 className="w-4 h-4" />
                        </div>
                        {dept.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-500">{dept.code}</td>
                    <td className="px-4 py-4">{dept.hod}</td>
                    <td className="px-4 py-4 text-right font-mono">{dept.students}</td>
                    <td className="px-4 py-4 text-right font-mono">{dept.faculty}</td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={dept.status === 'Active' ? 'success' : 'default'}>{dept.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => openEditDialog(dept)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => openDeleteDialog(dept)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
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
