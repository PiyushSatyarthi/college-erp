import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Save, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';

const initialStudents = [
  { roll: '2024CS01', name: 'Rahul Sharma', q1: '9', q2: '8', q3: '10', total: 27, status: 'Saved' },
  { roll: '2024CS02', name: 'Priya Desai', q1: '6', q2: '5', q3: '7', total: 18, status: 'Saved' },
  { roll: '2024CS03', name: 'Amit Patel', q1: '', q2: '', q3: '', total: 0, status: 'Pending' },
];

export function FacultyMarksEntry() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleMarkChange = (index: number, field: 'q1' | 'q2' | 'q3', value: string) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value, status: 'Pending' };

    const q1Score = parseInt(updated[index].q1) || 0;
    const q2Score = parseInt(updated[index].q2) || 0;
    const q3Score = parseInt(updated[index].q3) || 0;
    updated[index].total = q1Score + q2Score + q3Score;
    
    setStudents(updated);
    setIsSaved(false);
  };

  const handleSaveDraft = () => {
    const updated = students.map(s => ({
      ...s,
      status: s.q1 || s.q2 || s.q3 ? 'Saved' as const : 'Pending' as const
    }));
    setStudents(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePublish = () => {
    const updated = students.map(s => ({
      ...s,
      status: 'Published' as const
    }));
    setStudents(updated);
    setIsPublishOpen(false);
  };

  const filteredStudents = students.filter(s => 
     s.name.toLowerCase().includes(search.toLowerCase()) || 
     s.roll.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Marks Entry</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enter and review student marks for assessments</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={handleSaveDraft}>
             {isSaved ? 'Draft Saved!' : 'Save Draft'}
           </Button>
           <Button  onClick={() => setIsPublishOpen(true)}><CheckCircle className="mr-2 h-4 w-4" /> Publish Marks</Button>
        </div>
      </div>

      <Dialog 
        isOpen={isPublishOpen} 
        onClose={() => setIsPublishOpen(false)} 
        title="Publish Marks to Students?"
        footer={
           <>
              <Button variant="outline" onClick={() => setIsPublishOpen(false)}>Cancel</Button>
              <Button  onClick={handlePublish}>Confirm & Publish</Button>
           </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 py-4">This action will finalize the marks for Internal Test 1 and notify all students. Changes after publishing require HOD approval. Are you sure?</p>
      </Dialog>

      <Card>
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-4 items-center bg-slate-50/50 dark:bg-slate-900/50 flex-wrap">
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option>CS301 - Data Structures</option>
            <option>CS302 - Algorithms</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none">
            <option>Internal Test 1 (30 Marks)</option>
            <option>Internal Test 2 (30 Marks)</option>
            <option>Assignment 1 (10 Marks)</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search roll no or name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500 w-24">Roll No</th>
                  <th className="px-4 py-3 font-medium text-slate-500">Student Name</th>
                  <th className="px-4 py-3 font-medium text-slate-500 w-48 font-mono">Q1 (10)</th>
                  <th className="px-4 py-3 font-medium text-slate-500 w-48 font-mono">Q2 (10)</th>
                  <th className="px-4 py-3 font-medium text-slate-500 w-48 font-mono">Q3 (10)</th>
                  <th className="px-4 py-3 font-medium text-slate-500 w-32 font-mono">Total (30)</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredStudents.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">{s.roll}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="px-4 py-2">
                       <input 
                          type="number" 
                          value={s.q1} 
                          onChange={(e) => handleMarkChange(i, 'q1', e.target.value)}
                          max="10" min="0" 
                          disabled={s.status === 'Published'}
                          className="w-16 px-2 py-1 text-sm border border-slate-300 rounded dark:border-slate-700 dark:bg-slate-950 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50" 
                       />
                    </td>
                    <td className="px-4 py-2">
                       <input 
                         type="number" 
                         value={s.q2} 
                         onChange={(e) => handleMarkChange(i, 'q2', e.target.value)}
                         max="10" min="0" 
                         disabled={s.status === 'Published'}
                         className="w-16 px-2 py-1 text-sm border border-slate-300 rounded dark:border-slate-700 dark:bg-slate-950 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50" 
                       />
                    </td>
                    <td className="px-4 py-2">
                       <input 
                         type="number" 
                         value={s.q3} 
                         onChange={(e) => handleMarkChange(i, 'q3', e.target.value)}
                         max="10" min="0" 
                         disabled={s.status === 'Published'}
                         className="w-16 px-2 py-1 text-sm border border-slate-300 rounded dark:border-slate-700 dark:bg-slate-950 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50" 
                       />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{s.total > 0 ? s.total : '-'}</td>
                    <td className="px-4 py-3 text-center">
                       {s.status === 'Saved' ? (
                          <Badge variant="success">Saved</Badge>
                       ) : s.status === 'Published' ? (
                          <Badge variant="success">Published</Badge>
                       ) : (
                          <Badge variant="warning">Pending</Badge>
                       )}
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
