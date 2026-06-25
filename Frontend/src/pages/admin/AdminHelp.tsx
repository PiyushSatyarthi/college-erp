import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HelpCircle, Book, MessageSquare, PhoneCall, Mail } from 'lucide-react';

export function AdminHelp() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Help & Support</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Find answers or reach out to the support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
              <Book className="w-5 h-5" />
            </div>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Browse through our structured guides and references.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Getting Started with Admin Dashboard</li>
              <li className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Managing User Roles and Permissions</li>
              <li className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Configuring Academic Years</li>
              <li className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Generating System Reports</li>
            </ul>
            <Button variant="outline" className="w-full">View All Documentation</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">How do I reset a user's password?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Navigate to the user's profile under Users and click "Reset Password".</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Can I undelete an academic year?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No, deletions are permanent. Please ensure you really want to delete before confirming.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Why are reports not generating?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ensure you have selected the correct filters and the academic year is active.</p>
            </div>
            <Button variant="outline" className="w-full mt-2">Browse FAQ</Button>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Still need help? We are here for you.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                   <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-sm font-medium text-slate-900 dark:text-white">Call Us</h4>
                   <p className="text-sm text-slate-500 font-mono mt-1">+1 (800) 123-4567</p>
                </div>
             </div>
             <div className="flex-1 flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                   <Mail className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-sm font-medium text-slate-900 dark:text-white">Email Support</h4>
                   <p className="text-sm text-slate-500 mt-1">support@college-system.edu</p>
                </div>
             </div>
             <div className="flex-1 flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                   <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-sm font-medium text-slate-900 dark:text-white">Live Chat</h4>
                   <p className="text-sm text-blue-600 hover:underline mt-1 cursor-pointer">Start a conversation</p>
                </div>
             </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
