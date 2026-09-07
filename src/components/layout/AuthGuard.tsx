import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/store/auth-store";

/**
 * Route guard for authenticated areas. Wrap protected routes with it:
 *
 *   { element: <AuthGuard />, children: [{ path: "dashboard", element: <Dashboard /> }] }
 *
 * Unauthenticated visitors are redirected to /login (create the page and
 * route when we build the auth screens) and returned to their original
 * target after signing in.
 */
export function AuthGuard() {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
