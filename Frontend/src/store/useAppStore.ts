import { create } from 'zustand';
import type { AuthUser, BackendRole } from '@/lib/api';

// Map backend roles → frontend Role type used throughout the UI
const roleMap: Record<BackendRole, Role> = {
  admin:   'Admin',
  hod:     'HOD',
  faculty: 'Faculty',
  student: 'Student',
  parent:  'Parent',
};

export type Role = 'Admin' | 'HOD' | 'Faculty' | 'Student' | 'Parent' | 'Public';

interface AppState {
  // ── UI state ──────────────────────────────────────────────────────────────
  role: Role;
  setRole: (role: Role) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // ── Auth state ────────────────────────────────────────────────────────────
  token: string | null;
  user: AuthUser | null;

  /** Call after a successful POST /api/auth/login */
  login: (token: string, user: AuthUser) => void;

  /** Clears token, user, and resets role to Public */
  logout: () => void;

  /** True when a token exists in state (does not verify expiry) */
  isAuthenticated: boolean;
}

export const useAppStore = create<AppState>((set) => {
  // Rehydrate from localStorage so a page refresh keeps the user logged in
  const storedToken = localStorage.getItem('token');
  const storedUser  = localStorage.getItem('user');

  let initialToken: string | null = null;
  let initialUser:  AuthUser | null = null;
  let initialRole:  Role = 'Public';

  if (storedToken && storedUser) {
    try {
      initialUser  = JSON.parse(storedUser) as AuthUser;
      initialToken = storedToken;
      initialRole  = roleMap[initialUser.role] ?? 'Public';
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  return {
    // ── UI ──────────────────────────────────────────────────────────────────
    role: initialRole,
    setRole: (role) => set({ role }),

    isDarkMode: false,
    toggleDarkMode: () =>
      set((state) => {
        const next = !state.isDarkMode;
        document.documentElement.classList.toggle('dark', next);
        return { isDarkMode: next };
      }),

    sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    // ── Auth ────────────────────────────────────────────────────────────────
    token:           initialToken,
    user:            initialUser,
    isAuthenticated: initialToken !== null,

    login: (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user',  JSON.stringify(user));
      set({
        token,
        user,
        role: roleMap[user.role] ?? 'Public',
        isAuthenticated: true,
      });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, role: 'Public', isAuthenticated: false });
    },
  };
});
