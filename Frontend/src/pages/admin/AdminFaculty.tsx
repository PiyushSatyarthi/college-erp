import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Plus, Search, Filter, Edit2, Ban } from 'lucide-react';

const initialFaculty = [
  { id: 1, name: 'Dr. Suresh Patil', email: 'suresh@college.edu', phone: '9876543210', dept: 'Computer Eng', subjects: 3, sessions: 12, att: 78, status: 'Active' },
  { id: 2, name: 'Prof. Amit Kumar', email: 'amit@college.edu', phone: '9876543211', dept: 'Mechanical', subjects: 2, sessions: 8, att: 65, status: 'Active' },
  { id: 3, name: 'Dr. Ramesh Singh', email: 'ramesh@college.edu', phone: '9876543212', dept: 'Civil', subjects: 4, sessions: 16, att: 82, status: 'Active' },
  { id: 4, name: 'Dr. Anita Desai', email: 'anita@college.edu', phone: '9876543213', dept: 'Electronics', subjects: 2, sessions: 10, att: 88, status: 'On Leave' },
];

export function AdminFaculty() {
  const [faculty, setFaculty] = useState(initialFaculty);
  const [search, setSearch] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [actionFaculty, setActionFaculty] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');

  const openAddDialog = () => {
    setEditingFaculty(null);
    setName(''); setEmail(''); setPhone(''); setDept('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (fac: any) => {
    setEditingFaculty(fac);
    setName(fac.name); setEmail(fac.email || ''); setPhone(fac.phone || ''); setDept(fac.dept);
    setIsDialogOpen(true);
  };

  const openDeactivateAlert = (fac: any) => {
    setActionFaculty(fac);
    setIsDeactivateAlertOpen(true);
  };

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Faculty</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage teaching staff across departments</p>
        </div>
        <Button  onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Faculty</Button>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={editingFaculty ? "Edit Faculty" : "Add Faculty"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button  onClick={() => setIsDialogOpen(false)}>
                {editingFaculty ? 'Save Changes' : 'Create Faculty & Send Email'}
              </Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                 <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dr. John Doe" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email {!editingFaculty && <span className="text-red-500">*</span>}</label>
                 <input type="email" value={email} disabled={!!editingFaculty} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" placeholder="john@college.edu" />
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                 <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="9876543210" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department <span className="text-red-500">*</span></label>
                 <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    <option value="Computer Eng">Computer Eng</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electronics">Electronics</option>
                 </select>
              </div>
           </div>
        </div>
      </Dialog>

      <AlertDialog
         isOpen={isDeactivateAlertOpen}
         onClose={() => setIsDeactivateAlertOpen(false)}
         onConfirm={() => setIsDeactivateAlertOpen(false)}
         title={`Deactivate ${actionFaculty?.name}?`}
         description="They will no longer be able to login. Are you sure?"
         confirmText="Deactivate"
         isDestructive={true}
      />

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search faculty name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Department</Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500">Faculty Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Department</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Subjects</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Sessions / Mo</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Avg Attendance</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredFaculty.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs dark:bg-slate-800 dark:text-slate-300">
                           {fac.name.split(' ').pop()?.[0]}
                        </div>
                        {fac.name}
                      </div>
                    </td>
                    <td className="px-4 py-4">{fac.dept}</td>
                    <td className="px-4 py-4 text-center font-mono">{fac.subjects}</td>
                    <td className="px-4 py-4 text-center font-mono">{fac.sessions}</td>
                    <td className="px-4 py-4 text-center">
                       <Badge variant={fac.att >= 75 ? "success" : "warning"}>{fac.att}%</Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={fac.status === 'Active' ? 'default' : 'warning'}>{fac.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => openEditDialog(fac)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Profile"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => openDeactivateAlert(fac)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Deactivate"><Ban className="w-4 h-4" /></button>
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
