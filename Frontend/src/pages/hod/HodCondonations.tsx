import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Check, X, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function HodCondonations() {
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionReq, setActionReq] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  const [requests, setRequests] = useState([
      { id: 1, name: 'Priya Desai', roll: '2024CS02', subject: 'Operating Systems', attendance: '65%', reason: 'Medical - Dengue', date: '12 Jan 2025', status: 'Pending' },
      { id: 2, name: 'Rahul Sharma', roll: '2024CS01', subject: 'Computer Networks', attendance: '72%', reason: 'Sports - State level table tennis', date: '14 Jan 2025', status: 'Pending' },
      { id: 3, name: 'Amit Patel', roll: '2024CS15', subject: 'Data Structures', attendance: '68%', reason: 'Medical - Surgery', date: '10 Jan 2025', status: 'Approved' },
      { id: 4, name: 'Neha Singh', roll: '2024CS22', subject: 'Algorithms', attendance: '55%', reason: 'Personal Leave', date: '08 Jan 2025', status: 'Rejected' },
  ]);

  const displayedRequests = requests.filter(r => r.status === currentTab);

  const [reviewNote, setReviewNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const openApprove = (req: any) => {
     setActionReq(req);
     setReviewNote('');
     setIsApproveOpen(true);
  };

  const openReject = (req: any) => {
     setActionReq(req);
     setRejectReason('');
     setIsRejectOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Condonation Approvals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review and approve attendance condonation requests</p>
        </div>
      </div>

      <Dialog 
        isOpen={isApproveOpen} 
        onClose={() => setIsApproveOpen(false)} 
        title={`Approve Condonation`}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
              <Button  onClick={() => {
                setRequests(requests.map(r => r.id === actionReq?.id ? { ...r, status: 'Approved' } : r));
                setIsApproveOpen(false);
              }} className="bg-green-600 hover:bg-green-700 text-white">Confirm Approve</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <p className="text-sm text-slate-600 dark:text-slate-400">Approve condonation for <span className="font-semibold">{actionReq?.name}</span> ({actionReq?.subject}).</p>
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Review Note (Optional)</label>
              <textarea 
                value={reviewNote} 
                onChange={(e) => setReviewNote(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" 
                placeholder="Add an optional note..." 
              />
           </div>
        </div>
      </Dialog>

      <Dialog 
        isOpen={isRejectOpen} 
        onClose={() => setIsRejectOpen(false)} 
        title={`Reject Condonation`}
        footer={
           <>
              <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={!rejectReason} onClick={() => {
                setRequests(requests.map(r => r.id === actionReq?.id ? { ...r, status: 'Rejected' } : r));
                setIsRejectOpen(false);
              }}>Confirm Reject</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <p className="text-sm text-slate-600 dark:text-slate-400">Reject condonation for <span className="font-semibold">{actionReq?.name}</span> ({actionReq?.subject}).</p>
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rejection Reason <span className="text-red-500">*</span></label>
              <textarea 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]" 
                placeholder="Explain why this is rejected..." 
              />
           </div>
        </div>
      </Dialog>

      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
         {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <span 
              key={tab} 
              onClick={() => setCurrentTab(tab)}
              className={`font-medium pb-2 px-1 cursor-pointer transition-colors ${currentTab === tab ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {tab} {tab === 'Pending' && `(${requests.filter(r => r.status === 'Pending').length})`}
            </span>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayedRequests.length === 0 ? (
           <div className="py-8 text-center text-slate-500">No {currentTab.toLowerCase()} requests.</div>
        ) : displayedRequests.map((req, i) => (
          <Card key={i}>
             <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                   <div className="flex items-start gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center font-bold text-blue-700 dark:text-blue-400">
                         {req.name[0]}
                      </div>
                      <div>
                         <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">{req.name} <span className="text-sm font-normal text-slate-500 ml-2">({req.roll})</span></h3>
                         <p className="text-sm text-slate-600 dark:text-slate-400">{req.subject} • Current Attendance: <span className="font-semibold text-red-500">{req.attendance}</span></p>
                      </div>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-sm">
                      <p className="font-medium text-slate-700 dark:text-slate-300">Reason: {req.reason}</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-blue-600 dark:text-blue-400 -ml-2 h-7 px-2"><FileText className="w-3 h-3 mr-2" /> View Certificate</Button>
                   </div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                   {currentTab === 'Pending' ? (
                     <>
                       <Button onClick={() => openApprove(req)} variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30">
                          <Check className="w-4 h-4 mr-2" /> Approve
                       </Button>
                       <Button onClick={() => openReject(req)} variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30">
                          <X className="w-4 h-4 mr-2" /> Reject
                       </Button>
                     </>
                   ) : (
                      <Badge variant="outline" className={currentTab === 'Approved' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}>
                         {currentTab}
                      </Badge>
                   )}
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
