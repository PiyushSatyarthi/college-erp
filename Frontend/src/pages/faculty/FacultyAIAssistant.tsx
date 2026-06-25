import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, Search, Send, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function FacultyAIAssistant() {
  const [messages, setMessages] = useState([
     { id: 1, text: "Hello! I can help you prepare for your upcoming classes. Would you like me to generate a lesson plan for \"Trees and Graphs\" or perhaps create a short quiz?", sender: 'system' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    setMessages([...messages, { id: Date.now(), text: inputValue, sender: 'user' }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
       setMessages(prev => [...prev, { 
         id: Date.now(), 
         text: "Here is what I found based on your request. Let me know if you want to refine this further. \n\n[ AI Generated Output... ]", 
         sender: 'system' 
       }]);
       setIsTyping(false);
    }, 2000);
  };

  const setPromptAndSend = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" /> AI Teaching Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate lesson plans, assignments, and get insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex-1 flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
               <h2 className="font-semibold text-slate-900 dark:text-slate-100">Chat with Assistant</h2>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col bg-slate-50/20 dark:bg-slate-950/20 max-h-[500px]">
               <div className="flex-1 overflow-y-auto space-y-6 mb-4 px-2">
                  {messages.map((m, i) => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-sm text-slate-700 dark:text-slate-300'} rounded-2xl p-4 max-w-[80%] shadow-sm w-full whitespace-pre-wrap text-sm`}>
                          {m.sender === 'system' && i > 0 && (
                            <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
                               <Brain className="w-4 h-4" /> <span className="text-xs font-semibold uppercase tracking-wider">Generated Content</span>
                            </div>
                          )}
                          {m.text}
                       </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm p-4 w-16 shadow-sm flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                       </div>
                    </div>
                  )}
               </div>
               
               <div className="relative mt-auto shrink-0">
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={e => setInputValue(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSend()}
                   placeholder="Ask me to create a lesson plan, draft an email, or analyze marks..." 
                   className="w-full pl-4 pr-12 py-3 text-sm border border-slate-300 rounded-xl dark:border-slate-700 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                 />
                 <Button onClick={handleSend} disabled={isTyping || !inputValue.trim()} size="icon" className="absolute right-1.5 top-1.5 h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    <Send className="w-4 h-4" />
                 </Button>
               </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
               <h2 className="font-semibold text-slate-900 dark:text-slate-100">Suggested Actions</h2>
            </div>
            <CardContent className="p-4 flex flex-col gap-2">
               <Button onClick={() => setPromptAndSend("Draft an email to parents of students below 75% attendance in CS301 (Data Structures).")} variant="outline" className="justify-start text-left h-auto py-3 whitespace-normal">
                  <div className="flex flex-col items-start gap-1">
                     <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Draft Defaulters Email</span>
                     <span className="text-xs text-slate-500">For students below 75% in CS301</span>
                  </div>
               </Button>
               <Button onClick={() => setPromptAndSend("Generate a detailed 60-minute lesson plan for Algorithms introducing Minimum Spanning Trees (Kruskal's algorithm).")} variant="outline" className="justify-start text-left h-auto py-3 whitespace-normal">
                  <div className="flex flex-col items-start gap-1">
                     <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Generate Lesson Plan</span>
                     <span className="text-xs text-slate-500">For tomorrow's class (Algorithms)</span>
                  </div>
               </Button>
               <Button onClick={() => setPromptAndSend("Analyze the mid-term feedback reviews for Data Structures. What are the top 3 areas students want me to improve?")} variant="outline" className="justify-start text-left h-auto py-3 whitespace-normal">
                  <div className="flex flex-col items-start gap-1">
                     <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Analyze Feedback</span>
                     <span className="text-xs text-slate-500">Summarize mid-term student reviews</span>
                  </div>
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
