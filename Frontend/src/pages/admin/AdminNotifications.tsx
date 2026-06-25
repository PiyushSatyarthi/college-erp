import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function AdminNotifications() {
  const [target, setTarget] = useState('All Students');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [broadcasts, setBroadcasts] = useState([
    { id: 1, title: 'End Sem Exam Hall Tickets', body: 'Hall tickets are now available for download. Ensure attendance criteria is met.', target: 'All Students', urgent: false, time: '2 hours ago' },
    { id: 2, title: 'Holiday Declaration - Heavy Rain', body: 'College will remain closed tomorrow due to red alert.', target: 'All', urgent: true, time: '1 day ago' }
  ]);

  const handleSend = () => {
    if (!title || !body) return;
    setIsSending(true);
    setTimeout(() => {
      setBroadcasts([
         { id: Date.now(), title, body, target, urgent, time: 'Just now' },
         ...broadcasts
      ]);
      setTitle('');
      setBody('');
      setUrgent(false);
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Broadcast Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Send alerts and manage automated messages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
             <h2 className="text-lg font-semibold flex items-center gap-2"><Send className="w-5 h-5 text-blue-600" /> New Broadcast</h2>
          </div>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience</label>
                <select value={target} onChange={e => setTarget(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Students</option>
                  <option>All Faculty</option>
                  <option>Specific Department (Students)</option>
                  <option>Specific Department (Faculty)</option>
                  <option>Parents</option>
                  <option>All</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Exam Schedule Published" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Body</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Type your message here..." className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm dark:bg-slate-950 dark:border-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-500"></textarea>
             </div>
             <div className="flex items-center gap-2">
                <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} id="urgent" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                <label htmlFor="urgent" className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1 cursor-pointer"><AlertCircle className="w-4 h-4" /> Mark as Urgent Alert (Push Notif/SMS)</label>
             </div>
             <Button  className="w-full" disabled={!title || !body || isSending} onClick={handleSend}>
               {isSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Sending...</> : 'Send Broadcast'}
             </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                 <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">Recent Broadcasts <Badge variant="outline">View All</Badge></h2>
              </div>
              <CardContent className="p-0">
                 <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[500px] overflow-y-auto">
                    {broadcasts.map(b => (
                       <div key={b.id} className="p-4 flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className={`${b.urgent ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'} p-2 rounded-full shrink-0`}>
                             {b.urgent ? <AlertCircle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <div>
                             <p className={`font-semibold text-sm ${b.urgent ? 'text-red-800 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>{b.title}</p>
                             <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.body}</p>
                             <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-400">
                                <span>Sent to: {b.target}</span>
                                <span>{b.time}</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
