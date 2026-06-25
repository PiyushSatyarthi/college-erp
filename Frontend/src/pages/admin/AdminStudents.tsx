import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Download, Plus, Search, Filter, Edit2, Trash2, Ban } from 'lucide-react';

const initialStudents = [
  { id: 1, roll: '2024CS001', name: 'Rahul Sharma', email: 'rahul@college.edu', phone: '9876543210', course: 'Computer Eng', div: 'A', sem: '5', att: 74, status: 'Active' },
  { id: 2, roll: '2024CS002', name: 'Priya Patel', email: 'priya@college.edu', phone: '9876543211', course: 'Computer Eng', div: 'A', sem: '5', att: 92, status: 'Active' },
  { id: 3, roll: '2024CS003', name: 'Amit Kumar', email: 'amit@college.edu', phone: '9876543212', course: 'Computer Eng', div: 'B', sem: '5', att: 58, status: 'Detained' },
  { id: 4, roll: '2024ME001', name: 'Sneha Desai', email: 'sneha@college.edu', phone: '9876543213', course: 'Mechanical', div: 'A', sem: '3', att: 88, status: 'Active' },
  { id: 5, roll: '2024CV001', name: 'Vikram Singh', email: 'vikram@college.edu', phone: '9876543214', course: 'Civil', div: 'A', sem: '7', att: 65, status: 'Active' },
];

export function AdminStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [actionStudent, setActionStudent] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [div, setDiv] = useState('');
  const [roll, setRoll] = useState('');
  const [sem, setSem] = useState('');

  const [filterCourse, setFilterCourse] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const openAddDialog = () => {
    setEditingStudent(null);
    setName(''); setEmail(''); setPhone(''); setCourse(''); setDiv(''); setRoll(''); setSem('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (student: any) => {
    setEditingStudent(student);
    setName(student.name); setEmail(student.email); setPhone(student.phone); 
    setCourse(student.course); setDiv(student.div); setRoll(student.roll); setSem(student.sem);
    setIsDialogOpen(true);
  };

  const openDeactivateAlert = (student: any) => {
    setActionStudent(student);
    setIsDeactivateAlertOpen(true);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = filterCourse ? s.course === filterCourse : true;
    const matchesSem = filterSem ? s.sem === filterSem : true;
    const matchesStatus = filterStatus ? s.status === filterStatus : true;
    return matchesSearch && matchesCourse && matchesSem && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{students.length} students enrolled</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Import CSV</Button>
          <Button  onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
        </div>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={editingStudent ? "Edit Student" : "Add Student"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button  onClick={() => setIsDialogOpen(false)}>
                {editingStudent ? 'Save Changes' : 'Create Student & Send Email'}
              </Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                 <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email {!editingStudent && <span className="text-red-500">*</span>}</label>
                 <input type="email" value={email} disabled={!!editingStudent} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" placeholder="john@example.com" />
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                 <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="9876543210" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Roll Number <span className="text-red-500">*</span></label>
                 <input type="text" value={roll} onChange={(e) => setRoll(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="2024CS001" />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course <span className="text-red-500">*</span></label>
                 <select value={course} disabled={!!editingStudent} onChange={(e) => setCourse(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                    <option value="">Select...</option>
                    <option value="Computer Eng">Computer Eng</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Division <span className="text-red-500">*</span></label>
                 <select value={div} onChange={(e) => setDiv(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester <span className="text-red-500">*</span></label>
                 <input type="number" value={sem} onChange={(e) => setSem(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="1" />
              </div>
           </div>
        </div>
      </Dialog>

      <AlertDialog
         isOpen={isDeactivateAlertOpen}
         onClose={() => setIsDeactivateAlertOpen(false)}
         onConfirm={() => setIsDeactivateAlertOpen(false)}
         title={`Deactivate ${actionStudent?.name}?`}
         description="They will no longer be able to login to the system. Are you sure?"
         confirmText="Deactivate"
         isDestructive={true}
      />

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or roll no..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400 mr-1" />
            <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
              <option value="">All Courses</option>
              {Array.from(new Set(students.map(s => s.course))).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
              <option value="">All Semesters</option>
              {Array.from(new Set(students.map(s => s.sem))).map(s => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 outline-none">
              <option value="">All Statuses</option>
              {Array.from(new Set(students.map(s => s.status))).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="px-4 py-3 font-medium text-slate-500">Student Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Roll Number</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Course</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Div / Sem</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Attendance %</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold dark:bg-slate-800 dark:text-blue-400">
                           {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{student.roll}</td>
                    <td className="px-4 py-3">{student.course}</td>
                    <td className="px-4 py-3">{student.div} / Sem {student.sem}</td>
                    <td className="px-4 py-3">
                      <Badge variant={student.att >= 75 ? "success" : student.att >= 65 ? "warning" : "danger"}>
                        {student.att}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.status === 'Active' ? 'default' : 'danger'}>{student.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => openEditDialog(student)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Student"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => openDeactivateAlert(student)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Deactivate"><Ban className="w-4 h-4" /></button>
                         {/* Hard Delete is not accessible here, only on detail page */}
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                       No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm text-slate-500">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" disabled>Previous</Button>
               <Button variant="outline" size="sm" disabled={filteredStudents.length < 5}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
