import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormField, Input, Select, Textarea } from '@/components/ui/FormField';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Send, Users, Bell, Loader2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { notificationsApi } from '@/lib/api';

type Audience = 'all' | 'admin' | 'hod' | 'faculty' | 'student' | 'parent';

const AUDIENCE_LABELS: Record<Audience, string> = {
  all: 'Everyone', admin: 'Admins only', hod: 'HODs only',
  faculty: 'All Faculty', student: 'All Students', parent: 'All Parents',
};

const AUDIENCE_VARIANT: Record<Audience, 'default' | 'info' | 'success' | 'warning' | 'outline'> = {
  all: 'info', admin: 'default', hod: 'default',
  faculty: 'success', student: 'warning', parent: 'outline',
};

export function AdminNotifications() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useFetch(() => notificationsApi.list() as Promise<any>);

  const [title,    setTitle]    = useState('');
  const [message,  setMessage]  = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [sending,  setSending]  = useState(false);

  const notifications: any[] = (data as any)?.notifications ?? [];

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { toast('error', 'Title and message are required.'); return; }
    setSending(true);
    try {
      await notificationsApi.create({ title: title.trim(), message: message.trim(), audience });
      toast('success', 'Notification sent successfully.');
      setTitle('');
      setMessage('');
      setAudience('all');
      refetch();
    } catch (err: any) {
      toast('error', err.message ?? 'Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Broadcast Notifications</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Send announcements to students, faculty, parents, or everyone</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" /> New Broadcast
            </h2>
          </div>
          <CardContent className="p-5 space-y-4">
            <FormField label="Target Audience" required>
              <Select value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
                {(Object.entries(AUDIENCE_LABELS) as [Audience, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Exam Schedule Released"
                maxLength={120}
              />
              <p className="text-xs text-right text-slate-400 mt-1">{title.length}/120</p>
            </FormField>

            <FormField label="Message" required>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Write your announcement here…"
              />
            </FormField>

            <Button className="w-full" onClick={handleSend}
              disabled={!title.trim() || !message.trim() || sending}>
              {sending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
                : <><Send className="w-4 h-4 mr-2" />Send to {AUDIENCE_LABELS[audience]}</>}
            </Button>
          </CardContent>
        </Card>

        {/* Recent broadcasts */}
        <Card>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" /> Recent Broadcasts
            </h2>
            <span className="text-xs text-slate-400">{notifications.length} total</span>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No notifications sent yet.</div>
              ) : notifications.map((n: any) => (
                <div key={n.id} className="p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="bg-blue-50 dark:bg-slate-800 p-2 rounded-full h-fit shrink-0">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{n.title}</p>
                      <Badge variant={AUDIENCE_VARIANT[n.audience as Audience] ?? 'outline'} className="shrink-0 text-[10px] py-0">
                        {AUDIENCE_LABELS[n.audience as Audience] ?? n.audience}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {n.created_by?.name && ` · ${n.created_by.name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
