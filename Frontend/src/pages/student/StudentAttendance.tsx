import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { ArrowLeft, Clock, History, FileText, Upload, Plus } from 'lucide-react';

export function StudentAttendance() {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedSubj, setSelectedSubj] = useState('');
  const [reason, setReason] = useState('');

  const subjects = [
    { sub: 'Computer Networks', code: 'CS301', att: 75, p: 30, a: 10, target: 'On track' },
    { sub: 'Operating Systems', code: 'CS302', att: 68, p: 27, a: 13, target: 'Need 6 classes' },
    { sub: 'Data Structures', code: 'CS303', att: 82, p: 33, a: 7, target: 'On track' },
    { sub: 'Database Systems', code: 'CS304', att: 71, p: 28, a: 12, target: 'Need 3 classes' },
  ];

  const lowAttSubjects = subjects.filter(s => s.att < 75);

  const openApp = (sub: string) => {
     setSelectedSubj(sub);
     setReason('');
     setIsApplyOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Semester 5 Overview</p>
      </div>

      <Dialog 
        isOpen={isApplyOpen} 
        onClose={() => setIsApplyOpen(false)} 
        title={`Apply for Condonation`}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
              <Button  disabled={reason.length < 50 || !selectedSubj} onClick={() => setIsApplyOpen(false)}>Submit Application</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject <span className="text-red-500">*</span></label>
              <select value={selectedSubj} onChange={(e) => setSelectedSubj(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                 <option value="">Select subject...</option>
                 {lowAttSubjects.map(s => (
                    <option key={s.code} value={s.code}>{s.sub} — {s.att}% (Needs condonation)</option>
                 ))}
              </select>
           </div>
           
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Detailed Reason <span className="text-red-500">*</span></label>
              <textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" 
                placeholder="Explain the reason for low attendance..." 
              />
              <p className={`text-xs text-right mt-1 ${reason.length < 50 ? 'text-red-500' : 'text-slate-500'}`}>
                 {reason.length} / 50 min characters
              </p>
           </div>

           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Supporting Document (Optional)</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                 <Upload className="w-6 h-6 text-slate-400 mb-2" />
                 <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload document</p>
                 <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>
           </div>

           {selectedSubj && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 p-3 rounded-lg flex items-center justify-between">
                 <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Projected impact:</span>
                 <span className="text-sm font-bold text-blue-700 dark:text-blue-400">With condonation: 76% → Eligible</span>
              </div>
           )}
        </div>
      </Dialog>

      <Card className="bg-blue-600 text-white border-none shadow-md">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20">
                 <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-white" strokeDasharray="289" strokeDashoffset="75" />
                 </svg>
                 <span className="text-2xl font-bold">74%</span>
              </div>
              <div>
                 <h2 className="text-xl font-bold">Overall Attendance</h2>
                 <p className="opacity-90 mt-1">142 present / 200 total sessions</p>
              </div>
           </div>
           <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">48</p>
                <p className="text-xs opacity-90">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">10</p>
                <p className="text-xs opacity-90">Late</p>
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((s, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{s.sub}</CardTitle>
                  <p className="font-mono text-xs text-slate-500 mt-1">{s.code}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge variant={s.att >= 75 ? "success" : s.att >= 65 ? "warning" : "danger"}>
                     {s.att}%
                   </Badge>
                   {s.att < 75 && (
                      <Button onClick={() => openApp(s.code)} variant="ghost" size="sm" className="h-6 text-xs text-blue-600 dark:text-blue-400 font-medium px-2 py-0 border border-blue-200 dark:border-blue-800">
                         Apply Condonation
                      </Button>
                   )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 mt-2">
                <div className="h-full bg-blue-600 rounded-full" style={{width: `${s.att}%`}}></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-slate-500">
                  <span className="text-slate-900 dark:text-white font-medium">{s.p}</span> Present / <span className="text-slate-900 dark:text-white font-medium">{s.a}</span> Absent
                </p>
                <p className={`font-medium ${s.att >= 75 ? 'text-green-600' : 'text-blue-600'}`}>{s.target}</p>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-slate-500">
                <History className="mr-2 h-4 w-4" /> View Session History
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
