import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { DashboardSkeleton, ErrorBanner } from '@/components/ui/Skeleton';
import { Users, GraduationCap, Layers } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { facultyApi, studentsApi, coursesApi, api } from '@/lib/api';

export function HodDepartment() {
  const { data: meData } = useFetch(() => api.get<any>('/api/auth/me'));
  const deptId: string | undefined = meData?.profile?.department?.id;
  const deptName: string            = meData?.profile?.department?.name ?? 'Your Department';

  const { data: facultyData, loading: fl, error: fe } = useFetch(
    () => deptId ? (facultyApi.list({ departmentId: deptId }) as Promise<any>) : Promise.resolve(null),
    [deptId]
  );
  const { data: studentsData, loading: sl, error: se } = useFetch(
    () => deptId ? (studentsApi.list({ departmentId: deptId }) as Promise<any>) : Promise.resolve(null),
    [deptId]
  );
  const { data: coursesData, loading: cl, error: ce } = useFetch(
    () => deptId ? (coursesApi.list({ departmentId: deptId }) as Promise<any>) : Promise.resolve(null),
    [deptId]
  );

  const [viewAllType, setViewAllType] = useState<'faculty' | 'students' | 'courses' | null>(null);

  const allFaculty:  any[] = (facultyData  as any)?.faculty   ?? [];
  const allStudents: any[] = (studentsData as any)?.students  ?? [];
  const allCourses:  any[] = (coursesData  as any)?.courses   ?? [];

  const loading = fl || sl || cl;
  const error   = fe || se || ce;

  if (loading) return <DashboardSkeleton />;
  if (error)   return <ErrorBanner message={String(error)} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Department</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{deptName}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Faculty',  value: allFaculty.length,  icon: <Users className="w-5 h-5 text-blue-600" /> },
          { label: 'Students', value: allStudents.length, icon: <GraduationCap className="w-5 h-5 text-blue-600" /> },
          { label: 'Courses',  value: allCourses.length,  icon: <Layers className="w-5 h-5 text-blue-600" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
            <CardContent className="p-4 flex items-center gap-3">
              {icon}
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View-all dialog */}
      <Dialog
        isOpen={!!viewAllType}
        onClose={() => setViewAllType(null)}
        title={viewAllType === 'faculty' ? `All Faculty (${allFaculty.length})` : viewAllType === 'students' ? `All Students (${allStudents.length})` : `All Courses (${allCourses.length})`}
        footer={<Button variant="outline" onClick={() => setViewAllType(null)}>Close</Button>}
      >
        <div className="max-h-[60vh] overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {viewAllType === 'faculty' && allFaculty.map((f: any) => (
            <div key={f.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{f.user?.name}</p>
                <p className="text-sm text-slate-500">{f.designation ?? 'Faculty'} · {f.user?.email}</p>
              </div>
              <Badge variant={f.is_hod ? 'info' : 'outline'}>{f.is_hod ? 'HOD' : 'Faculty'}</Badge>
            </div>
          ))}
          {viewAllType === 'students' && allStudents.map((s: any) => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{s.user?.name}</p>
                <p className="text-sm font-mono text-slate-500">{s.roll_number}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline">Div {s.division} · Yr {s.year}</Badge>
                <span className={`text-[10px] font-medium ${s.is_active ? 'text-green-500' : 'text-red-500'}`}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
          {viewAllType === 'courses' && allCourses.map((c: any) => (
            <div key={c.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{c.name}</p>
                <p className="text-sm font-mono text-slate-500">{c.code}</p>
              </div>
              <Badge variant="outline">{c.duration_years} yr{c.duration_years > 1 ? 's' : ''}</Badge>
            </div>
          ))}
        </div>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2 m-0">
              <Users className="w-5 h-5 text-blue-600" /> Faculty
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500"
              onClick={() => setViewAllType('faculty')}>
              View All ({allFaculty.length})
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {allFaculty.slice(0, 5).map((f: any) => (
                <div key={f.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {(f.user?.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{f.user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{f.designation ?? 'Faculty'}</p>
                    </div>
                  </div>
                  <Badge variant={f.is_hod ? 'info' : 'outline'} className="shrink-0 ml-2">
                    {f.is_hod ? 'HOD' : 'Faculty'}
                  </Badge>
                </div>
              ))}
              {allFaculty.length === 0 && (
                <p className="p-4 text-sm text-slate-400 text-center">No faculty assigned.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2 m-0">
              <GraduationCap className="w-5 h-5 text-blue-600" /> Students
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500"
              onClick={() => setViewAllType('students')}>
              View All ({allStudents.length})
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {allStudents.slice(0, 5).map((s: any) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{s.user?.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{s.roll_number}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <Badge variant="outline" className="text-[10px] py-0">Div {s.division}</Badge>
                    <span className={`text-[10px] font-medium ${s.is_active ? 'text-green-500' : 'text-red-500'}`}>
                      Yr {s.year}
                    </span>
                  </div>
                </div>
              ))}
              {allStudents.length === 0 && (
                <p className="p-4 text-sm text-slate-400 text-center">No students enrolled.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2 m-0">
              <Layers className="w-5 h-5 text-blue-600" /> Courses
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500"
              onClick={() => setViewAllType('courses')}>
              View All ({allCourses.length})
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {allCourses.slice(0, 5).map((c: any) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{c.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{c.code}</p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap shrink-0 ml-2">
                    {c.duration_years} yr{c.duration_years > 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
              {allCourses.length === 0 && (
                <p className="p-4 text-sm text-slate-400 text-center">No courses found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
