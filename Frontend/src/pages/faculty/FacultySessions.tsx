import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, MoreVertical, Edit2, XCircle } from 'lucide-react';

import { Link } from 'react-router-dom';

const initialSessions = [
  { id: 1, date: '13 Jan 2025', sub: 'CS301 — Data Structures', div: 'Div A', time: '09:00 AM - 10:00 AM', room: '204', att: '42/60', status: 'Completed', type: 'Regular' },
  { id: 2, date: '13 Jan 2025', sub: 'CS302 — Algorithms', div: 'Div B', time: '11:00 AM - 12:00 PM', room: '205', att: '0/62', status: 'Upcoming', type: 'Regular' },
  { id: 3, date: '14 Jan 2025', sub: 'CS301 — Data Structures', div: 'Div A', time: '10:00 AM - 12:00 PM', room: 'Lab 1', att: '0/60', status: 'Upcoming', type: 'Lab' },
  { id: 4, date: '12 Jan 2025', sub: 'CS305 — Operating Systems', div: 'Div A', time: '02:00 PM - 03:00 PM', room: '101', att: '55/60', status: 'Completed', type: 'Regular' },
];

export function FacultySessions() {
  const [sessions, setSessions] = useState(initialSessions);
  const [search, setSearch] = useState('');
  const [filterStat, setFilterStat] = useState('Any Status');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [actionSession, setActionSession] = useState<any>(null);

  // Form states
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('');
  const [sub, setSub] = useState('');
  const [div, setDiv] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  const openAddDialog = () => {
     setActionSession(null);
     setRoom(''); setDate(''); setSub(''); setDiv(''); setStartTime(''); setEndTime(''); setReason('');
     setIsDialogOpen(true);
  };

  const openEditDialog = (s: any) => {
     setActionSession(s);
     setRoom(s.room); 
     const timeParts = s.time.split(' - ');
     setStartTime(timeParts[0] || '');
     setEndTime(timeParts[1] || '');
     setSub(s.sub);
     setDiv(s.div);
     setDate(s.date);
     setIsDialogOpen(true);
  };

  const openCancelAlert = (s: any) => {
     setActionSession(s);
     setReason('');
     setIsCancelAlertOpen(true);
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.sub.toLowerCase().includes(search.toLowerCase()) || s.room.toLowerCase().includes(search.toLowerCase());
    const matchesStat = filterStat === 'Any Status' || s.status === filterStat;
    return matchesSearch && matchesStat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">All Sessions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and view your scheduled classes</p>
        </div>
        <Button  onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Create Ad-hoc Session</Button>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={actionSession ? "Edit Session" : "Create Ad-hoc Session"}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button  onClick={() => setIsDialogOpen(false)}>Save</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject {!actionSession && <span className="text-red-500">*</span>}</label>
              <select value={sub} disabled={!!actionSession} onChange={(e) => setSub(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                 <option value="">Select subject...</option>
                 <option value="CS301 — Data Structures">CS301 — Data Structures</option>
                 <option value="CS302 — Algorithms">CS302 — Algorithms</option>
              </select>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Division {!actionSession && <span className="text-red-500">*</span>}</label>
                 <select value={div} disabled={!!actionSession} onChange={(e) => setDiv(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                    <option value="">Select...</option>
                    <option value="Div A">Div A</option>
                    <option value="Div B">Div B</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Room</label>
                 <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 204" />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date {!actionSession && <span className="text-red-500">*</span>}</label>
                 <input type="date" disabled={!!actionSession} value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start <span className="text-red-500">*</span></label>
                 <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End <span className="text-red-500">*</span></label>
                 <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
           </div>

           {!actionSession && (
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason <span className="text-red-500">*</span></label>
                 <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Reason for extra session..." />
              </div>
           )}
        </div>
      </Dialog>

      <Dialog 
        isOpen={isCancelAlertOpen} 
        onClose={() => setIsCancelAlertOpen(false)} 
        title={`Cancel ${actionSession?.sub}?`}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsCancelAlertOpen(false)}>Back</Button>
              <Button  className="bg-red-600 hover:bg-red-700 text-white" disabled={!reason} onClick={() => setIsCancelAlertOpen(false)}>Confirm Cancel</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <p className="text-sm text-slate-600 dark:text-slate-400">This will mark the session as cancelled and notify students.</p>
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason for Cancellation <span className="text-red-500">*</span></label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Faculty on leave" />
           </div>
        </div>
      </Dialog>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search subjects or rooms..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
         </div>
         <select value={filterStat} onChange={e => setFilterStat(e.target.value)} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
           <option>Any Status</option>
           <option>Completed</option>
           <option>Upcoming</option>
           <option>Cancelled</option>
         </select>
         <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
           <option>Any Subject</option>
           <option>CS301</option>
           <option>CS302</option>
         </select>
         <input type="date" className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none"/>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {filteredSessions.map((s, i) => (
           <Card key={i} className={`overflow-hidden ${s.status === 'Ongoing' ? 'border-amber-400 border-2' : ''} ${s.status === 'Cancelled' ? 'opacity-60' : ''}`}>
             <div className="flex flex-col sm:flex-row">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col justify-center items-center shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 w-full sm:w-48">
                   <p className={`text-xl font-bold ${s.status === 'Cancelled' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>{s.date.split(' ')[0]}</p>
                   <p className="text-slate-500 text-sm font-medium">{s.date.split(' ')[1]} {s.date.split(' ')[2]}</p>
                   <Badge variant={s.status === 'Completed' ? 'success' : s.status === 'Upcoming' ? 'default' : s.status === 'Cancelled' ? 'danger' : 'warning'} className="mt-3">
                     {s.status}
                   </Badge>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                   <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase">{s.type}</Badge>
                          <span className="font-medium text-slate-500">{s.div}</span>
                        </div>
                        <h3 className={`text-lg font-bold ${s.status === 'Cancelled' ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{s.sub}</h3>
                      </div>
                      {s.status === 'Upcoming' && (
                         <div className="flex gap-2">
                           <button onClick={() => openEditDialog(s)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                           <button onClick={() => openCancelAlert(s)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><XCircle className="w-4 h-4" /></button>
                         </div>
                      )}
                   </div>
                   
                   <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" /> <span className="font-mono">{s.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" /> <span>{s.room}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" /> <span>{s.att} marked</span>
                      </div>
                   </div>
                </div>
                
                <div className="p-6 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
                   {s.status === 'Completed' ? (
                     <Link to={`/faculty/sessions/${s.id}`}>
                       <Button variant="outline" className="w-full whitespace-nowrap">View Attendance</Button>
                     </Link>
                   ) : s.status === 'Cancelled' ? (
                     <Button variant="outline" disabled className="w-full whitespace-nowrap">Cancelled</Button>
                   ) : (
                     <Link to={`/faculty/sessions/${s.id}`}>
                       <Button  className="w-full whitespace-nowrap lg:px-8">Start Session</Button>
                     </Link>
                   )}
                </div>
             </div>
           </Card>
         ))}
      </div>
    </div>
  );
}
