import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Menu, Moon, Sun, Bell, User, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const { role, user, isDarkMode, toggleDarkMode, sidebarOpen, setSidebarOpen, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            SV
          </div>
          <span className="hidden font-semibold sm:inline-block">Shri Vivekanand College</span>
        </div>

        <div className="hidden items-center text-sm text-slate-500 dark:text-slate-400 lg:flex ml-4">
          <ChevronRight className="h-4 w-4 mr-2" />
          <span>{role} Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate(`/${role.toLowerCase()}/notifications`)}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-950"></span>
        </Button>

        <div
          onClick={() => navigate(`/${role.toLowerCase()}/profile`)}
          className="ml-2 flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {user?.name ?? 'Profile'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
