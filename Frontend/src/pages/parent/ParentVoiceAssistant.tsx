import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mic, Waves, MessageSquare, Loader2, StopCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function ParentVoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queries, setQueries] = useState([
    { id: 1, question: "Is there any fees pending?", answer: "No, there are no pending fees for this year. The next installment is due next semester." },
    { id: 2, question: "Show his attendance in Data Structures.", answer: "Rahul's attendance in Data Structures is currently 87.5%. He has attended 35 out of 40 classes." }
  ]);
  const [selectedLang, setSelectedLang] = useState('English');

  const handleVoiceToggle = () => {
     if (isProcessing) return;
     
     if (isRecording) {
        setIsRecording(false);
        setIsProcessing(true);
        // Simulate processing and response
        setTimeout(() => {
           setIsProcessing(false);
           setQueries([
              { 
                 id: Date.now(), 
                 question: selectedLang === 'Hindi' ? "Rahul ka kal ka attendance kya tha?" : "What was Rahul's attendance yesterday?", 
                 answer: selectedLang === 'Hindi' ? "Rahul kal college present tha, sabhi lectures attend kiye." : "Rahul was present yesterday and attended all 4 scheduled lectures."
              },
              ...queries
           ]);
        }, 2000);
     } else {
        setIsRecording(true);
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Mic className="w-6 h-6 text-indigo-600" /> Voice Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ask questions about your ward's progress in your regional language</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center p-8 min-h-[400px]">
           <div className="relative mb-8">
              {isRecording && <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full animate-ping"></div>}
              <Button 
                size="icon" 
                onClick={handleVoiceToggle}
                className={`relative w-24 h-24 rounded-full shadow-lg transition-transform ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-105' : 'bg-indigo-600 hover:bg-indigo-700'} ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                 {isProcessing ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : isRecording ? <StopCircle className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
              </Button>
           </div>
           <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
              {isProcessing ? 'Processing audio...' : isRecording ? 'Listening...' : 'Tap to Speak'}
           </h2>
           <p className="text-center text-slate-500 dark:text-slate-400 max-w-sm mb-6 min-h-[40px]">
              {isRecording ? "Speak clearly into your microphone." : isProcessing ? "Analyzing query using AI..." : <>"What is Rahul's attendance this week?" <br /> "How did he perform in test 2?"</>}
           </p>
           <div className="flex gap-2">
              <div 
                onClick={() => setSelectedLang('English')}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors ${selectedLang === 'English' ? 'border border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:bg-indigo-900/30' : 'border border-slate-200 dark:border-slate-800 opacity-50 hover:opacity-100'}`}
              >
                English
              </div>
              <div 
                onClick={() => setSelectedLang('Hindi')}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors ${selectedLang === 'Hindi' ? 'border border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:bg-indigo-900/30' : 'border border-slate-200 dark:border-slate-800 opacity-50 hover:opacity-100'}`}
              >
                Hindi
              </div>
           </div>
        </Card>

        <div className="space-y-4">
           <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <MessageSquare className="w-4 h-4 text-slate-500" /> Interaction History
           </h3>
           <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {queries.map(q => (
                 <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-shadow">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2">
                       <span className="text-indigo-600 mt-0.5">Q:</span> "{q.question}"
                    </p>
                    <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                       <span className="text-blue-600 mt-0.5 font-medium">A:</span> 
                       <div>{q.answer}</div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
