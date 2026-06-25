import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Bell, AlertTriangle, Info, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function ParentNotifications() {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'Low Attendance Alert',
      message: 'Rahul has missed two consecutive classes in Computer Networks.',
      time: '2 hours ago',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      id: 2,
      type: 'info',
      title: 'Internal Test Results',
      message: 'Marks for Test 2 in Data Structures have been published.',
      time: 'Yesterday',
      icon: <Info className="w-5 h-5 text-blue-500" />
    },
    {
      id: 3,
      type: 'event',
      title: 'PTA Meeting Scheduled',
      message: 'A parent-teacher meeting is scheduled for next Friday at 10:00 AM.',
      time: '3 days ago',
      icon: <Calendar className="w-5 h-5 text-emerald-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-600" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Updates regarding your ward's progress</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className={`mt-1 p-2 rounded-full h-fit
                  ${notif.type === 'alert' ? 'bg-red-50 dark:bg-red-900/20' : 
                    notif.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20' : 
                    'bg-emerald-50 dark:bg-emerald-900/20'}`}
                >
                  {notif.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{notif.title}</h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{notif.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
