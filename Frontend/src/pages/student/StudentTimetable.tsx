import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Calendar, Clock } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { timetableApi } from '@/lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Consistent pastel colours per subject code so the same subject always
// looks the same across days
function subjectColor(code: string): string {
  const colors = [
    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
    'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
    'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800',
    'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  ];
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

export function StudentTimetable() {
  const { data, loading, error, refetch } = useFetch(() => timetableApi.list() as Promise<any>);

  const slots: any[] = (data as any)?.slots ?? [];

  const byDay = slots.reduce<Record<number, any[]>>((acc, s) => {
    if (!acc[s.day_of_week]) acc[s.day_of_week] = [];
    acc[s.day_of_week].push(s);
    return acc;
  }, {});

  // Today's day index (0=Mon ... 5=Sat, -1=Sun)
  const todayIdx = new Date().getDay() - 1; // JS getDay: 0=Sun,1=Mon...

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Timetable</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Weekly recurring class schedule</p>
      </div>

      {slots.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No timetable has been set for your class yet.</p>
            <p className="text-xs mt-1">Check back after your HOD or Admin configures the weekly schedule.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day, idx) => {
            const daySlots = (byDay[idx] ?? []).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
            const isToday  = idx === todayIdx;

            return (
              <Card key={idx}
                className={`overflow-hidden ${isToday ? 'border-blue-400 dark:border-blue-600 shadow-md' : daySlots.length === 0 ? 'opacity-60' : ''}`}>
                <div className={`flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800
                  ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-900/60'}`}>
                  <span className={`font-bold text-xs w-10 ${isToday ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                    {DAY_SHORT[idx]}
                  </span>
                  <span className={`font-semibold ${isToday ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{day}</span>
                  {isToday && (
                    <span className="ml-2 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">Today</span>
                  )}
                  <span className={`ml-auto text-xs ${isToday ? 'text-blue-200' : 'text-slate-400'}`}>
                    {daySlots.length} class{daySlots.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                <CardContent className="p-4">
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-1">No classes</p>
                  ) : (
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      {daySlots.map((slot: any) => (
                        <div key={slot.id}
                          className={`flex-1 min-w-[180px] max-w-xs rounded-xl border p-4 ${subjectColor(slot.subject?.code ?? 'X')}`}>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                            {slot.subject?.name ?? '—'}
                          </p>
                          <p className="font-mono text-slate-500 dark:text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.start_time} – {slot.end_time}
                          </p>
                          {slot.faculty?.user?.name && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{slot.faculty.user.name}</p>
                          )}
                          {slot.room && (
                            <p className="text-xs text-slate-400 mt-0.5">Room {slot.room}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
