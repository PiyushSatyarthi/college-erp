import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Construction } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function PlaceholderPage() {
  const location = useLocation();
  const { role } = useAppStore();
  
  // Format the path to make a nice title
  let title = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Page';
  if (title === role.toLowerCase()) {
      title = 'Dashboard';
  }

  return (
    <div className="flex h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-dashed border-2 shadow-none dark:border-slate-800">
        <CardContent className="pt-10 pb-10 px-6 flex flex-col items-center">
          <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Construction className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold capitalize mb-2">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">Coming Soon</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            This section is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
