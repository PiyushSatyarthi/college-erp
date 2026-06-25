import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { FileText, Plus, Paperclip, CheckCircle, Upload } from 'lucide-react';

export function StudentCondonation() {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedSubj, setSelectedSubj] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Condonation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Apply for attendance shortfall condonation</p>
        </div>
        <Button  onClick={() => setIsApplyOpen(true)}><Plus className="mr-2 h-4 w-4" /> Apply for Condonation</Button>
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
                 <option value="CS302">Operating Systems — 68% (Needs condonation)</option>
                 <option value="CS304">Database Systems — 71% (Needs condonation)</option>
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

      <Card>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                 <tr>
                   <th className="px-4 py-3 font-medium text-slate-500">Subject</th>
                   <th className="px-4 py-3 font-medium text-slate-500">Applied Date</th>
                   <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                   <th className="px-4 py-3 font-medium text-slate-500">HOD Note</th>
                   <th className="px-4 py-3 font-medium text-slate-500">Document</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-950">
                  <tr>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">Operating Systems</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Applied</span>
                        </div>
                        <div className="w-4 border-t-2 border-slate-200 dark:border-slate-700"></div>
                        <div className="flex items-center opacity-50">
                          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 mr-1" />
                          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Review</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">12 Jan 2025</td>
                    <td className="px-4 py-4"><Badge variant="warning">Pending</Badge></td>
                    <td className="px-4 py-4 text-slate-500 italic">—</td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 px-2 h-8">
                        <Paperclip className="h-4 w-4 mr-2" /> Medical_Cert.pdf
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">Computer Networks</p>
                    </td>
                    <td className="px-4 py-4">05 Nov 2024</td>
                    <td className="px-4 py-4"><Badge variant="success">Approved</Badge></td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">Valid medical reason. Ensure attendance improves.</td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 px-2 h-8">
                        <Paperclip className="h-4 w-4 mr-2" /> Note.pdf
                      </Button>
                    </td>
                  </tr>
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>

    </div>
  );
}
