import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, Send, Mic } from 'lucide-react';

export function StudentAIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi Rahul! I am your AI Study Assistant. You can ask me about your attendance, exams, or study plans. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', content: input }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: 'Based on your data, your attendance in Operating Systems is 68%. You need to attend 8 more consecutive classes to reach the required 75% for exam eligibility.' }]);
    }, 1000);
    setInput('');
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <Brain className="h-6 w-6 text-blue-500" /> AI Study Assistant
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Claude — Ask about your academic progress</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="hidden lg:flex w-1/3 flex-col gap-4">
           <Card className="flex-1 border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">🤖 Attendance Predictor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 shadow-sm">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Operating Systems — Current: 68%</h4>
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p className="flex items-center gap-2"><span className="text-green-600">📈</span> Need to attend next 8 classes to reach 75%</p>
                      <p className="flex items-center gap-2"><span className="text-slate-500">📅</span> You can skip max 0 more classes</p>
                      <p className="flex items-center gap-2"><span className="text-red-600">⚠</span> If you miss 2 more, drops to 61%</p>
                    </div>
                </div>
              </CardContent>
           </Card>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.map((m, i) => (
              <div key={i} className={`flex max-w-[80%] ${m.role === 'user' ? 'self-end bg-blue-600 text-white' : 'self-start bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'} p-3 rounded-2xl ${m.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                {m.role === 'ai' && <Brain className="h-5 w-5 mr-2 shrink-0 mt-0.5 text-blue-500" />}
                <p className="text-sm leading-relaxed">{m.content}</p>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button onClick={() => setInput('Will I be eligible for exams?')} className="shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">Will I be eligible for exams?</button>
              <button onClick={() => setInput('Which subject needs most attention?')} className="shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">Which subject needs most attention?</button>
              <button onClick={() => setInput('What is my current GPA?')} className="shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">What is my current GPA?</button>
            </div>
            <div className="flex items-end gap-2 relative">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-end">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-none p-3 max-h-32 min-h-12 resize-none outline-none text-sm dark:text-white"
                />
                <Button variant="ghost" size="icon" className="mb-1 mr-1 text-slate-400 hover:text-blue-500">
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
              <Button onClick={handleSend}  size="icon" className="rounded-full shrink-0 h-10 w-10">
                 <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
