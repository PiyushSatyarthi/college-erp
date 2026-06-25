import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Sun, Moon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { authApi, ApiError } from '@/lib/api';

const roleHomeMap = {
  Admin:   '/admin',
  HOD:     '/hod',
  Faculty: '/faculty',
  Student: '/student',
  Parent:  '/parent',
  Public:  '/login',
} as const;

export function Login() {
  const navigate = useNavigate();
  const { login, isDarkMode, toggleDarkMode } = useAppStore();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token, user } = await authApi.login(email, password);
      login(token, user);

      // Map backend role → frontend route
      const roleKey = user.role.charAt(0).toUpperCase() + user.role.slice(1) as keyof typeof roleHomeMap;
      navigate(roleHomeMap[roleKey] ?? '/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to reach the server. Make sure the backend is running on port 4000.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
        <CardHeader className="space-y-3 text-center pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
            SV
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Shri Vivekanand College</CardTitle>
          <CardDescription className="text-sm">Attendance & Marks Management</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <h2 className="text-xl font-semibold mb-4">Welcome back</h2>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="name@college.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:underline dark:text-blue-400 font-medium">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Quick-login buttons for development convenience */}
          <div className="mt-6 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Dev quick-login (password: password123)</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Admin',   email: 'admin@college.ac.in' },
                { label: 'HOD',     email: 'hod.comp@college.ac.in' },
                { label: 'Faculty', email: 'suresh@college.edu' },
                { label: 'Student', email: 'rahul@college.edu' },
                { label: 'Parent',  email: 'parent.sharma@college.ac.in' },
              ].map(({ label, email: e }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setEmail(e); setPassword('password123'); }}
                  className="rounded px-2 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center pb-8 pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Shri Vivekanand College of Engineering <br /> Version 1.0.0
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
