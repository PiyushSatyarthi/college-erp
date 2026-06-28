import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Bell } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { notificationsApi } from '@/lib/api';

const AUDIENCE_COLOR: Record<string, string> = {
  all:     'bg-blue-500',
  student: 'bg-green-500',
  faculty: 'bg-amber-500',
  parent:  'bg-purple-500',
  hod:     'bg-orange-500',
  admin:   'bg-slate-500',
};

export function StudentNotifications() {
  const { data, loading, error, refetch } = useFetch(() => notificationsApi.list() as Promise<any>);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeAudience, setActiveAudience] = useState<string>('all');

  const notifications: any[] = (data as any)?.notifications ?? [];

  const filtered = activeAudience === 'all'
    ? notifications
    : notifications.filter((n: any) => n.audience === activeAudience);

  const unreadCount = notifications.filter((n: any) => !readIds.has(n.id)).length;

  const markRead = (id: string) => setReadIds((prev) => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(notifications.map((n: any) => n.id)));

  const audiences = [...new Set(notifications.map((n: any) => n.audience))];

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
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      {/* Audience filter tabs */}
      {audiences.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...audiences].filter((v, i, a) => a.indexOf(v) === i).map((a) => (
            <button key={a}
              onClick={() => setActiveAudience(a)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeAudience === a
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {a === 'all' ? 'All' : a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : filtered.map((n: any) => {
              const isUnread = !readIds.has(n.id);
              return (
                <div key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`p-4 sm:px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors
                    ${isUnread ? 'bg-blue-50/40 dark:bg-blue-900/5' : ''}`}>
                  <div className="flex gap-3">
                    <div className="mt-1.5 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${isUnread ? (AUDIENCE_COLOR[n.audience] ?? 'bg-blue-500') : 'bg-slate-300 dark:bg-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                        <h4 className={`text-sm ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>
                          {n.title}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{n.audience}</Badge>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm line-clamp-2 ${isUnread ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>
                        {n.message}
                      </p>
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
