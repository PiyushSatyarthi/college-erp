import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

/**
 * Layout-route style auth guard.
 * Used as <Route element={<RequireAuth />}> — renders <Outlet /> when
 * authenticated, redirects to /login otherwise.
 * AppLayout is never duplicated here; it lives only in the outer route.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
