import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XCircle, ArrowRight } from 'lucide-react';

export function StudentHallTicket() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hall Ticket</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Examination eligibility and admission card</p>
      </div>

      <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 shadow-none">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center shrink-0 dark:bg-red-900/30">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-1">You are NOT eligible to download your Hall Ticket</h2>
            <p className="text-red-700 dark:text-red-300">You are ineligible for exams due to attendance shortfalls in the following subjects:</p>
            
            <div className="mt-4 bg-white dark:bg-black/20 rounded-lg overflow-hidden border border-red-100 dark:border-red-900/30">
              <table className="w-full text-sm text-left">
                <thead className="bg-red-50/50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-b border-red-100 dark:border-red-900/30">
                   <tr>
                     <th className="px-4 py-2 font-medium">Subject</th>
                     <th className="px-4 py-2 font-medium">Attendance %</th>
                     <th className="px-4 py-2 font-medium">Shortfall</th>
                   </tr>
                </thead>
                <tbody className="text-slate-900 dark:text-slate-100">
                   <tr>
                     <td className="px-4 py-2 font-medium">Operating Systems</td>
                     <td className="px-4 py-2 font-mono text-center md:text-left text-red-600">68%</td>
                     <td className="px-4 py-2 text-center md:text-left">-7%</td>
                   </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-center md:justify-start items-center gap-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Apply for condonation to resolve ineligibility.</p>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="opacity-50 pointer-events-none filter grayscale">
         <Card className="border-t-8 border-t-blue-600">
           <CardContent className="p-8 pb-16 flex flex-col items-center justify-center min-h-[400px]">
             <p className="text-lg font-bold mb-2">Shri Vivekanand College of Engineering</p>
             <p className="text-sm text-slate-500 uppercase tracking-widest mb-8">Examination Hall Ticket</p>
             <p className="text-slate-500 text-center max-w-sm">Complete your condonation process to view and download your valid hall ticket.</p>
           </CardContent>
         </Card>
      </div>

    </div>
  );
}
