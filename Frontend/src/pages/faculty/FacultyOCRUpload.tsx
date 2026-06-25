import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function FacultyOCRUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scans, setScans] = useState([
    { id: 1, name: 'Batch_A_Test1_Sheets.pdf', pages: 30, extracted: 28, status: 'Completed', alerts: 0 },
    { id: 2, name: 'Batch_B_Manual_Photos.zip', pages: 12, extracted: 9, status: 'Needs Manual Review', alerts: 3 }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartExtraction = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
       setIsProcessing(false);
       setScans([
         { id: Date.now(), name: selectedFile.name, pages: 15, extracted: 15, status: 'Completed', alerts: 0 },
         ...scans
       ]);
       setSelectedFile(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">OCR Marks Upload</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Scan and auto-extract marks from physical answer sheets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Upload className="w-5 h-5 text-blue-600" /> Upload Sheets</h2>
          </div>
          <CardContent className="p-6">
             <div className="flex flex-col gap-4">
                <select className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none w-full">
                  <option>CS301 - Data Structures (Internal Test 1)</option>
                  <option>CS302 - Algorithms (Internal Test 1)</option>
                </select>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 text-center hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      accept=".pdf,.jpg,.png,.zip" 
                    />
                    <Upload className={`w-10 h-10 mb-4 ${selectedFile ? 'text-blue-500' : 'text-slate-400'}`} />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {selectedFile ? selectedFile.name : 'Drag & drop scanned sheets'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 mb-6">
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Supports PDF, JPG, PNG (Max 50MB)'}
                    </p>
                    <Button variant="outline" className="pointer-events-none"><FileText className="w-4 h-4 mr-2" /> Browse Files</Button>
                </div>
                <Button 
                    
                   className="w-full" 
                   disabled={!selectedFile || isProcessing}
                   onClick={handleStartExtraction}
                >
                   {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing AI Extraction...</> : 'Start AI Extraction'}
                </Button>
             </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">Recent Scans</h2>
          </div>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {scans.map(scan => (
                   <div key={scan.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className={`p-2 rounded-full shrink-0 ${scan.status === 'Completed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                         {scan.status === 'Completed' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                         <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{scan.name}</p>
                         <p className="text-xs text-slate-500 mt-1">Processed {scan.pages} pages. Extracted {scan.extracted} student records.</p>
                         <div className="flex items-center gap-2 mt-2">
                            <Badge variant={scan.status === 'Completed' ? 'success' : 'warning'}>{scan.status}</Badge>
                            <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 dark:text-blue-400 ml-auto">
                              {scan.alerts > 0 ? `Resolve (${scan.alerts})` : 'Review Matches'}
                            </Button>
                         </div>
                      </div>
                   </div>
                ))}
                {scans.length === 0 && (
                   <div className="p-8 text-center text-slate-500 text-sm">
                      No recent scans.
                   </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
