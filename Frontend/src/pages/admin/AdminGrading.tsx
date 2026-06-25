import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';

export function AdminGrading() {
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Grading Schemes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure absolute and relative grading policies</p>
        </div>
        <Button  onClick={() => setIsSchemaOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Schema</Button>
      </div>

      <Dialog 
        isOpen={isSchemaOpen} 
        onClose={() => setIsSchemaOpen(false)} 
        title="Create Grading Schema"
        footer={
           <>
              <Button variant="outline" onClick={() => setIsSchemaOpen(false)}>Cancel</Button>
              <Button  onClick={() => setIsSchemaOpen(false)}>Save Schema</Button>
           </>
        }
      >
        <div className="space-y-4 py-2">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Schema Name <span className="text-red-500">*</span></label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. PG Arts (Absolute)" />
           </div>
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type <span className="text-red-500">*</span></label>
              <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                 <option value="absolute">Absolute (Fixed percentages)</option>
                 <option value="relative">Relative (Curved based on mean)</option>
              </select>
           </div>
           <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mt-4 text-sm text-slate-500 text-center">
              You will be able to define the grade ranges after creating the schema.
           </div>
        </div>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-blue-500">
           <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                 <CardTitle className="mb-2">UG Engineering (Absolute)</CardTitle>
                 <Badge variant="success">Active Default</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsSchemaOpen(true)}>Edit</Button>
           </CardHeader>
           <CardContent className="p-0">
             <table className="w-full text-sm text-center">
                 <thead className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                    <tr>
                       <th className="py-2 px-4 font-medium">Grade</th>
                       <th className="py-2 px-4 font-medium">Range (%)</th>
                       <th className="py-2 px-4 font-medium">Points</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    <tr><td className="py-2 px-4 font-bold text-blue-700 dark:text-blue-400">O</td><td className="py-2 px-4">80 - 100</td><td className="py-2 px-4">10</td></tr>
                    <tr><td className="py-2 px-4 font-bold text-slate-700 dark:text-slate-300">A+</td><td className="py-2 px-4">75 - 79.9</td><td className="py-2 px-4">9</td></tr>
                    <tr><td className="py-2 px-4 font-bold text-slate-700 dark:text-slate-300">A</td><td className="py-2 px-4">70 - 74.9</td><td className="py-2 px-4">8</td></tr>
                    <tr><td className="py-2 px-4 font-bold text-blue-600 dark:text-blue-400">B+</td><td className="py-2 px-4">60 - 69.9</td><td className="py-2 px-4">7</td></tr>
                    <tr><td className="py-2 px-4 font-bold text-blue-600 dark:text-blue-400">B</td><td className="py-2 px-4">55 - 59.9</td><td className="py-2 px-4">6</td></tr>
                    <tr><td className="py-2 px-4 font-bold text-blue-600 dark:text-blue-400">C</td><td className="py-2 px-4">50 - 54.9</td><td className="py-2 px-4">5</td></tr>
                    <tr><td className="py-2 px-4 font-bold text-slate-500">P</td><td className="py-2 px-4">40 - 49.9</td><td className="py-2 px-4">4</td></tr>
                    <tr><td className="py-2 px-4 font-bold text-red-600">F</td><td className="py-2 px-4">&lt; 40</td><td className="py-2 px-4">0</td></tr>
                 </tbody>
             </table>
           </CardContent>
        </Card>

        <Card>
           <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                 <CardTitle className="mb-2">PG Sciences (Relative)</CardTitle>
                 <Badge variant="outline">Secondary</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsSchemaOpen(true)}>Edit</Button>
           </CardHeader>
           <CardContent>
              <p className="text-sm text-slate-500 italic text-center py-10">Relative grading curve configuration based on class average ± standard deviation.</p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
