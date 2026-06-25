import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Shield, BookOpen } from 'lucide-react';

export function Profile() {
  const { role } = useAppStore();

  const renderProfileDetails = () => {
    switch (role) {
      case 'Admin':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Admin Privileges</p>
                <p className="text-sm text-slate-500">Full System Access</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Member Since</p>
                <p className="text-sm text-slate-500">2020</p>
              </div>
            </div>
          </div>
        );
      case 'HOD':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Department</p>
                <p className="text-sm text-slate-500">Computer Science & Engineering</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Tenure Start</p>
                <p className="text-sm text-slate-500">August 2021</p>
              </div>
            </div>
          </div>
        );
      case 'Faculty':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Designation</p>
                <p className="text-sm text-slate-500">Assistant Professor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Subjects</p>
                <p className="text-sm text-slate-500">Data Structures, Algorithms</p>
              </div>
            </div>
          </div>
        );
      case 'Student':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Program</p>
                <p className="text-sm text-slate-500">B.Tech - Computer Science (Sem 5)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Roll Number</p>
                <p className="text-sm text-slate-500">2024CS01</p>
              </div>
            </div>
          </div>
        );
      case 'Parent':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Ward's Name</p>
                <p className="text-sm text-slate-500">Rahul Sharma (2024CS01)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Emergency Contact</p>
                <p className="text-sm text-slate-500">+1 234 567 890</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'HOD': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Faculty': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Student': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Parent': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {role === 'Admin' ? 'System Admin' : 
                 role === 'HOD' ? 'Dr. Sarah Connor' : 
                 role === 'Faculty' ? 'Prof. Amit Kumar' : 
                 role === 'Student' ? 'Rahul Sharma' : 
                 'Rajesh Sharma'}
              </h2>
              <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor()}`}>
                {role}
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">user@university.edu</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">+1 234 567 8900</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Campus Block A</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Role Specific Details</CardTitle>
            <CardDescription>Information specific to your role as a {role}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderProfileDetails()}
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
               <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Actions</h3>
               <div className="flex flex-wrap gap-4">
                 <Button variant="outline">Edit Profile</Button>
                 <Button variant="outline">Change Password</Button>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
