import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Bell, AlertTriangle, Info, Calendar, Megaphone } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { notificationsApi } from '@/lib/api';

function NotifIcon({ audience }: { audience: string }) {
  switch (audience) {
    case 'parent': return <Bell className="w-4 h-4 text-purple-500" />;
    case 'student': return <Info className="w-4 h-4 text-blue-500" />;
    case 'all':    return <Megaphone className="w-4 h-4 text-amber-500" />;
    default:       return <Info className="w-4 h-4 text-slate-400" />;
  }
}

function NotifBg({ audience }: { audience: string }) {
  switch (audience) {
    case 'parent':  return 'bg-purple-50 dark:bg-purple-900/20';
    case 'student': return 'bg-blue-50 dark:bg-blue-900/20';
    case 'all':     return 'bg-amber-50 dark:bg-amber-900/20';
    default:        return 'bg-slate-50 dark:bg-slate-800';
  }
}

export function ParentNotifications() {
  const { data, loading, error, refetch } = useFetch(() => notificationsApi.list() as Promise<any>);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications: any[] = (data as any)?.notifications ?? [];
  const unreadCount = notifications.filter((n: any) => !readIds.has(n.id)).length;

  const markRead = (id: string) => setReadIds((prev) => new Set([...prev, id]));

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Updates about your ward's academic progress
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />
            {unreadCount} unread
          </span>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : notifications.map((n: any) => {
              const isUnread = !readIds.has(n.id);
              return (
                <div key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`p-4 sm:px-5 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors
                    ${isUnread ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                  <div className={`mt-0.5 p-2 rounded-full h-fit shrink-0 ${NotifBg({ audience: n.audience })}`}>
                    <NotifIcon audience={n.audience} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 mb-1">
                      <h3 className={`text-sm ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm ${isUnread ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {n.audience === 'all' ? 'General' : n.audience}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
