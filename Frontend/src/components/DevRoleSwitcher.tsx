import React from 'react';
import { useAppStore, Role } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';

const roles: Role[] = ['Admin', 'HOD', 'Faculty', 'Student', 'Parent', 'Public'];

export function DevRoleSwitcher() {
  const { role, setRole } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-2 w-48 rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10">
          <div className="mb-2 px-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Switch Role
          </div>
          <div className="flex flex-col space-y-1">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setOpen(false);
                  navigate(`/${r.toLowerCase()}`);
                }}
                className={`rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${
                  role === r
                    ? 'font-medium text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-auto items-center justify-center space-x-2 rounded-full bg-slate-900 px-4 text-sm font-medium text-white shadow-md transition-transform hover:scale-105 dark:bg-slate-100 dark:text-slate-900"
      >
        <span>Dev Role: {role}</span>
      </button>
    </div>
  );
}
