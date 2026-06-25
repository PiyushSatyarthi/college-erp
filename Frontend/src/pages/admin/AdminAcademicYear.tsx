import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Check, Edit2, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';

export function AdminAcademicYear() {
  const [academicYear, setAcademicYear] = useState({
    name: '2024-25',
    startDate: '2024-08-01',
    endDate: '2025-05-31',
  });

  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  const [holidays, setHolidays] = useState([
     { id: 1, name: 'Independence Day', date: '2024-08-15' },
     { id: 2, name: 'Ganesh Chaturthi', date: '2024-09-07' },
     { id: 3, name: 'Diwali', date: '2024-10-31' },
  ]);

  const [examBlocks, setExamBlocks] = useState([
     { id: 1, name: 'Mid Sem Exams', start: '2024-10-10', end: '2024-10-18' },
     { id: 2, name: 'End Sem Exams', start: '2024-12-05', end: '2024-12-20' },
  ]);

  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [isAyDialogOpen, setIsAyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [actionItem, setActionItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'holiday' | 'examblock', id: number} | null>(null);
  
  // Academic Year Form
  const [ayName, setAyName] = useState('');
  const [ayStart, setAyStart] = useState('');
  const [ayEnd, setAyEnd] = useState('');

  // Holiday Form
  const [hName, setHName] = useState('');
  const [hDate, setHDate] = useState('');

  // Exam Block Form
  const [eName, setEName] = useState('');
  const [eStart, setEStart] = useState('');
  const [eEnd, setEEnd] = useState('');

  const toggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const openAyDialog = (isEdit: boolean = false) => {
    if (isEdit) {
      setAyName(academicYear.name);
      setAyStart(academicYear.startDate);
      setAyEnd(academicYear.endDate);
    } else {
      setAyName('');
      setAyStart('');
      setAyEnd('');
    }
    setIsAyDialogOpen(true);
  };

  const saveAy = () => {
    if (ayName && ayStart && ayEnd) {
      setAcademicYear({
        name: ayName,
        startDate: ayStart,
        endDate: ayEnd,
      });
      setIsAyDialogOpen(false);
    }
  };

  const openHolidayDialog = (holiday?: any) => {
     if (holiday) {
        setActionItem(holiday);
        setHName(holiday.name);
        setHDate(holiday.date);
     } else {
        setActionItem(null);
        setHName('');
        setHDate('');
     }
     setIsHolidayDialogOpen(true);
  };

  const saveHoliday = () => {
    if (hName && hDate) {
      if (actionItem) {
        setHolidays(holidays.map(h => h.id === actionItem.id ? { ...h, name: hName, date: hDate } : h));
      } else {
        setHolidays([...holidays, { id: Date.now(), name: hName, date: hDate }]);
      }
      setIsHolidayDialogOpen(false);
    }
  };

  const openExamDialog = (examBlock?: any) => {
     if (examBlock) {
        setActionItem(examBlock);
        setEName(examBlock.name);
        setEStart(examBlock.start);
        setEEnd(examBlock.end);
     } else {
        setActionItem(null);
        setEName('');
        setEStart('');
        setEEnd('');
     }
     setIsExamDialogOpen(true);
  };

  const saveExamBlock = () => {
    if (eName && eStart && eEnd) {
      if (actionItem) {
        setExamBlocks(examBlocks.map(e => e.id === actionItem.id ? { ...e, name: eName, start: eStart, end: eEnd } : e));
      } else {
        setExamBlocks([...examBlocks, { id: Date.now(), name: eName, start: eStart, end: eEnd }]);
      }
      setIsExamDialogOpen(false);
    }
  };

  const confirmDelete = (type: 'holiday' | 'examblock', id: number) => {
    setDeleteTarget({ type, id });
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'holiday') {
        setHolidays(holidays.filter(h => h.id !== deleteTarget.id));
      } else {
        setExamBlocks(examBlocks.filter(e => e.id !== deleteTarget.id));
      }
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Year</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure terms, holidays, and working days</p>
        </div>
        <Button onClick={() => openAyDialog()}><Plus className="mr-2 h-4 w-4" /> New Academic Year</Button>
      </div>

      <AlertDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={executeDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Dialog 
        isOpen={isAyDialogOpen} 
        onClose={() => setIsAyDialogOpen(false)} 
        title={ayName && ayName === academicYear.name ? "Edit Academic Year" : "New Academic Year"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsAyDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveAy}>Save</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name <span className="text-red-500">*</span></label>
              <input type="text" value={ayName} onChange={(e) => setAyName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 2024-25" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date <span className="text-red-500">*</span></label>
                 <input type="date" value={ayStart} onChange={(e) => setAyStart(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date <span className="text-red-500">*</span></label>
                 <input type="date" value={ayEnd} onChange={(e) => setAyEnd(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
           </div>
        </div>
      </Dialog>

      <Dialog 
        isOpen={isHolidayDialogOpen} 
        onClose={() => setIsHolidayDialogOpen(false)} 
        title={actionItem ? "Edit Holiday" : "Add Holiday"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsHolidayDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveHoliday}>Save</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Holiday Name <span className="text-red-500">*</span></label>
              <input type="text" value={hName} onChange={(e) => setHName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Diwali" />
           </div>
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date <span className="text-red-500">*</span></label>
              <input type="date" value={hDate} onChange={(e) => setHDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
        </div>
      </Dialog>

      <Dialog 
        isOpen={isExamDialogOpen} 
        onClose={() => setIsExamDialogOpen(false)} 
        title={actionItem ? "Edit Exam Block" : "Add Exam Block"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsExamDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveExamBlock}>Save</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Exam Block Name <span className="text-red-500">*</span></label>
              <input type="text" value={eName} onChange={(e) => setEName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Mid Sem Exams" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date <span className="text-red-500">*</span></label>
                 <input type="date" value={eStart} onChange={(e) => setEStart(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date <span className="text-red-500">*</span></label>
                 <input type="date" value={eEnd} onChange={(e) => setEEnd(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
           </div>
        </div>
      </Dialog>

      <Card className="border-t-4 border-t-blue-600">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
             <div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{academicYear.name} (Active)</h2>
               <p className="text-sm text-slate-500 flex gap-4">
                 <span>Start: {academicYear.startDate}</span>
                 <span>End: {academicYear.endDate}</span>
               </p>
             </div>
             <Button variant="outline" size="sm" onClick={() => openAyDialog(true)}>Edit Date</Button>
          </div>

          <div className="mt-8 mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Working Days</h3>
            <div className="flex gap-2 flex-wrap">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => {
                 const isSelected = workingDays.includes(d);
                 return (
                   <div 
                     key={d} 
                     onClick={() => toggleWorkingDay(d)}
                     className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer select-none transition-colors ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/50 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                   >
                     {d} {isSelected && <Check className="inline w-3 h-3 ml-1"/>}
                   </div>
                 );
               })}
            </div>
            <p className="text-xs text-slate-500 mt-2">Selected days count towards total required attendance. Click to toggle.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Public Holidays</CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={() => openHolidayDialog()}><Plus className="w-4 h-4" /></Button>
           </CardHeader>
           <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   {holidays.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                         <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{h.name}</td>
                         <td className="px-6 py-3 text-slate-500">{h.date}</td>
                         <td className="px-6 py-3 text-right">
                            <span onClick={() => openHolidayDialog(h)} className="text-blue-600 dark:text-blue-400 cursor-pointer text-xs font-medium mr-3 hover:underline">Edit</span>
                            <span onClick={() => confirmDelete('holiday', h.id)} className="text-red-600 dark:text-red-400 cursor-pointer text-xs font-medium hover:underline">Delete</span>
                         </td>
                      </tr>
                   ))}
                   {holidays.length === 0 && (
                     <tr>
                       <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No holidays added yet.</td>
                     </tr>
                   )}
                 </tbody>
              </table>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Exam Blocks</CardTitle>
                <CardDescription>Attendance is suspended</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => openExamDialog()}><Plus className="w-4 h-4" /></Button>
           </CardHeader>
           <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   {examBlocks.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                         <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{h.name}</td>
                         <td className="px-6 py-3 text-slate-500 text-xs text-center">{h.start} <br/> to {h.end}</td>
                         <td className="px-6 py-3 text-right">
                            <span onClick={() => openExamDialog(h)} className="text-blue-600 dark:text-blue-400 cursor-pointer text-xs font-medium mr-3 hover:underline">Edit</span>
                            <span onClick={() => confirmDelete('examblock', h.id)} className="text-red-600 dark:text-red-400 cursor-pointer text-xs font-medium hover:underline">Delete</span>
                         </td>
                      </tr>
                   ))}
                   {examBlocks.length === 0 && (
                     <tr>
                       <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No exam blocks added yet.</td>
                     </tr>
                   )}
                 </tbody>
              </table>
           </CardContent>
         </Card>
      </div>
      <div className="flex justify-end">
         <Button onClick={() => alert('Configuration Saved Successfully!')}>Save Configuration</Button>
      </div>
    </div>
  );
}

