import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '@/store/useAppStore';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const { role } = useAppStore();
  const location = useLocation();

  if (role === 'Public' && location.pathname !== '/login') {
     return <Navigate to="/login" replace />;
  }

  if (role === 'Public' && location.pathname === '/login') {
     return <Outlet />;
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
