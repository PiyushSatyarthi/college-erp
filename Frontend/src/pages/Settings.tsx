import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Brain, CreditCard, Paintbrush, Bell, Globe, KeyRound } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function Settings() {
  const { isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage app preferences and system configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-1">
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
             <Paintbrush className="w-4 h-4" /> Appearance
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
             <Shield className="w-4 h-4" /> Security
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
             <Globe className="w-4 h-4" /> Localization
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
             <Brain className="w-4 h-4" /> AI Configuration
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
             <Bell className="w-4 h-4" /> Notifications
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
             <CreditCard className="w-4 h-4" /> Billing & Plan
           </button>
        </div>

        <div className="col-span-1 md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize the visual appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
                </div>
                <div 
                   onClick={toggleDarkMode}
                   className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                     isDarkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                   }`}
                >
                   <div 
                     className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                       isDarkMode ? 'translate-x-6' : 'translate-x-0'
                     }`} 
                   />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Update the institution name and logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Institution Name</label>
                 <input 
                   type="text" 
                   className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                   defaultValue="Shri Vivekanand College of Engineering"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Brand Color (Hex)</label>
                 <input 
                   type="text" 
                   className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                   defaultValue="#2563EB"
                 />
               </div>
               <Button className="mt-2">Update Branding</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
