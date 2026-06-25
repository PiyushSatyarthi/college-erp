import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function StudentNotifications() {
  const [currentTab, setCurrentTab] = useState('All');

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'red', category: 'Attendance', title: 'Low Attendance Warning', body: 'Your attendance in Operating Systems has dropped to 68%. Please apply for condonation immediately.', time: '2 hours ago', unread: true },
    { id: 2, type: 'green', category: 'Marks', title: 'Marks Published: Internal Test 1', body: 'Marks for CS301 Database Systems have been published. Check the marks section.', time: '1 day ago', unread: true },
    { id: 3, type: 'blue', category: 'Attendance', title: 'Condonation Application Update', body: 'Your condonation application for Computer Networks was approved.', time: '3 days ago', unread: false },
    { id: 4, type: 'blue', category: 'System', title: 'Exam Registration Opens', body: 'Semester 5 examination registration is now open. Eligible students can download their hall tickets next week.', time: '1 week ago', unread: false },
  ]);

  const tabs = ['All', 'Unread', 'Attendance', 'Marks', 'System'];

  const filteredNotifications = notifications.filter(n => {
    if (currentTab === 'All') return true;
    if (currentTab === 'Unread') return n.unread;
    return n.category === currentTab;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const getTabLabel = (tab: string) => {
    if (tab === 'All') return `All (${notifications.length})`;
    if (tab === 'Unread') return `Unread (${unreadCount})`;
    return tab;
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>Mark all as read</Button>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
        {tabs.map((tab, i) => (
          <Button 
            key={i} 
            variant={currentTab === tab ? 'primary' : 'outline'} 
            roleColor={currentTab === tab ? 'student' : undefined}
            onClick={() => setCurrentTab(tab)}
            className={`shrink-0 ${currentTab !== tab ? 'text-slate-600 dark:text-slate-300' : ''}`}
          >
            {getTabLabel(tab)}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredNotifications.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No notifications found.</div>
            ) : filteredNotifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => markAsRead(n.id)}
                className={`p-4 sm:px-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${n.unread ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
              >
                 <div className="flex gap-4">
                   <div className="mt-1.5 shrink-0">
                     <div className={`w-2.5 h-2.5 rounded-full bg-${n.type}-500 shadow-[0_0_4px_currentColor]`}></div>
                   </div>
                   <div className="flex-1">
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                       <h4 className={`text-base ${n.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                         {n.title}
                       </h4>
                       <span className="text-xs text-slate-500 whitespace-nowrap">{n.time}</span>
                     </div>
                     <p className={`line-clamp-2 text-sm ${n.unread ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>
                       {n.body}
                     </p>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
