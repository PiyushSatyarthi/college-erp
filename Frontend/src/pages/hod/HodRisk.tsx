import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Brain, AlertTriangle, TrendingDown } from 'lucide-react';

export function HodRiskDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
             <Brain className="w-6 h-6 text-blue-600" /> AI Risk Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Predictive analysis and academic risk warnings for Computer Engineering</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
            <CardContent className="p-6">
               <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-800 dark:text-red-400">High Risk Students</h3>
               </div>
               <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">14 <span className="text-sm font-normal text-slate-500">students</span></p>
               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI predicts these students have a <strong>&gt;80% probability</strong> of failing to meet the minimum 75% attendance criteria by end of semester based on current trajectory.
               </p>
            </CardContent>
         </Card>

         <Card className="border-slate-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
            <CardContent className="p-6">
               <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-400">Subject At Risk</h3>
               </div>
               <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Computer Networks (CS304)</p>
               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Historical data analysis suggests test 2 pass percentages for this subject frequently drop below 60%. Consider organizing remedial sessions early.
               </p>
            </CardContent>
         </Card>
      </div>

      <Card>
         <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-semibold">Anomaly Interventions required</h3>
         </div>
         <CardContent className="p-0">
             <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  <div className="p-4 flex gap-4 items-start">
                     <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                     <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">Proxy Attendance Detected</h4>
                        <p className="text-sm text-slate-500 mt-1">Students 2024CS14 & 2024CS15 marked present simultaneously from the same device in Data Structures Lab.</p>
                     </div>
                  </div>
             </div>
         </CardContent>
      </Card>
    </div>
  );
}
